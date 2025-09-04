package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"gorm.io/gorm"
)

type KBOSyncService struct {
    db  *gorm.DB
    http *http.Client
}

func NewKBOSyncService(db *gorm.DB) *KBOSyncService {
    return &KBOSyncService{db: db, http: http.DefaultClient}
}

type kboCell struct { Text string `json:"Text"`; Class *string `json:"Class"` }
type kboRow struct { Row []kboCell `json:"row"` }
type kboResp struct { Rows []kboRow `json:"rows"` }

var reGame = regexp.MustCompile(`gameDate=(\d{8}).*?gameId=(\w+)`)
var reTime = regexp.MustCompile(`(\d{1,2}:\d{2})`)
var reParen = regexp.MustCompile(`\(([^\)]+)\)`)
// e.g. "롯데 <b>2 : 3</b> LG"
var reTeamScoreTag = regexp.MustCompile(`([가-힣A-Z]{1,10})\s*<b>\s*\d+\s*:\s*\d+\s*</b>\s*([가-힣A-Z]{1,10})`)

var stadiumWhitelist = map[string]struct{}{
    "잠실":{}, "문학":{}, "수원":{}, "대전":{}, "대구":{}, "창원":{}, "광주":{}, "고척":{}, "울산":{}, "포항":{}, "사직":{},
}

var teamCodeToName = map[string]string{
    "LT":"롯데", "LG":"LG", "NC":"NC", "KT":"KT", "HT":"KIA", "HH":"한화", "WO":"키움", "SS":"삼성", "OB":"두산", "SK":"SSG",
}

func (s *KBOSyncService) SyncMonth(ctx context.Context, season string, month string) error {
    if err := s.fetchAndUpsert(ctx, season, month, fmt.Sprintf("https://www.koreabaseball.com/ws/Schedule.asmx/GetScheduleList?leId=1&srIdList=0%%2C9%%2C6&seasonId=%s&gameMonth=%s&teamId=", season, month)); err == nil {
        return nil
    }
    return s.fetchAndUpsert(ctx, season, month, fmt.Sprintf("https://www.koreabaseball.com/ws/Schedule.asmx/GetMonthSchedule?leId=1&srIdList=0%%2C9%%2C6&seasonId=%s&gameMonth=%s", season, month))
}

func (s *KBOSyncService) fetchAndUpsert(ctx context.Context, season string, month string, url string) error {
    req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
    res, err := s.http.Do(req)
    if err != nil { return err }
    defer res.Body.Close()
    var payload kboResp
    if err := json.NewDecoder(res.Body).Decode(&payload); err != nil { return err }
    for _, r := range payload.Rows {
        // 날짜 문자열(예: 09.02(화))
        var dayText string
        if len(r.Row) > 0 && r.Row[0].Class != nil && *r.Row[0].Class == "day" {
            dayText = stripTags(r.Row[0].Text)
        }

        type acc struct {
            timeText   string
            playHTML   string
            linkHTML   strings.Builder
            stadiumTxt string
            bufHTML    strings.Builder
        }
        var cur *acc
        flush := func(a *acc) {
            if a == nil { return }
            all := a.bufHTML.String()
            gameId := ""
            gameDate := ""
            if m := reGame.FindStringSubmatch(a.linkHTML.String()); len(m) >= 3 {
                gameDate, gameId = m[1], m[2]
            } else if m := reGame.FindStringSubmatch(all); len(m) >= 3 {
                gameDate, gameId = m[1], m[2]
            }
            if gameDate == "" && dayText != "" {
                dd := extractDigits(dayText)
                if len(dd) >= 2 { gameDate = season + month + dd[len(dd)-2:] }
            }
            if gameId == "" || gameDate == "" { return }

            away, home := parseTeamsFromPlay(a.playHTML)
            if (away == "" || home == "") && a.playHTML != "" {
                if m := reTeamScoreTag.FindStringSubmatch(a.playHTML); len(m) >= 3 { away, home = m[1], m[2] }
            }
            if (away == "" || home == "") && all != "" {
                if m := reTeamScoreTag.FindStringSubmatch(all); len(m) >= 3 { away, home = m[1], m[2] }
            }
            if (away == "" || home == "") && gameId != "" {
                if aw, hm := parseTeamsFromGameID(gameId); aw != "" && hm != "" { away, home = aw, hm }
            }
            if away == "" || home == "" {
                away2, home2 := parseTeams(stripTags(all))
                if away == "" { away = away2 }
                if home == "" { home = home2 }
            }
            status := classifyStatus(stripTags(all), gameDate)
            var startSQL any = nil
            if a.timeText != "" {
                if t, err := time.Parse("15:04", a.timeText); err == nil { startSQL = t.Format("15:04:05") }
            } else {
                if m := reTime.FindStringSubmatch(stripTags(all)); len(m) >= 2 {
                    if t, err := time.Parse("15:04", m[1]); err == nil { startSQL = t.Format("15:04:05") }
                }
            }
            stadiumName := a.stadiumTxt
            if stadiumName == "" {
                // DOM에서 '구장' 열은 일반적으로 마지막 근처 텍스트로 존재
                doc := mustDoc(all)
                // a 태그/버튼/숫자 제거 후 텍스트만 모아 whitelist 매칭
                txt := stripTags(doc.Find("a,button").Remove().End().Text())
                for w := range stadiumWhitelist {
                    if strings.Contains(txt, w) { stadiumName = w; break }
                }
                if stadiumName == "" { stadiumName = extractStadium(doc, txt) }
            }
            if !isStadiumName(stadiumName) { stadiumName = "" }

            date, _ := time.Parse("20060102", gameDate)
            _ = s.db.WithContext(ctx).Exec(`
                INSERT INTO kbo_games(game_date, game_id, away_team_name, home_team_name, raw_html, status, stadium_name, start_time)
                VALUES(?,?,?,?,?,?,?,?)
                ON CONFLICT (game_id) DO UPDATE SET
                    game_date=excluded.game_date,
                    away_team_name=excluded.away_team_name,
                    home_team_name=excluded.home_team_name,
                    raw_html=excluded.raw_html,
                    status=excluded.status,
                    stadium_name=excluded.stadium_name,
                    start_time=excluded.start_time,
                    updated_at=NOW()
            `, date, gameId, away, home, all, status, stadiumName, startSQL).Error
        }

        // 셀을 좌→우로 훑으며 경기 그룹을 수집
        for idx, c := range r.Row {
            text := c.Text
            if text == "" { continue }
            if cur == nil { cur = &acc{} }
            cur.bufHTML.WriteString(text)
            cls := ""
            if c.Class != nil { cls = *c.Class }
            switch cls {
            case "day":
                // 이미 day 처리됨
            case "time":
                // 새 경기 시작 신호: 기존 acc flush
                if idx != 0 { flush(cur); }
                cur = &acc{}
                cur.timeText = stripTags(text)
                cur.bufHTML.WriteString(text)
            case "play":
                cur.playHTML = text
            default:
                if strings.Contains(text, "GameCenter") || strings.Contains(strings.ToLower(text), "preview") || strings.Contains(strings.ToLower(text), "review") {
                    cur.linkHTML.WriteString(text)
                }
                t := strings.TrimSpace(stripTags(text))
                if cur.stadiumTxt == "" && t != "" && t != "-" && isStadiumName(t) {
                    cur.stadiumTxt = t
                }
            }
        }
        // 마지막 누적 flush
        flush(cur)
    }
    return nil
}

func stripTags(s string) string {
    s = strings.ReplaceAll(s, "\n", " ")
    re := regexp.MustCompile(`<[^>]+>`)
    s = re.ReplaceAllString(s, " ")
    s = strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(s, " "))
    return s
}

func parseTeams(s string) (away, home string) {
    words := findKoreanWords(s)
    if len(words) >= 2 {
        away = words[0]
        home = words[len(words)-1]
    }
    return
}

func isKorean(s string) bool {
    for _, r := range s {
        if r >= 0xAC00 && r <= 0xD7A3 { return true }
    }
    return false
}

func classifyStatus(text string, yyyymmdd string) string {
    if strings.Contains(text, "경기종료") || strings.Contains(strings.ToLower(text), "end") { return "ended" }
    if d, err := time.Parse("20060102", yyyymmdd); err == nil {
        now := time.Now().In(time.FixedZone("KST", 9*3600))
        if d.Year() == now.Year() && d.Month() == now.Month() && d.Day() == now.Day() { return "today" }
        if d.Before(now) { return "ended" }
    }
    return "scheduled"
}

func extractTime(doc *goquery.Document, text string) *time.Time {
    var tm string
    doc.Find(".time").Each(func(_ int, sel *goquery.Selection) { if tm == "" { tm = strings.TrimSpace(sel.Text()) } })
    if tm == "" { if m := reTime.FindStringSubmatch(text); len(m) >= 2 { tm = m[1] } }
    if tm == "" { return nil }
    if t, err := time.Parse("15:04", tm); err == nil { return &t }
    if t, err := time.Parse("15:04:05", tm); err == nil { return &t }
    return nil
}

func extractStadium(doc *goquery.Document, text string) string {
    var st string
    doc.Find(".stadium, .ballpark").Each(func(_ int, sel *goquery.Selection) { if st == "" { st = strings.TrimSpace(sel.Text()) } })
    if st != "" { return st }
    if m := reParen.FindStringSubmatch(text); len(m) >= 2 { return strings.TrimSpace(m[1]) }
    return ""
}

func parseTeamsFromPlay(html string) (away, home string) {
    if html == "" { return "", "" }
    doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
    if err != nil { return "", "" }
    var names []string
    doc.Find("span").Each(func(_ int, sel *goquery.Selection) {
        // em 내부(span) 제외
        if sel.ParentsFiltered("em").Length() > 0 { return }
        t := strings.TrimSpace(sel.Text())
        if t == "" { return }
        // 한글만 추출
        t = firstKoreanWord(t)
        if t == "" { return }
        names = append(names, t)
    })
    if len(names) >= 2 {
        away = names[0]
        home = names[len(names)-1]
    }
    return
}

func looksLikeStadium(s string) bool {
    if !isKorean(s) { return false }
    if len([]rune(s)) > 8 { return false }
    if strings.ContainsAny(s, "0123456789:") { return false }
    return true
}

func isStadiumName(s string) bool {
    s = strings.TrimSpace(s)
    if s == "" { return false }
    // whitelist만 허용해 오탐(리뷰/프리뷰/하이라이트 등) 제거
    _, ok := stadiumWhitelist[s]
    return ok
}

func extractDigits(s string) string {
    b := make([]rune, 0, len(s))
    for _, r := range s {
        if r >= '0' && r <= '9' { b = append(b, r) }
    }
    return string(b)
}

var reKoreanWord = regexp.MustCompile(`([\x{AC00}-\x{D7A3}]+)`) // 연속 한글 단어

func firstKoreanWord(s string) string {
    m := reKoreanWord.FindStringSubmatch(s)
    if len(m) >= 2 { return m[1] }
    return ""
}

func findKoreanWords(s string) []string {
    ms := reKoreanWord.FindAllStringSubmatch(s, -1)
    out := make([]string, 0, len(ms))
    for _, m := range ms { if len(m) >= 2 { out = append(out, m[1]) } }
    return out
}

func mustDoc(html string) *goquery.Document {
    doc, _ := goquery.NewDocumentFromReader(strings.NewReader(html))
    return doc
}

// gameId 형태: YYYYMMDD AABB 0 (예: 20250902LTLG0)
func parseTeamsFromGameID(gameId string) (away, home string) {
    if len(gameId) < 13 { return "", "" }
    code := gameId[8:12]
    if len(code) != 4 { return "", "" }
    aw2 := code[0:2]
    hm2 := code[2:4]
    if n, ok := teamCodeToName[aw2]; ok { away = n }
    if n, ok := teamCodeToName[hm2]; ok { home = n }
    return
}



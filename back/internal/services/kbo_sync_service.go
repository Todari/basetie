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

type kboCell struct {
    Text string `json:"Text"`
}
type kboRow struct { Row []kboCell `json:"row"` }
type kboResp struct { Rows []kboRow `json:"rows"` }

var reGame = regexp.MustCompile(`gameDate=(\d{8}).*?gameId=(\w+)`)
var reTime = regexp.MustCompile(`(\d{1,2}:\d{2})`)
var reParen = regexp.MustCompile(`\(([^\)]+)\)`)

func (s *KBOSyncService) SyncMonth(ctx context.Context, season string, month string) error {
    // GetScheduleList(시작 시간 포함) 우선, 실패 시 GetMonthSchedule 폴백
    if err := s.fetchAndUpsert(ctx, fmt.Sprintf("https://www.koreabaseball.com/ws/Schedule.asmx/GetScheduleList?leId=1&srIdList=0%%2C9%%2C6&seasonId=%s&gameMonth=%s&teamId=", season, month)); err == nil {
        return nil
    }
    return s.fetchAndUpsert(ctx, fmt.Sprintf("https://www.koreabaseball.com/ws/Schedule.asmx/GetMonthSchedule?leId=1&srIdList=0%%2C9%%2C6&seasonId=%s&gameMonth=%s", season, month))
}

func (s *KBOSyncService) fetchAndUpsert(ctx context.Context, url string) error {
    req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
    res, err := s.http.Do(req)
    if err != nil { return err }
    defer res.Body.Close()
    var payload kboResp
    if err := json.NewDecoder(res.Body).Decode(&payload); err != nil { return err }
    for _, r := range payload.Rows {
        for _, c := range r.Row {
            if c.Text == "" { continue }
            m := reGame.FindStringSubmatch(c.Text)
            if len(m) < 3 { continue }
            gameDate := m[1]
            gameId := m[2]
            doc, err := goquery.NewDocumentFromReader(strings.NewReader(c.Text))
            if err != nil { continue }
            text := stripTags(c.Text)
            away, home := parseTeams(text)
            status := classifyStatus(text, gameDate)
            var tptr *time.Time
            if tm := extractTime(doc, text); tm != nil { tptr = tm }
            stadiumName := extractStadium(doc, text)
            date, _ := time.Parse("20060102", gameDate)
            var startSQL any = nil
            if tptr != nil { startSQL = tptr.Format("15:04:05") }
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
            `, date, gameId, away, home, c.Text, status, stadiumName, startSQL).Error
        }
    }
    return nil
}

func stripTags(s string) string {
    s = strings.ReplaceAll(s, "\n", " ")
    re := regexp.MustCompile(`<[^>]+>`)
    return re.ReplaceAllString(s, "")
}

func parseTeams(s string) (away, home string) {
    // heuristic: first and last korean token
    parts := strings.Fields(s)
    if len(parts) >= 4 {
        for i := len(parts)-1; i >= 0; i-- { if isKorean(parts[i]) { home = parts[i]; break } }
        for _, p := range parts { if isKorean(p) { away = p; break } }
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



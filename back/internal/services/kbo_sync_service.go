package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

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

func (s *KBOSyncService) SyncMonth(ctx context.Context, season string, month string) error {
    // leId: 1(정규), srIdList: 0,9,6(리그 항목), seasonId, gameMonth
    url := fmt.Sprintf("https://www.koreabaseball.com/ws/Schedule.asmx/GetMonthSchedule?leId=1&srIdList=0%%2C9%%2C6&seasonId=%s&gameMonth=%s", season, month)
    req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
    res, err := s.http.Do(req)
    if err != nil { return err }
    defer res.Body.Close()
    var payload kboResp
    if err := json.NewDecoder(res.Body).Decode(&payload); err != nil { return err }
    for _, r := range payload.Rows {
        for _, c := range r.Row {
            if c.Text == "" { continue }
            // match game link
            m := reGame.FindStringSubmatch(c.Text)
            if len(m) < 3 { continue }
            gameDate := m[1]
            gameId := m[2]
            // extract team names from li text
            text := stripTags(c.Text)
            // rough parse: "롯데 2 : 3 LG" → away, home at end
            away, home := parseTeams(text)
            date, _ := time.Parse("20060102", gameDate)
            _ = s.db.WithContext(ctx).Exec(`
                INSERT INTO kbo_games(game_date, game_id, away_team_name, home_team_name, raw_html)
                VALUES(?,?,?,?,?)
                ON CONFLICT (game_id) DO UPDATE SET game_date=excluded.game_date, away_team_name=excluded.away_team_name, home_team_name=excluded.home_team_name, raw_html=excluded.raw_html, updated_at=NOW()
            `, date, gameId, home, away, c.Text).Error
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
    // very simple heuristic: split by spaces and around ':'
    // example: "2 : 3 LG" at end, team names contain Korean chars
    parts := strings.Fields(s)
    if len(parts) >= 4 {
        // assume ... away score : score home
        home = parts[len(parts)-1]
        // find first korean word as away
        for _, p := range parts {
            if isKorean(p) { away = p; break }
        }
    }
    return
}

func isKorean(s string) bool {
    for _, r := range s {
        if r >= 0xAC00 && r <= 0xD7A3 { return true }
    }
    return false
}



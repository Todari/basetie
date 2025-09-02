package dtos

type CreateListingRequest struct {
    GameID    int64   `json:"game_id" binding:"required"`
    TeamID    int64   `json:"team_id" binding:"required"`
    Section   string  `json:"section" binding:"required"`
    Row       string  `json:"row" binding:"required"`
    SeatLabel string  `json:"seat_label" binding:"required"`
    Price     float64 `json:"price" binding:"required"`
    Note      *string `json:"note"`
}


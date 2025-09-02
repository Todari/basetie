package dtos

type OAuthRequest struct {
    IDToken string `json:"id_token" binding:"required"`
}

type RefreshRequest struct {
    Refresh string `json:"refresh" binding:"required"`
}

type ProfilePatch struct {
    Nickname       *string `json:"nickname"`
    FavoriteTeamID *int64  `json:"favorite_team_id"`
    Bio            *string `json:"bio"`
}

type PhoneRequest struct {
    Phone string `json:"phone" binding:"required"`
}



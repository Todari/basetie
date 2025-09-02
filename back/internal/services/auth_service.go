package services

import (
    "context"
    "errors"

    "golang.org/x/crypto/bcrypt"

    "github.com/Todari/basetie/internal/auth"
    "github.com/Todari/basetie/internal/config"
    "github.com/Todari/basetie/internal/domain/users"
    "github.com/Todari/basetie/internal/repo"
)

var (
    ErrEmailTaken        = errors.New("email already registered")
    ErrInvalidCredential = errors.New("invalid email or password")
)

type AuthService struct {
    cfg  *config.Config
    repo *repo.UserRepository
}

func NewAuthService(cfg *config.Config, repo *repo.UserRepository) *AuthService {
    return &AuthService{cfg: cfg, repo: repo}
}

func (s *AuthService) Register(ctx context.Context, email, password string) (auth.TokenPair, *users.User, error) {
    // check duplicate
    if _, err := s.repo.GetByEmail(ctx, email); err == nil {
        return auth.TokenPair{}, nil, ErrEmailTaken
    }

    hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil { return auth.TokenPair{}, nil, err }

    u := &users.User{Email: email, PasswordHash: string(hash), Status: "active"}
    if err := s.repo.CreateUser(ctx, u); err != nil { return auth.TokenPair{}, nil, err }
    p := &users.Profile{UserID: u.ID}
    _ = s.repo.CreateProfile(ctx, p)

    tokens, err := auth.GenerateTokenPair(u.ID, s.cfg.JWTSecret, s.cfg.AccessTokenTTLMinutes, s.cfg.RefreshTokenTTLMinutes)
    if err != nil { return auth.TokenPair{}, nil, err }
    return tokens, u, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (auth.TokenPair, *users.User, error) {
    u, err := s.repo.GetByEmail(ctx, email)
    if err != nil { return auth.TokenPair{}, nil, ErrInvalidCredential }
    if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)) != nil {
        return auth.TokenPair{}, nil, ErrInvalidCredential
    }
    tokens, err := auth.GenerateTokenPair(u.ID, s.cfg.JWTSecret, s.cfg.AccessTokenTTLMinutes, s.cfg.RefreshTokenTTLMinutes)
    if err != nil { return auth.TokenPair{}, nil, err }
    return tokens, u, nil
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (auth.TokenPair, error) {
    _, claims, err := auth.ParseAndValidate(refreshToken, s.cfg.JWTSecret, "refresh")
    if err != nil { return auth.TokenPair{}, err }
    sub, ok := claims["sub"].(float64)
    if !ok { return auth.TokenPair{}, errors.New("invalid sub") }
    tokens, err := auth.GenerateTokenPair(int64(sub), s.cfg.JWTSecret, s.cfg.AccessTokenTTLMinutes, s.cfg.RefreshTokenTTLMinutes)
    if err != nil { return auth.TokenPair{}, err }
    return tokens, nil
}



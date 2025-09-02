package services

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/Todari/basetie/internal/auth"
	"github.com/Todari/basetie/internal/config"
	"github.com/Todari/basetie/internal/domain/users"
	"github.com/Todari/basetie/internal/repo"
)

type OAuthService struct {
    cfg  *config.Config
    repo *repo.UserRepository
    http *http.Client
}

func NewOAuthService(cfg *config.Config, repo *repo.UserRepository) *OAuthService {
    return &OAuthService{cfg: cfg, repo: repo, http: http.DefaultClient}
}

type OAuthLoginInput struct {
    Provider string
    IDToken  string // Google, Apple
}

func (s *OAuthService) LoginWithIDToken(ctx context.Context, in OAuthLoginInput) (auth.TokenPair, *users.User, error) {
    provider := strings.ToLower(in.Provider)
    switch provider {
    case "google":
        return s.loginWithGoogle(ctx, in.IDToken)
    case "apple":
        return s.loginWithApple(ctx, in.IDToken)
    default:
        return auth.TokenPair{}, nil, fmt.Errorf("unsupported provider: %s", in.Provider)
    }
}

func (s *OAuthService) loginWithGoogle(ctx context.Context, idToken string) (auth.TokenPair, *users.User, error) {
    _, claims, err := auth.VerifyOIDCIDToken(auth.OIDCVerifyInput{
        HTTPClient:        s.http,
        JWKSURL:           "https://www.googleapis.com/oauth2/v3/certs",
        ExpectedIssuer:    "https://accounts.google.com",
        ExpectedAudience:  s.cfg.GoogleClientID,
        Token:             idToken,
    })
    if err != nil { return auth.TokenPair{}, nil, err }
    sub, _ := claims["sub"].(string)
    email, _ := claims["email"].(string)
    return s.ensureUserAndIssue(ctx, "google", sub, strPtrOrNil(email))
}

func (s *OAuthService) loginWithApple(ctx context.Context, idToken string) (auth.TokenPair, *users.User, error) {
    _, claims, err := auth.VerifyOIDCIDToken(auth.OIDCVerifyInput{
        HTTPClient:        s.http,
        JWKSURL:           "https://appleid.apple.com/auth/keys",
        ExpectedIssuer:    "https://appleid.apple.com",
        ExpectedAudience:  s.cfg.AppleBundleID,
        Token:             idToken,
    })
    if err != nil { return auth.TokenPair{}, nil, err }
    sub, _ := claims["sub"].(string)
    email, _ := claims["email"].(string)
    return s.ensureUserAndIssue(ctx, "apple", sub, strPtrOrNil(email))
}

func (s *OAuthService) ensureUserAndIssue(ctx context.Context, provider, providerUserID string, email *string) (auth.TokenPair, *users.User, error) {
    u, err := s.repo.GetUserByProvider(ctx, provider, providerUserID)
    if err != nil {
        // create
        u = &users.User{Email: "", PasswordHash: "", Status: "active"}
        if email != nil && *email != "" { u.Email = *email }
        if err := s.repo.CreateUser(ctx, u); err != nil { return auth.TokenPair{}, nil, err }
        _ = s.repo.CreateProfile(ctx, &users.Profile{UserID: u.ID})
        if err := s.repo.LinkUserProvider(ctx, u.ID, provider, providerUserID, email); err != nil { return auth.TokenPair{}, nil, err }
    }
    tokens, err := auth.GenerateTokenPair(u.ID, s.cfg.JWTSecret, s.cfg.AccessTokenTTLMinutes, s.cfg.RefreshTokenTTLMinutes)
    if err != nil { return auth.TokenPair{}, nil, err }
    return tokens, u, nil
}

func strPtrOrNil(s string) *string {
    if s == "" { return nil }
    return &s
}



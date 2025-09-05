package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
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
    IDToken  string // Google, Apple, Kakao
}

func (s *OAuthService) LoginWithIDToken(ctx context.Context, in OAuthLoginInput) (auth.TokenPair, *users.User, error) {
    provider := strings.ToLower(in.Provider)
    switch provider {
    case "google":
        return s.loginWithGoogle(ctx, in.IDToken)
    case "apple":
        return s.loginWithApple(ctx, in.IDToken)
    case "kakao":
        return s.loginWithKakao(ctx, in.IDToken)
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

func (s *OAuthService) loginWithKakao(ctx context.Context, idToken string) (auth.TokenPair, *users.User, error) {
    // Kakao는 OIDC가 아닌 자체 토큰 검증 방식을 사용
    // 실제 구현에서는 Kakao API를 통해 토큰을 검증해야 함
    // 여기서는 간단히 토큰을 파싱하여 사용자 정보를 추출
    // TODO: 실제 Kakao API 연동 구현 필요
    
    // 임시로 토큰에서 사용자 ID를 추출 (실제로는 Kakao API 호출 필요)
    // Kakao 토큰 형식: "kakao_{user_id}"
    if !strings.HasPrefix(idToken, "kakao_") {
        return auth.TokenPair{}, nil, fmt.Errorf("invalid kakao token format")
    }
    
    providerUserID := strings.TrimPrefix(idToken, "kakao_")
    if providerUserID == "" {
        return auth.TokenPair{}, nil, fmt.Errorf("invalid kakao user id")
    }
    
    // Kakao는 이메일이 없을 수 있으므로 nil로 처리
    return s.ensureUserAndIssue(ctx, "kakao", providerUserID, nil)
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

func (s *OAuthService) GetGoogleClientID() string {
    return s.cfg.GoogleClientID
}

func (s *OAuthService) GetRedirectURI() string {
    return "http://localhost:8090/v1/auth/oauth/google/callback"
}

func (s *OAuthService) HandleGoogleCallback(ctx context.Context, code string) (auth.TokenPair, *users.User, error) {
    // 1. Authorization code로 access token 교환
    tokenURL := "https://oauth2.googleapis.com/token"
    data := url.Values{}
    data.Set("client_id", s.cfg.GoogleClientID)
    data.Set("client_secret", s.cfg.GoogleClientSecret)
    data.Set("code", code)
    data.Set("grant_type", "authorization_code")
    data.Set("redirect_uri", s.GetRedirectURI())
    
    resp, err := s.http.PostForm(tokenURL, data)
    if err != nil {
        return auth.TokenPair{}, nil, fmt.Errorf("failed to exchange code for token: %v", err)
    }
    defer resp.Body.Close()
    
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return auth.TokenPair{}, nil, fmt.Errorf("failed to read token response: %v", err)
    }
    
    var tokenResp struct {
        AccessToken  string `json:"access_token"`
        IDToken      string `json:"id_token"`
        RefreshToken string `json:"refresh_token"`
        Error        string `json:"error"`
    }
    
    if err := json.Unmarshal(body, &tokenResp); err != nil {
        return auth.TokenPair{}, nil, fmt.Errorf("failed to parse token response: %v", err)
    }
    
    if tokenResp.Error != "" {
        return auth.TokenPair{}, nil, fmt.Errorf("token exchange error: %s", tokenResp.Error)
    }
    
    // 2. ID token 검증 및 사용자 정보 추출
    _, claims, err := auth.VerifyOIDCIDToken(auth.OIDCVerifyInput{
        HTTPClient:        s.http,
        JWKSURL:           "https://www.googleapis.com/oauth2/v3/certs",
        ExpectedIssuer:    "https://accounts.google.com",
        ExpectedAudience:  s.cfg.GoogleClientID,
        Token:             tokenResp.IDToken,
    })
    if err != nil {
        return auth.TokenPair{}, nil, fmt.Errorf("failed to verify ID token: %v", err)
    }
    
    sub, _ := claims["sub"].(string)
    email, _ := claims["email"].(string)
    
    // 3. 사용자 생성/조회 및 JWT 발급
    return s.ensureUserAndIssue(ctx, "google", sub, strPtrOrNil(email))
}

func strPtrOrNil(s string) *string {
    if s == "" { return nil }
    return &s
}



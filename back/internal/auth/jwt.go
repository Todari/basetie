package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type TokenPair struct {
    AccessToken  string
    RefreshToken string
}

func GenerateTokenPair(userID int64, secret string, accessTTLMinutes, refreshTTLMinutes int) (TokenPair, error) {
    now := time.Now()

    access := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "sub": userID,
        "type": "access",
        "iat": now.Unix(),
        "exp": now.Add(time.Duration(accessTTLMinutes) * time.Minute).Unix(),
    })
    refresh := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "sub": userID,
        "type": "refresh",
        "iat": now.Unix(),
        "exp": now.Add(time.Duration(refreshTTLMinutes) * time.Minute).Unix(),
    })

    accessStr, err := access.SignedString([]byte(secret))
    if err != nil { return TokenPair{}, err }
    refreshStr, err := refresh.SignedString([]byte(secret))
    if err != nil { return TokenPair{}, err }
    return TokenPair{AccessToken: accessStr, RefreshToken: refreshStr}, nil
}

func ParseAndValidate(tokenStr, secret, expectedType string) (*jwt.Token, jwt.MapClaims, error) {
    parser := jwt.NewParser()
    token, err := parser.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
        return []byte(secret), nil
    })
    if err != nil { return nil, nil, err }
    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok || !token.Valid { return nil, nil, jwt.ErrTokenInvalidClaims }
    if claims["type"] != expectedType { return nil, nil, jwt.ErrTokenInvalidClaims }
    return token, claims, nil
}



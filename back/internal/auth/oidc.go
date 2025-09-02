package auth

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rsa"
	"encoding/base64"
	"errors"
	"math/big"
	"net/http"
	"time"

	"io"

	"github.com/golang-jwt/jwt/v5"
	"github.com/tidwall/gjson"
)

func fetchJWKS(httpClient *http.Client, url string) (string, error) {
    resp, err := httpClient.Get(url)
    if err != nil { return "", err }
    defer resp.Body.Close()
    if resp.StatusCode != 200 { return "", errors.New("jwks fetch failed") }
    b, err := io.ReadAll(resp.Body)
    if err != nil { return "", err }
    return string(b), nil
}

func parseRSAPublicKey(nB64, eB64 string) (*rsa.PublicKey, error) {
    nBytes, err := base64.RawURLEncoding.DecodeString(nB64)
    if err != nil { return nil, err }
    eBytes, err := base64.RawURLEncoding.DecodeString(eB64)
    if err != nil { return nil, err }
    n := new(big.Int).SetBytes(nBytes)
    var e int
    for _, b := range eBytes { e = e<<8 + int(b) }
    return &rsa.PublicKey{N: n, E: e}, nil
}

func parseECPublicKey(crv, xB64, yB64 string) (*ecdsa.PublicKey, error) {
    var curve elliptic.Curve
    switch crv {
    case "P-256": curve = elliptic.P256()
    case "P-384": curve = elliptic.P384()
    case "P-521": curve = elliptic.P521()
    default: return nil, errors.New("unsupported curve")
    }
    xBytes, err := base64.RawURLEncoding.DecodeString(xB64)
    if err != nil { return nil, err }
    yBytes, err := base64.RawURLEncoding.DecodeString(yB64)
    if err != nil { return nil, err }
    x := new(big.Int).SetBytes(xBytes)
    y := new(big.Int).SetBytes(yBytes)
    return &ecdsa.PublicKey{Curve: curve, X: x, Y: y}, nil
}

type OIDCVerifyInput struct {
    HTTPClient *http.Client
    JWKSURL    string
    ExpectedIssuer string
    ExpectedAudience string
    Token string
}

func VerifyOIDCIDToken(in OIDCVerifyInput) (*jwt.Token, jwt.MapClaims, error) {
    if in.HTTPClient == nil { in.HTTPClient = http.DefaultClient }
    jwksJSON, err := fetchJWKS(in.HTTPClient, in.JWKSURL)
    if err != nil { return nil, nil, err }
    keyfunc := func(t *jwt.Token) (interface{}, error) {
        kid, _ := t.Header["kid"].(string)
        if kid == "" { return nil, errors.New("missing kid") }
        // find key by kid
        path := "keys.#(kid==`" + kid + "`)"
        res := gjson.Get(jwksJSON, path)
        if !res.Exists() { return nil, errors.New("kid not found") }
        k := res.Array()[0]
        kty := k.Get("kty").String()
        switch kty {
        case "RSA":
            n := k.Get("n").String(); e := k.Get("e").String()
            return parseRSAPublicKey(n, e)
        case "EC":
            crv := k.Get("crv").String(); x := k.Get("x").String(); y := k.Get("y").String()
            return parseECPublicKey(crv, x, y)
        default:
            return nil, errors.New("unsupported kty")
        }
    }
    parser := jwt.NewParser(jwt.WithIssuedAt(), jwt.WithExpirationRequired())
    token, err := parser.Parse(in.Token, keyfunc)
    if err != nil { return nil, nil, err }
    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok || !token.Valid { return nil, nil, jwt.ErrTokenInvalidClaims }
    // iss
    if iss, _ := claims["iss"].(string); iss != in.ExpectedIssuer { return nil, nil, errors.New("invalid iss") }
    // aud validation (skip if ExpectedAudience is empty for local/dev)
    if in.ExpectedAudience != "" {
        switch aud := claims["aud"].(type) {
        case string:
            if aud != in.ExpectedAudience { return nil, nil, errors.New("invalid aud") }
        case []interface{}:
            ok := false
            for _, a := range aud { if s, _ := a.(string); s == in.ExpectedAudience { ok = true; break } }
            if !ok { return nil, nil, errors.New("invalid aud") }
        default:
            return nil, nil, errors.New("invalid aud type")
        }
    }
    // exp check (jwt lib already validates, but re-check)
    if exp, _ := claims["exp"].(float64); time.Unix(int64(exp),0).Before(time.Now()) { return nil, nil, errors.New("expired") }
    return token, claims, nil
}



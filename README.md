# Basetie

KBO 야구 티켓 팬투팬 정가 양도 플랫폼(B2C/C2C). 신고/제재 중심으로 웃돈 거래 억제, 커뮤니티와 연결해 선순환을 지향합니다.

## 구조
- back/: Go(Gin, GORM, JWT), Postgres, Migrations, OpenAPI
- docs/: PRD/아키텍처/데이터 모델/상태 머신/가이드/ADR
- front/: React Native(Expo) — 추후 추가

## 빠른 시작 (Backend)
1) Postgres 실행: `cd back && docker compose up -d`
2) 마이그레이션: `make migrate-up`
3) 시드: `JWT_SECRET=dev DATABASE_URL=postgres://postgres:postgres@localhost:55432/basetie?sslmode=disable go run ./internal/tools/seed`
4) 서버: `PORT=8089 GOOGLE_CLIENT_ID=... APPLE_BUNDLE_ID=... JWT_SECRET=... go run ./cmd/server`
5) health: `curl http://localhost:8089/healthz`

## 주요 문서
- 제품: `docs/PRD.md`
- 백엔드: `docs/Architecture-Backend.md`
- 프론트: `docs/Architecture-Frontend.md`
- 데이터: `docs/Data-Model.md`, `docs/State-Machines.md`
- API 요약: `docs/API.md` (상세 `back/openapi.yaml`)
- 개발/컨벤션: `docs/Dev-Guide.md`, `docs/Conventions.md`
- 보안/운영: `docs/Security-Operations.md`
- ADR: `docs/ADR/0001-oauth-first.md`
- 환경: `docs/ENV.md`

## 라이선스
TBD

# syntax=docker/dockerfile:1

FROM golang:1.24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git ca-certificates
COPY go.mod go.sum ./
RUN go mod download
COPY . .
ENV GOTOOLCHAIN=auto
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server ./cmd/server

FROM gcr.io/distroless/base-debian12
WORKDIR /app
COPY --from=builder /app/server /app/server
COPY internal/tools/seed/kbo_seed.json /app/seed/kbo_seed.json
ENV PORT=8090
EXPOSE 8090
USER 65532:65532
ENTRYPOINT ["/app/server"]



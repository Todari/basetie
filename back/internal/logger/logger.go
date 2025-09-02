package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type Logger = zap.SugaredLogger

func New() (*Logger, error) {
    cfg := zap.NewProductionConfig()
    cfg.Level = zap.NewAtomicLevelAt(zapcore.InfoLevel)
    l, err := cfg.Build()
    if err != nil {
        return nil, err
    }
    return l.Sugar(), nil
}

// helpers passthrough to avoid importing zap in other packages
func Error(err error) zap.Field { return zap.Error(err) }
func String(key, val string) zap.Field { return zap.String(key, val) }



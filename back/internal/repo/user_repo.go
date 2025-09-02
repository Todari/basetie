package repo

import (
	"context"

	"gorm.io/gorm"

	"github.com/Todari/basetie/internal/domain/users"
)

type UserRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository { return &UserRepository{db: db} }

func (r *UserRepository) CreateUser(ctx context.Context, u *users.User) error {
    return r.db.WithContext(ctx).Create(u).Error
}

func (r *UserRepository) CreateProfile(ctx context.Context, p *users.Profile) error {
    return r.db.WithContext(ctx).Create(p).Error
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*users.User, error) {
    var u users.User
    if err := r.db.WithContext(ctx).Where("email = ?", email).First(&u).Error; err != nil {
        return nil, err
    }
    return &u, nil
}

func (r *UserRepository) GetProfile(ctx context.Context, userID int64) (*users.Profile, error) {
    var p users.Profile
    if err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&p).Error; err != nil {
        return nil, err
    }
    return &p, nil
}

func (r *UserRepository) UpsertProfile(ctx context.Context, p *users.Profile) error {
    return r.db.WithContext(ctx).Save(p).Error
}

type UserProvider struct {
    ID             int64  `gorm:"primaryKey"`
    UserID         int64  `gorm:"index;not null"`
    Provider       string `gorm:"not null"`
    ProviderUserID string `gorm:"not null"`
    Email          *string
}

func (r *UserRepository) GetUserByProvider(ctx context.Context, provider, providerUserID string) (*users.User, error) {
    var up UserProvider
    if err := r.db.WithContext(ctx).Table("user_providers").Where("provider = ? AND provider_user_id = ?", provider, providerUserID).First(&up).Error; err != nil {
        return nil, err
    }
    var u users.User
    if err := r.db.WithContext(ctx).First(&u, up.UserID).Error; err != nil {
        return nil, err
    }
    return &u, nil
}

func (r *UserRepository) LinkUserProvider(ctx context.Context, userID int64, provider, providerUserID string, email *string) error {
    return r.db.WithContext(ctx).Exec("INSERT INTO user_providers(user_id, provider, provider_user_id, email) VALUES(?, ?, ?, ?) ON CONFLICT (provider, provider_user_id) DO NOTHING", userID, provider, providerUserID, email).Error
}

func (r *UserRepository) SetUserPhone(ctx context.Context, userID int64, phone string) error {
    return r.db.WithContext(ctx).Exec("UPDATE users SET phone = ? WHERE id = ?", phone, userID).Error
}



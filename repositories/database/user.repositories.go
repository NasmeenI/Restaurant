package database

import (
	"context"
	"time"

	"github.com/NasmeenI/finalProject/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type userRepo struct {
	database *mongo.Collection
}

type UserRepo interface {
	Login(username string, password string) (models.User, error)
	CreateUser(user models.User) error
}

func NewUserRepo(database *mongo.Collection) UserRepo {
	return &userRepo{
		database: database,
	}
}

func (r *userRepo) Login(email string, password string) (models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	u := models.User{}

	filter := bson.M{"email": email, "password": password}
	err := r.database.FindOne(ctx, filter).Decode(&u)
	if err != nil {
		return models.User{}, err
	}
	return u, nil
}

func (r *userRepo) CreateUser(user models.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	user.ID = primitive.NewObjectID()
	user.UpdatedAt = time.Now()
	_, err := r.database.InsertOne(ctx, user)
	if err != nil {
		return err
	}
	return nil
}

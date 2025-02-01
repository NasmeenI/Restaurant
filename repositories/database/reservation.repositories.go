package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/NasmeenI/finalProject/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type reservationRepo struct {
	database *mongo.Collection
}

type ReservationRepo interface {
	CheckUserReservationLimit(userId string) error
	CreateReserve(user models.User, restaurantId string, reservation models.Reservation) error
}

func NewReservationRepo(database *mongo.Collection) ReservationRepo {
	return &reservationRepo{
		database: database,
	}
}

func (r *reservationRepo) CheckUserReservationLimit(userId string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectUserId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		log.Fatalf("Invalid ObjectID: %v", err)
	}

	filter := bson.M{"user_id": objectUserId}
	count, err := r.database.CountDocuments(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to count reservations: %v", err)
	}

	// ถ้ามีการจองมากกว่าหรือเท่ากับ 3 ครั้ง ให้คืนค่า true
	if count > 3 {
		return fmt.Errorf("user %v has more than 3 reservations", userId)
	}
	return nil
}

func (r *reservationRepo) CreateReserve(user models.User, restaurantId string, reservation models.Reservation) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectRestaurantId, err := primitive.ObjectIDFromHex(restaurantId)
	if err != nil {
		log.Fatalf("Invalid ObjectID: %v", err)
	}

	reservation.ID = primitive.NewObjectID()
	reservation.UserId = user.ID
	reservation.RestaurantId = objectRestaurantId
	reservation.UpdatedAt = time.Now()
	_, err = r.database.InsertOne(ctx, reservation)
	if err != nil {
		return err
	}
	return nil
}

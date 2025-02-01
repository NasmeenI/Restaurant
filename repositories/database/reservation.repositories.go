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
	GetReservations() ([]models.Reservation, error)
	GetReservationById(id string) (models.Reservation, error)
	GetReservationsByUser(user models.User) ([]models.Reservation, error)
	CheckUserReservationLimit(userId string) error
	CreateReserve(user models.User, restaurantId string, reservation models.Reservation) error
	UpdateReservation(id string, restaurant models.Reservation) error
	DeleteLReservation(id string) error
}

func NewReservationRepo(database *mongo.Collection) ReservationRepo {
	return &reservationRepo{
		database: database,
	}
}

func (r *reservationRepo) GetReservations() ([]models.Reservation, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}
	cursor, err := r.database.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	results := []models.Reservation{}
	if err := cursor.All(context.TODO(), &results); err != nil {
		return nil, err
	}
	return results, nil
}

func (r *reservationRepo) GetReservationById(id string) (models.Reservation, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Fatalf("Invalid ObjectID: %v", err)
	}

	filter := bson.M{"_id": objectId}
	result := models.Reservation{}
	if err := r.database.FindOne(ctx, filter).Decode(&result); err != nil {
		return models.Reservation{}, err
	}
	return result, nil
}

func (r *reservationRepo) GetReservationsByUser(user models.User) ([]models.Reservation, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	log.Println("user_id", user.ID.Hex())
	filter := bson.M{"user_id": user.ID}
	var reservations []models.Reservation

	cursor, err := r.database.Find(ctx, filter)
	if err != nil {
		return []models.Reservation{}, nil
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var reservation models.Reservation
		if err := cursor.Decode(&reservation); err != nil {
			return nil, err
		}
		reservations = append(reservations, reservation)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}
	return reservations, nil
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

	if count >= 3 {
		return fmt.Errorf("user %v has more than 3 reservations", userId)
	}
	return nil
}

func (r *reservationRepo) CreateReserve(user models.User, restaurantId string, reservation models.Reservation) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectReservationId, err := primitive.ObjectIDFromHex(restaurantId)
	if err != nil {
		log.Fatalf("Invalid ObjectID: %v", err)
	}

	reservation.ID = primitive.NewObjectID()
	reservation.UserId = user.ID
	reservation.RestaurantId = objectReservationId
	reservation.UpdatedAt = time.Now()
	_, err = r.database.InsertOne(ctx, reservation)
	if err != nil {
		return err
	}
	return nil
}

func (r *reservationRepo) UpdateReservation(id string, reservation models.Reservation) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Fatalf("Invalid ObjectID: %v", err)
	}

	reservation.UpdatedAt = time.Now()

	updateData := bson.M{
		"user_id":       reservation.UserId,
		"restaurant_id": reservation.RestaurantId,
		"date":          reservation.Date,
		"updatedAt":     reservation.UpdatedAt,
	}

	filter := bson.M{"_id": objectId}
	update := bson.M{"$set": updateData}
	result, err := r.database.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if result.ModifiedCount == 0 {
		return fmt.Errorf("no reservation found to update")
	}
	return nil
}

func (r *reservationRepo) DeleteLReservation(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Fatalf("Invalid ObjectID: %v", err)
	}

	filter := bson.M{"_id": objectId}
	result, err := r.database.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return fmt.Errorf("no reservation found to delete")
	}
	return nil
}

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

type restaurantRepo struct {
	database *mongo.Collection
}

type RestaurantRepo interface {
	GetRestaurants() ([]models.Restaurant, error)
	GetRestaurantById(id string) (models.Restaurant, error)
	CreateRestaurants(restaurants []models.Restaurant) ([]models.Restaurant, error)
	UpdateRestaurant(id string, restaurant models.Restaurant) error
	DeleteLRestaurant(id string) error
}

func NewRestaurantRepo(database *mongo.Collection) RestaurantRepo {
	return &restaurantRepo{
		database: database,
	}
}

func (r *restaurantRepo) GetRestaurants() ([]models.Restaurant, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}
	cursor, err := r.database.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	results := []models.Restaurant{}
	if err := cursor.All(context.TODO(), &results); err != nil {
		return nil, err
	}
	return results, nil
}

func (r *restaurantRepo) GetRestaurantById(id string) (models.Restaurant, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Fatalf("Invalid ObjectID: %v", err)
	}

	filter := bson.M{"_id": objectId}
	result := models.Restaurant{}
	if err := r.database.FindOne(ctx, filter).Decode(&result); err != nil {
		return models.Restaurant{}, err
	}
	return result, nil
}

func (r *restaurantRepo) CreateRestaurants(restaurants []models.Restaurant) ([]models.Restaurant, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	restaurantDocs := make([]interface{}, len(restaurants))
	for i := range restaurants {
		restaurants[i].ID = primitive.NewObjectID()
		restaurants[i].UpdatedAt = time.Now()
		restaurantDocs[i] = restaurants[i]
	}

	_, err := r.database.InsertMany(ctx, restaurantDocs)
	if err != nil {
		return []models.Restaurant{}, err
	}

	return restaurants, nil
}

func (r *restaurantRepo) UpdateRestaurant(id string, restaurant models.Restaurant) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Fatalf("Invalid ObjectID: %v", err)
	}

	restaurant.UpdatedAt = time.Now()

	updateData := bson.M{
		"name":      restaurant.Name,
		"address":   restaurant.Address,
		"phone":     restaurant.PhoneNumber,
		"openTime":  restaurant.OpenTime,
		"closeTime": restaurant.CloseTime,
		"updatedAt": restaurant.UpdatedAt,
	}

	filter := bson.M{"_id": objectId}
	update := bson.M{"$set": updateData}
	result, err := r.database.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if result.ModifiedCount == 0 {
		return fmt.Errorf("no restaurant found to update")
	}
	return nil
}

func (r *restaurantRepo) DeleteLRestaurant(id string) error {
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
		return fmt.Errorf("no restaurant found to delete")
	}
	return nil
}

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
	"go.mongodb.org/mongo-driver/mongo/options"
)

type restaurantRepo struct {
	database *mongo.Collection
}

type RestaurantRepo interface {
	GetRestaurants() ([]models.Restaurant, error)
	GetRestaurantById(id string) (models.Restaurant, error)
	GetRestaurantsByCategory(category string) ([]models.Restaurant, error)
	CreateRestaurants(restaurants []models.Restaurant) ([]models.Restaurant, error)
	UpdateRestaurant(id string, restaurant models.Restaurant) error
	DeleteLRestaurant(id string) error

	GetFoodById(restaurantId string, foodId string) (models.Food, error)
	AddFoods(restaurantId string, foods []models.Food) error
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

func (r *restaurantRepo) GetRestaurantsByCategory(category string) ([]models.Restaurant, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"category": category}
	cursor, err := r.database.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	restaurants := []models.Restaurant{}
	if err := cursor.All(context.TODO(), &restaurants); err != nil {
		return nil, err
	}
	return restaurants, nil
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

func (r *restaurantRepo) GetFoodById(restaurantId, foodId string) (models.Food, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	restaurantObjectId, err := primitive.ObjectIDFromHex(restaurantId)
	if err != nil {
		log.Printf("Invalid Restaurant ObjectID: %v", err)
		return models.Food{}, err
	}

	foodObjectId, err := primitive.ObjectIDFromHex(foodId)
	if err != nil {
		log.Printf("Invalid Food ObjectID: %v", err)
		return models.Food{}, err
	}

	filter := bson.M{
		"_id":       restaurantObjectId,
		"foods._id": foodObjectId,
	}

	projection := bson.M{
		"foods.$": 1,
	}

	var result struct {
		Foods []models.Food `bson:"foods"`
	}

	err = r.database.FindOne(ctx, filter, options.FindOne().SetProjection(projection)).Decode(&result)
	if err != nil {
		return models.Food{}, err
	}

	if len(result.Foods) == 0 {
		return models.Food{}, fmt.Errorf("food not found")
	}

	return result.Foods[0], nil
}

func (r *restaurantRepo) AddFoods(restaurantId string, foods []models.Food) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectId, err := primitive.ObjectIDFromHex(restaurantId)
	if err != nil {
		return fmt.Errorf("invalid ObjectID: %v", err)
	}

	for i := range foods {
		foods[i].ID = primitive.NewObjectID()
		foods[i].UpdatedAt = time.Now()
	}

	filter := bson.M{"_id": objectId}
	update := bson.M{"$push": bson.M{"foods": bson.M{"$each": foods}}, "$set": bson.M{"updatedAt": time.Now()}}

	result, err := r.database.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	if result.ModifiedCount == 0 {
		return fmt.Errorf("no restaurant found to update")
	}

	return nil
}

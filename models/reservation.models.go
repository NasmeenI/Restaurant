package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Reservation struct {
	ID           primitive.ObjectID `json:"id" bson:"_id"`
	UserId       primitive.ObjectID `json:"user_id" bson:"user_id"`
	RestaurantId primitive.ObjectID `json:"restaurant_id" bson:"restaurant_id"`
	Date         time.Time          `json:"date" bson:"date"`
	UpdatedAt    time.Time          `json:"updatedAt" bson:"updatedAt"`
}

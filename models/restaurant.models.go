package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Restaurant struct {
	ID          primitive.ObjectID `json:"id" bson:"_id"`
	Name        string             `json:"name" bson:"name"`
	Description string             `json:"description" bson:"description"`
	Category    string             `json:"category" bson:"category"`
	Address     string             `json:"address" bson:"address"`
	PhoneNumber string             `json:"phone_number" bson:"phone_number"`
	OpenTime    time.Time          `json:"open_time" bson:"open_time"`
	CloseTime   time.Time          `json:"close_time" bson:"close_time"`
	Foods       []Food             `json:"foods" bson:"foods"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type Food struct {
	ID          primitive.ObjectID `json:"id" bson:"_id"`
	Name        string             `json:"name" bson:"name"`
	Description string             `json:"description" bson:"description"`
	Price       int                `json:"price" bson:"price"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}

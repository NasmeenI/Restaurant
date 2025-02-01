package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Restaurant struct {
	ID          primitive.ObjectID `json:"id" bson:"_id"`
	Name        string             `json:"name" bson:"name"`
	Address     string             `json:"address" bson:"address"`
	PhoneNumber string             `json:"phone_number" bson:"phone_number"`
	OpenTime    time.Time          `json:"open_time" bson:"open_time"`
	CloseTime   time.Time          `json:"close_time" bson:"close_time"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}

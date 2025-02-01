package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID          primitive.ObjectID `json:"id" bson:"_id"`
	Email       string             `json:"email" bson:"email"`
	Password    string             `json:"password" bson:"password"`
	Role        string             `json:"role" bson:"role"`
	Username    string             `json:"username" bson:"username"`
	PhoneNumber string             `json:"phone_number" bson:"phone_number"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}

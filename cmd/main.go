package main

import (
	"log"

	"github.com/NasmeenI/finalProject/configs"
	"github.com/NasmeenI/finalProject/middleware"
	"github.com/NasmeenI/finalProject/repositories/database"
	"github.com/NasmeenI/finalProject/routes"
	"github.com/NasmeenI/finalProject/services/authen"
	"github.com/NasmeenI/finalProject/services/restaurant"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize a new MongoDB client. (Database)
	mongoClient, err := configs.NewMongoClient()
	if err != nil {
		log.Fatalf("Could not create MongoDB client: %v", err)
	}

	// Initialize a new repositories
	userRepo := database.NewUserRepo(mongoClient.User)
	restaurantRepo := database.NewRestaurantRepo(mongoClient.Restaurant)

	// Initialize a new services
	authenService := authen.NewAuthenService(userRepo)
	restaurantService := restaurant.NewRestaurantService(restaurantRepo)

	// Initialize a new client for firebase authentication
	middleware := middleware.NewAuthMiddleware()

	// Initialize a routes
	r := gin.Default()
	r.Use(configs.EnableCORS())
	routes.AuthenRoute(r, middleware, authenService)
	routes.RestaurantRoute(r, middleware, restaurantService)

	log.Fatal(r.Run(":" + configs.GetEnv("GO_PORT")))
}

package main

import (
	"log"
	"net/http"

	"github.com/NasmeenI/finalProject/configs"
	"github.com/NasmeenI/finalProject/middleware"
	"github.com/NasmeenI/finalProject/repositories/database"
	"github.com/NasmeenI/finalProject/routes"
	"github.com/NasmeenI/finalProject/services/authen"
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

	// Initialize a new services
	authenService := authen.NewAuthenService(userRepo)

	// Initialize a new client for firebase authentication
	middleware := middleware.NewAuthMiddleware()

	// Initialize a routes
	r := gin.Default()
	r.Use(configs.EnableCORS())
	routes.AuthenRoute(r, middleware, authenService)

	// // Middleware to check JWT on every request
	// r.Use(authMiddleware())

	// // Protected routes
	// r.GET("/api/general", handleGeneralResource)
	// r.GET("/api/admin", adminMiddleware(), handleAdminResource)

	log.Fatal(r.Run(":" + configs.GetEnv("GO_PORT")))
}

func handleGeneralResource(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "General resource accessed successfully",
	})
}

func handleAdminResource(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Admin resource accessed successfully",
	})
}

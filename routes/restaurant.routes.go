package routes

import (
	"github.com/NasmeenI/finalProject/controllers"
	"github.com/NasmeenI/finalProject/middleware"
	"github.com/NasmeenI/finalProject/services/restaurant"
	"github.com/gin-gonic/gin"
)

func RestaurantRoute(r *gin.Engine, middleware middleware.AuthMiddleware, restaurantService restaurant.RestaurantService) {
	RestaurantController := controllers.NewRestaurantController(restaurantService)

	rg := r.Group("/restaurant")
	rg.Use(middleware.AuthMiddleware())
	{
		rg.GET("/", RestaurantController.GetRestaurants)
		rg.GET("/:id", middleware.AdminMiddleware(), RestaurantController.GetRestaurantById)
		rg.POST("/", middleware.AdminMiddleware(), RestaurantController.CreateRestaurants)
		rg.PUT("/:id", middleware.AdminMiddleware(), RestaurantController.UpdateRestaurant)
		rg.DELETE("/:id", middleware.AdminMiddleware(), RestaurantController.DeleteLRestaurant)
	}
}

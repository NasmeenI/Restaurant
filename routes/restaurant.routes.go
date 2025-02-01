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
	rg.Use(middleware.AdminMiddleware())
	{
		rg.GET("/", RestaurantController.GetRestaurants)
		rg.GET("/:id", RestaurantController.GetRestaurantById)
		rg.POST("/", RestaurantController.CreateRestaurants)
		rg.PUT("/:id", RestaurantController.UpdateRestaurant)
		rg.DELETE("/:id", RestaurantController.DeleteLRestaurant)
	}
}

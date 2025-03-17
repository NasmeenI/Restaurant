package routes

import (
	"github.com/NasmeenI/finalProject/controllers"
	"github.com/NasmeenI/finalProject/middleware"
	"github.com/NasmeenI/finalProject/services/food"
	"github.com/NasmeenI/finalProject/services/restaurant"
	"github.com/gin-gonic/gin"
)

func RestaurantRoute(r *gin.Engine, middleware middleware.AuthMiddleware, restaurantService restaurant.RestaurantService, foodService food.FoodService) {
	RestaurantController := controllers.NewRestaurantController(restaurantService, foodService)

	rr := r.Group("/restaurant")
	rr.Use(middleware.AuthMiddleware())
	{
		rr.GET("/", RestaurantController.GetRestaurants)
		rr.GET("/category/:category", RestaurantController.GetRestaurantsByCategory)
		rr.GET("/:id", middleware.AdminMiddleware(), RestaurantController.GetRestaurantById)
		rr.POST("/", middleware.AdminMiddleware(), RestaurantController.CreateRestaurants)
		rr.PUT("/:id", middleware.AdminMiddleware(), RestaurantController.UpdateRestaurant)
		rr.DELETE("/:id", middleware.AdminMiddleware(), RestaurantController.DeleteRestaurant)
	}

	rf := r.Group("/food")
	rf.Use(middleware.AuthMiddleware())
	{
		rf.GET("/", RestaurantController.GetFoodById)
		rf.GET("/restaurant/:restaurantId", RestaurantController.GetFoodsByRestaurant)
		rf.PUT("/:restaurantId", middleware.AdminMiddleware(), RestaurantController.AddFoods)
	}
}

package controllers

import (
	"github.com/NasmeenI/finalProject/models"
	"github.com/NasmeenI/finalProject/services/food"
	"github.com/NasmeenI/finalProject/services/restaurant"
	"github.com/gin-gonic/gin"
)

type restaurantController struct {
	restaurantService restaurant.RestaurantService
	foodService       food.FoodService
}

type RestaurantController interface {
	GetRestaurants(c *gin.Context)
	GetRestaurantById(c *gin.Context)
	GetRestaurantsByCategory(c *gin.Context)
	CreateRestaurants(c *gin.Context)
	UpdateRestaurant(c *gin.Context)
	DeleteRestaurant(c *gin.Context)

	GetFoodById(c *gin.Context)
	GetFoodsByRestaurant(c *gin.Context)
	AddFoods(c *gin.Context)
}

func NewRestaurantController(restaurantService restaurant.RestaurantService, foodService food.FoodService) RestaurantController {
	return &restaurantController{
		restaurantService: restaurantService,
		foodService:       foodService,
	}
}

func (rc *restaurantController) GetRestaurants(c *gin.Context) {
	restaurants, err := rc.restaurantService.GetRestaurants()
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, restaurants)
}

func (rc *restaurantController) GetRestaurantById(c *gin.Context) {
	id := c.Param("id")
	restaurant, err := rc.restaurantService.GetRestaurantById(id)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, restaurant)
}

func (rc *restaurantController) GetRestaurantsByCategory(c *gin.Context) {
	category := c.Param("category")
	restaurants, err := rc.restaurantService.GetRestaurantsByCategory(category)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, restaurants)
}

func (rc *restaurantController) CreateRestaurants(c *gin.Context) {
	var restaurants []models.Restaurant
	err := c.ShouldBindJSON(&restaurants)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err = rc.restaurantService.CreateRestaurants(restaurants)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"result": "create restaurants successfully"})
}

func (rc *restaurantController) UpdateRestaurant(c *gin.Context) {
	id := c.Param("id")

	var restaurant models.Restaurant
	err := c.ShouldBindJSON(&restaurant)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err = rc.restaurantService.UpdateRestaurant(id, restaurant)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"result": "update restaurant successfully"})
}

func (rc *restaurantController) DeleteRestaurant(c *gin.Context) {
	id := c.Param("id")
	err := rc.restaurantService.DeleteLRestaurant(id)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"result": "delete restaurant successfully"})
}

func (rc *restaurantController) GetFoodsByRestaurant(c *gin.Context) {
	restaurantId := c.Param("restaurantId")

	foods, err := rc.foodService.GetFoodsByRestaurant(restaurantId)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, foods)
}

func (rc *restaurantController) GetFoodById(c *gin.Context) {
	restaurantId := c.Query("restaurantId")
	foodId := c.Query("foodId")

	food, err := rc.foodService.GetFoodById(restaurantId, foodId)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, food)
}

func (rc *restaurantController) AddFoods(c *gin.Context) {
	restaurantId := c.Param("restaurantId")

	var foods []models.Food
	err := c.ShouldBindJSON(&foods)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err = rc.foodService.AddFoods(restaurantId, foods)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"result": "add foods to restaurant successfully"})
}

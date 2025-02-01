package controllers

import (
	"github.com/NasmeenI/finalProject/models"
	"github.com/NasmeenI/finalProject/services/restaurant"
	"github.com/gin-gonic/gin"
)

type restaurantController struct {
	restaurantService restaurant.RestaurantService
}

type RestaurantController interface {
	GetRestaurants(c *gin.Context)
	GetRestaurantById(c *gin.Context)
	CreateRestaurants(c *gin.Context)
	UpdateRestaurant(c *gin.Context)
	DeleteLRestaurant(c *gin.Context)
}

func NewRestaurantController(restaurantService restaurant.RestaurantService) RestaurantController {
	return &restaurantController{
		restaurantService: restaurantService,
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

func (rc *restaurantController) DeleteLRestaurant(c *gin.Context) {
	id := c.Param("id")
	err := rc.restaurantService.DeleteLRestaurant(id)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"result": "delete restaurant successfully"})
}

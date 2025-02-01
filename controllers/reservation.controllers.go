package controllers

import (
	"net/http"

	"github.com/NasmeenI/finalProject/models"
	"github.com/NasmeenI/finalProject/services/authen"
	"github.com/NasmeenI/finalProject/services/reservation"
	"github.com/gin-gonic/gin"
)

type reservationController struct {
	reservationService reservation.ReservationService
	authenService      authen.AuthenService
}

type ReservationController interface {
	GetReservations(c *gin.Context)
	GetReservationById(c *gin.Context)
	CreateReservation(c *gin.Context)
	UpdateReservation(c *gin.Context)
	DeleteLReservation(c *gin.Context)
}

func NewReservationController(reservationService reservation.ReservationService, authenService authen.AuthenService) ReservationController {
	return &reservationController{
		reservationService: reservationService,
		authenService:      authenService,
	}
}

func (rc *reservationController) GetReservations(c *gin.Context) {
	restaurants, err := rc.reservationService.GetReservations()
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, restaurants)
}

func (rc *reservationController) GetReservationById(c *gin.Context) {
	id := c.Param("id")
	restaurant, err := rc.reservationService.GetReservationById(id)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, restaurant)
}

func (rc *reservationController) CreateReservation(c *gin.Context) {
	// User
	email, ok := c.Get("email")
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "User not found"})
		return
	}

	user, err := rc.authenService.GetUserByEmail(email.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	// Restaurant
	restaurantId := c.Param("id")

	// Reservation
	var reservation models.Reservation
	err = c.ShouldBindJSON(&reservation)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err = rc.reservationService.CreateReserve(user, restaurantId, reservation)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"result": "create restaurants successfully"})
}

func (rc *reservationController) UpdateReservation(c *gin.Context) {
	id := c.Param("id")

	var restaurant models.Reservation
	err := c.ShouldBindJSON(&restaurant)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err = rc.reservationService.UpdateReservation(id, restaurant)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"result": "update restaurant successfully"})
}

func (rc *reservationController) DeleteLReservation(c *gin.Context) {
	id := c.Param("id")
	err := rc.reservationService.DeleteLReservation(id)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"result": "delete restaurant successfully"})
}

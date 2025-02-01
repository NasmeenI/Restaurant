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
	CreateReserve(c *gin.Context)
}

func NewReservationController(reservationService reservation.ReservationService, authenService authen.AuthenService) ReservationController {
	return &reservationController{
		reservationService: reservationService,
		authenService:      authenService,
	}
}

func (rc *reservationController) CreateReserve(c *gin.Context) {
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

package routes

import (
	"github.com/NasmeenI/finalProject/controllers"
	"github.com/NasmeenI/finalProject/middleware"
	"github.com/NasmeenI/finalProject/services/authen"
	"github.com/NasmeenI/finalProject/services/reservation"
	"github.com/gin-gonic/gin"
)

func ReservationRoute(r *gin.Engine, middleware middleware.AuthMiddleware, reservationService reservation.ReservationService, authenService authen.AuthenService) {
	ReservationController := controllers.NewReservationController(reservationService, authenService)

	rg := r.Group("/reservation")
	rg.Use(middleware.AuthMiddleware())
	{
		rg.POST("/:id", ReservationController.CreateReserve)
	}
}

package reservation

import (
	"errors"
	"time"

	"github.com/NasmeenI/finalProject/models"
	"github.com/NasmeenI/finalProject/repositories/database"
)

type reservationService struct {
	reserveRepo    database.ReservationRepo
	restaurantRepo database.RestaurantRepo
}

type ReservationService interface {
	CreateReserve(user models.User, restaurantId string, reservation models.Reservation) (models.Reservation, error)
}

func NewReservationService(reservationRepo database.ReservationRepo, restaurantRepo database.RestaurantRepo) ReservationService {
	return &reservationService{
		reserveRepo:    reservationRepo,
		restaurantRepo: restaurantRepo,
	}
}

func (rs *reservationService) CreateReserve(user models.User, restaurantId string, reservation models.Reservation) (models.Reservation, error) {
	restaurant, err := rs.restaurantRepo.GetRestaurantById(restaurantId)
	if err != nil {
		return models.Reservation{}, err
	}

	err = rs.reserveRepo.CheckUserReservationLimit(user.ID.Hex())
	if err != nil {
		return models.Reservation{}, err
	}

	err = rs.checkReservationInOpenHours(reservation, restaurant)
	if err != nil {
		return models.Reservation{}, err
	}

	err = rs.reserveRepo.CreateReserve(user, restaurantId, reservation)
	if err != nil {
		return models.Reservation{}, err
	}
	return reservation, nil
}

func (rs *reservationService) checkReservationInOpenHours(reservation models.Reservation, restaurant models.Restaurant) error {
	reservationTime := reservation.Date.Format("15:04") // HH:MM
	openTime := restaurant.OpenTime.Format("15:04")
	closeTime := restaurant.CloseTime.Format("15:04")

	parsedReservationTime, _ := time.Parse("15:04", reservationTime)
	parsedOpenTime, _ := time.Parse("15:04", openTime)
	parsedCloseTime, _ := time.Parse("15:04", closeTime)

	if parsedReservationTime.Before(parsedOpenTime) || parsedReservationTime.After(parsedCloseTime) {
		return errors.New("reservation time is outside of the restaurant's operating hours")
	}

	return nil
}

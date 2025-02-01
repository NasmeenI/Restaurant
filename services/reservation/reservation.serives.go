package reservation

import (
	"errors"
	"time"

	"github.com/NasmeenI/finalProject/models"
	"github.com/NasmeenI/finalProject/repositories/database"
)

type reservationService struct {
	reservationRepo database.ReservationRepo
	restaurantRepo  database.RestaurantRepo
}

type ReservationService interface {
	GetReservations() ([]models.Reservation, error)
	GetReservationById(id string) (models.Reservation, error)
	CreateReserve(user models.User, restaurantId string, reservation models.Reservation) (models.Reservation, error)
	UpdateReservation(id string, restaurant models.Reservation) error
	DeleteLReservation(id string) error
}

func NewReservationService(reservationRepo database.ReservationRepo, restaurantRepo database.RestaurantRepo) ReservationService {
	return &reservationService{
		reservationRepo: reservationRepo,
		restaurantRepo:  restaurantRepo,
	}
}

func (rs *reservationService) GetReservations() ([]models.Reservation, error) {
	restaurants, err := rs.reservationRepo.GetReservations()
	if err != nil {
		return nil, err
	}
	return restaurants, nil
}

func (rs *reservationService) GetReservationById(id string) (models.Reservation, error) {
	restaurant, err := rs.reservationRepo.GetReservationById(id)
	if err != nil {
		return models.Reservation{}, err
	}
	return restaurant, nil
}

func (rs *reservationService) CreateReserve(user models.User, restaurantId string, reservation models.Reservation) (models.Reservation, error) {
	restaurant, err := rs.restaurantRepo.GetRestaurantById(restaurantId)
	if err != nil {
		return models.Reservation{}, err
	}

	err = rs.reservationRepo.CheckUserReservationLimit(user.ID.Hex())
	if err != nil {
		return models.Reservation{}, err
	}

	err = rs.checkReservationInOpenHours(reservation, restaurant)
	if err != nil {
		return models.Reservation{}, err
	}

	err = rs.reservationRepo.CreateReserve(user, restaurantId, reservation)
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

func (rs *reservationService) UpdateReservation(id string, restaurant models.Reservation) error {
	err := rs.reservationRepo.UpdateReservation(id, restaurant)
	if err != nil {
		return err
	}
	return nil
}

func (rs *reservationService) DeleteLReservation(id string) error {
	err := rs.reservationRepo.DeleteLReservation(id)
	if err != nil {
		return err
	}
	return nil
}

package restaurant

import (
	"github.com/NasmeenI/finalProject/models"
	"github.com/NasmeenI/finalProject/repositories/database"
)

type restaurntService struct {
	restaurantRepo database.RestaurantRepo
}

type RestaurantService interface {
	GetRestaurants() ([]models.Restaurant, error)
	GetRestaurantById(id string) (models.Restaurant, error)
	CreateRestaurants(restaurants []models.Restaurant) ([]models.Restaurant, error)
	UpdateRestaurant(id string, restaurant models.Restaurant) error
	DeleteLRestaurant(id string) error
}

func NewRestaurantService(restaurantRepo database.RestaurantRepo) RestaurantService {
	return &restaurntService{
		restaurantRepo: restaurantRepo,
	}
}

func (rs *restaurntService) GetRestaurants() ([]models.Restaurant, error) {
	restaurants, err := rs.restaurantRepo.GetRestaurants()
	if err != nil {
		return nil, err
	}
	return restaurants, nil
}

func (rs *restaurntService) GetRestaurantById(id string) (models.Restaurant, error) {
	restaurant, err := rs.restaurantRepo.GetRestaurantById(id)
	if err != nil {
		return models.Restaurant{}, err
	}
	return restaurant, nil
}

func (rs *restaurntService) CreateRestaurants(restaurants []models.Restaurant) ([]models.Restaurant, error) {
	restaurants, err := rs.restaurantRepo.CreateRestaurants(restaurants)
	if err != nil {
		return []models.Restaurant{}, err
	}
	return restaurants, nil
}

func (rs *restaurntService) UpdateRestaurant(id string, restaurant models.Restaurant) error {
	err := rs.restaurantRepo.UpdateRestaurant(id, restaurant)
	if err != nil {
		return err
	}
	return nil
}

func (rs *restaurntService) DeleteLRestaurant(id string) error {
	err := rs.restaurantRepo.DeleteLRestaurant(id)
	if err != nil {
		return err
	}
	return nil
}

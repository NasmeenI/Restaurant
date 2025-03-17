package food

import (
	"github.com/NasmeenI/finalProject/models"
	"github.com/NasmeenI/finalProject/repositories/database"
)

type foodService struct {
	restaurantRepo database.RestaurantRepo
}

type FoodService interface {
	GetFoodById(restaurantId string, foodId string) (models.Food, error)
	GetFoodsByRestaurant(restaurantId string) ([]models.Food, error)
	AddFoods(restaurantId string, foods []models.Food) error
}

func NewFoodService(restaurantRepo database.RestaurantRepo) FoodService {
	return &foodService{
		restaurantRepo: restaurantRepo,
	}
}

func (fs *foodService) GetFoodById(restaurantId string, foodId string) (models.Food, error) {
	food, err := fs.restaurantRepo.GetFoodById(restaurantId, foodId)
	if err != nil {
		return models.Food{}, err
	}
	return food, nil
}

func (fs *foodService) GetFoodsByRestaurant(restaurantId string) ([]models.Food, error) {
	restaurant, err := fs.restaurantRepo.GetRestaurantById(restaurantId)
	if err != nil {
		return []models.Food{}, err
	}
	return restaurant.Foods, nil
}

func (fs *foodService) AddFoods(restaurantId string, foods []models.Food) error {
	err := fs.restaurantRepo.AddFoods(restaurantId, foods)
	if err != nil {
		return err
	}
	return nil
}

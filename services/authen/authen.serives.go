package authen

import (
	"github.com/NasmeenI/finalProject/models"
	"github.com/NasmeenI/finalProject/repositories/database"
)

type authenService struct {
	userRepo database.UserRepo
}

type AuthenService interface {
	CheckCredentials(username string, password string) (models.User, error)
	CreateUser(user models.User) error
}

func NewAuthenService(userRepo database.UserRepo) AuthenService {
	return &authenService{
		userRepo: userRepo,
	}
}

func (as *authenService) CheckCredentials(username string, password string) (models.User, error) {
	user, err := as.userRepo.Login(username, password)
	if err != nil {
		return models.User{}, err
	}
	return user, nil
}

func (us *authenService) CreateUser(user models.User) error {
	err := us.userRepo.CreateUser(user)
	if err != nil {
		return err
	}
	return nil
}

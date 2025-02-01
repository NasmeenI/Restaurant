package authen

import (
	"github.com/NasmeenI/finalProject/models"
	"github.com/NasmeenI/finalProject/repositories/database"
)

type authenService struct {
	userRepo database.UserRepo
}

type AuthenService interface {
	GetUserByEmail(email string) (models.User, error)
	CheckCredentials(user models.User) (models.User, error)
	CreateUser(user models.User) error
}

func NewAuthenService(userRepo database.UserRepo) AuthenService {
	return &authenService{
		userRepo: userRepo,
	}
}

func (us *authenService) GetUserByEmail(email string) (models.User, error) {
	user, err := us.userRepo.GetUserByEmail(email)
	if err != nil {
		return models.User{}, err
	}
	return user, nil
}

func (as *authenService) CheckCredentials(user models.User) (models.User, error) {
	user, err := as.userRepo.Login(user)
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

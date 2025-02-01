package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"

	"github.com/NasmeenI/finalProject/configs"
	"github.com/NasmeenI/finalProject/models"
	"github.com/NasmeenI/finalProject/services/authen"
)

type authenController struct {
	authenService authen.AuthenService
}

type AuthenController interface {
	Login(c *gin.Context)
	SignUp(c *gin.Context)
}

func NewAuthenController(authenService authen.AuthenService) AuthenController {
	return &authenController{
		authenService: authenService,
	}
}

func (ac *authenController) Login(c *gin.Context) {
	// In a real application, authenticate the user (this is just an example)
	email := c.Query("email")
	password := c.Query("password")

	role, err := ac.authenService.CheckCredentials(email, password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to login"})
		return
	}

	// Create a new token object, specifying signing method and the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"role":  role,
		"exp":   time.Now().Add(time.Hour * 1).Unix(), // Token expiration time
	})

	// Sign and get the complete encoded token as a string
	tokenString, err := token.SignedString([]byte(configs.GetEnv("SECRET_KEY")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}

func (ac *authenController) SignUp(c *gin.Context) {
	// In a real application, authenticate the user (this is just an example)
	email := c.Query("email")
	password := c.Query("password")

	user := models.User{
		Email:    email,
		Password: password,
		Role:     "user",
	}

	err := ac.authenService.CreateUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to login"})
		return
	}

	// Create a new token object, specifying signing method and the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(time.Hour * 1).Unix(), // Token expiration time
	})

	// Sign and get the complete encoded token as a string
	tokenString, err := token.SignedString([]byte(configs.GetEnv("SECRET_KEY")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}

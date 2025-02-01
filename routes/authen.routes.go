package routes

import (
	"github.com/NasmeenI/finalProject/controllers"
	"github.com/NasmeenI/finalProject/middleware"
	"github.com/NasmeenI/finalProject/services/authen"
	"github.com/gin-gonic/gin"
)

func AuthenRoute(r *gin.Engine, middleware middleware.AuthMiddleware, authenService authen.AuthenService) {
	authenController := controllers.NewAuthenController(authenService)

	r.POST("/authen/signup", authenController.SignUp)
	r.POST("/authen/login", authenController.Login)

	rg := r.Group("/user")
	rg.Use(middleware.AuthMiddleware())
	{
		rg.GET("/me", authenController.GetUserByToken)
	}
}

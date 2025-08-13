const express = require('express')

const AuthController = require('./controllers/userController')
//const jwtMiddleware = require('./middleware/jwtMiddleware')


const route = new express.Router()

//register new doctor
route.post('/register',AuthController.registerController)
//path for login
route.post('/login',AuthController.loginController)


module.exports = route
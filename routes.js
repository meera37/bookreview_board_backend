const express = require('express')

const AuthController = require('./controllers/userController')
const bookController = require('./controllers/bookController');
const jwtMiddleware = require('./middleware/jwtMiddleware')


const route = new express.Router()

//register new doctor
route.post('/register',AuthController.registerController)
//path for login
route.post('/login',AuthController.loginController)

// Add book → Private
route.post('/books', jwtMiddleware, bookController.addBookController);
// Get all books → Public
route.get('/books', bookController.getAllBooksController);
// Get single book → Public
route.get('/books/:id', bookController.getBookByIdController);

// Add review to a book → Private
route.post('/books/:id/reviews', jwtMiddleware, bookController.addReviewController);



module.exports = route
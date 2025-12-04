const express = require('express');
const moviesController = require('../Controllers/moviesControllers.js')
const authController = require('../Controllers/authController.js')
const router = express.Router();

router.route('/recommended')
    .get(moviesController.getHighestRating,moviesController.getMovies)

router.route('/')
    .get(authController.protect, moviesController.getMovies)
    .post(moviesController.createMovie)

router.route('/stats')
    .get(moviesController.getStats)

router.route('/genre/:genre')
    .get(moviesController.getByGenre)

router.route('/:id')
    .get(moviesController.getMovie)
    .patch(moviesController.updateMovie)
    .delete(authController.protect,authController.restrict('admin') ,moviesController.deleteMovie)

module.exports = router
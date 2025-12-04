const ApiFeatures = require('../utils/ApiFeatures.js')
const asyncErrorHandler = require('../utils/asyncErrorHandler.js')
const CustomError = require('../utils/CustomeError.js')
const Movie = require('./../Models/movieModel.js')



const getHighestRating = (req, res, next) => {
    req.sort = "-rating"
    req.limit = "5"

    console.log(req.query)

    next();
}


const getMovies = asyncErrorHandler(async (req, res, next) => {
    const feature = new ApiFeatures(Movie.find(), req).filter().sort().limitFields().paginate();

    const movies = await feature.query;

    res.status(200).json({
        status: 'success',
        count: movies.length,
        data: {
            movies
        }
    })
})

const getMovie = asyncErrorHandler(async (req, res, next) => {

    const movie = await Movie.findById(req.params.id)

    if(!movie){
        const err = new CustomError("Movie Not Found",404);
        return next(err)
    }
    res.status(200).json({
        status: 'success',
        movie: movie
    })
})

const createMovie = asyncErrorHandler(async (req, res, next) => {
    const movie = await Movie.create(req.body)
    res.status(201).json({
        status: 'success',
        message: "Movie Created Successfully"
    })
})

const updateMovie = asyncErrorHandler(async (req, res, next) => {

    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    
    if(!movie){
        const err = new CustomError("Movie Not Found",404);
        return next(err)
    }
    res.status(200).json({
        status: "success",
        movie: movie
    })
})

const deleteMovie = asyncErrorHandler(async (req, res, next) => {

    const movie = await Movie.findByIdAndDelete(req.params.id)

    if(!movie){
        const err = new CustomError("Movie Not Found",404);
        return next(err)
    }
    res.status(204).json({
        status: "success"
    })
})

const getStats = asyncErrorHandler(async (req, res, next) => {

    const stats = await Movie.aggregate([
        { $match: { rating: { $gte: 4.7 } } },
        {
            $group: {
                _id: "$releaseYear",
                avgRating: { $avg: '$rating' },
                maxRating: { $max: "$rating" },
                minRating: { $min: "$rating" },
                sumRating: { $sum: "$rating" },
                movieCount: { $sum: 1 }
            }
        },
        { $sort: { releaseYear: 1 } },
        { $match: { minRating: { $gte: 4.8 } } }
    ])

    res.status(200).json({
        status: "success",
        data: {
            movies: stats
        }
    })
})

const getByGenre = asyncErrorHandler(async (req, res, next) => {

    genre = req.params.genre;
    const movie = await Movie.aggregate([
        { "$unwind": "$genres" },
        {
            "$group": {
                "_id": "$genres",
                movieCount: { "$sum": 1 },
                movie: { "$push": "$name" }
            }
        },
        { "$addFields": { "genre": "$_id" } },
        { "$project": { _id: 0 } },
        { "$sort": { movieCount: -1 } },
        { "$match": { genre: genre } }
        //{"$limit":3}
    ])

    res.status(200).json({
        status: "success",
        data: {
            movies: movie
        }
    })
})

module.exports = { getMovies, getMovie, createMovie, updateMovie, deleteMovie, getHighestRating, getStats, getByGenre }
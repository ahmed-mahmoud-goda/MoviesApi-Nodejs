const express = require('express');
const morgan = require('morgan');
const moviesRoute = require('./Routes/moviesRoutes.js');
const authRoute = require('./Routes/authRoutes.js');
const CustomError = require('./utils/CustomeError.js');
const globalErrorHandler = require('./Controllers/errorControllers.js')

let app = express();

app.use(express.json());

app.set('query parser', 'extended');


if(process.env.NODE_ENV ==='development'){
app.use(morgan('dev'));
}

app.use(express.static('./public'))

app.use('/api/v1/movies',moviesRoute)

app.use('/api/v1/users',authRoute)

app.use((req, res,next)=>{
    const err = new CustomError(`url: ${req.originalUrl} is not found`, 404)
    
    next(err)
});

app.use(globalErrorHandler)
module.exports = app; 
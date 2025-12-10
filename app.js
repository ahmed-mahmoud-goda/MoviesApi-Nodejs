const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet')
const {xss} = require('express-xss-sanitizer')
const hpp = require('hpp')
const sanitize = require('./utils/Sanitize.js')
const cookieParser = require('cookie-parser')
const moviesRoute = require('./Routes/moviesRoutes.js');
const authRoute = require('./Routes/authRoutes.js');
const userRoute = require('./Routes/userRoutes.js');
const CustomError = require('./utils/CustomeError.js');
const globalErrorHandler = require('./Controllers/errorControllers.js');

let app = express();

let limiter = rateLimit({
    max: 1000,
    windowMs: 60*60*1000,
    message:"We have recieved too many request from this IP, Please try again after one hour."
});
app.set('query parser', 'extended');

app.use(cookieParser())

app.use(helmet());

app.use(express.json({limit:'10kb'}));

app.use(xss())

app.use(hpp({whitelist:['duration','rating','releaseYear','genres','actors']}))

app.use((req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);
  next();
});

app.use('/api',limiter);

if(process.env.NODE_ENV ==='development'){
app.use(morgan('dev'));
}

app.use(express.static('./public'))

// Routes

app.use('/api/v1/movies',moviesRoute)

app.use('/api/v1/auth',authRoute)

app.use('/api/v1/user',userRoute)

app.use((req, res,next)=>{
    const err = new CustomError(`url: ${req.originalUrl} is not found`, 404)
    
    next(err)
});

app.use(globalErrorHandler)
module.exports = app; 
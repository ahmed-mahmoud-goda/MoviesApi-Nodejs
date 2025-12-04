const CustomError = require("../utils/CustomeError")

const devError = (res, error) => {
    res.status(error.statusCode).json({
        status: error.status,
        statusCode: error.statusCode,
        message: error.message,
        stackTrace: error.stack,
        error: error
    })
}

const prodError = (res, error) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            statusCode: error.statusCode,
            message: error.message
        })
    }
    else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        })
    }
}

const castErrorHandler = (error) => {
    const msg = `Invalid value for ${error.path}: ${error.value}`
    return new CustomError(msg, 400)
}

const duplicateKeyErrorHandler = (error) => {
    const msg = `There is a movie with this name: ${error.keyValue.name}`
    return new CustomError(msg, 400)
}

const validationErrorHandler = (error) => {
    const errorMessage = Object.values(error.errors).map(val => val.message);
    const msg = `Invalid Data: ${errorMessage.join('. ')}`;
    return new CustomError(msg, 400);
}

const tokenExpiredHandler = (error) => {
    const msg = 'Token Expired, Please login again'
    return new CustomError(msg, 401);
}

const jwtErrorHandler = (error) => {
    const msg = 'Invalid Token, Please login again'
    return new CustomError(msg, 401);
}

module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error'
    if (process.env.NODE_ENV == 'development') {
        devError(res, error)
    }
    else if (process.env.NODE_ENV == 'production') {
        if (error.name == 'CastError') error = castErrorHandler(error);
        if (error.code == 11000) error = duplicateKeyErrorHandler(error);
        if (error.name == 'ValidationError') error = validationErrorHandler(error);
        if (error.name == 'TokenExpiredError') error = tokenExpiredHandler(error);
        if (error.name == 'JsonWebTokenError') error = jwtErrorHandler(error);

        prodError(res, error)
    }
}
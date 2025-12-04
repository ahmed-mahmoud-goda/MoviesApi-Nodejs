const User = require('./../Models/userModel.js')
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const jwt = require('jsonwebtoken')
const CustomError = require('../utils/CustomeError.js')

const getToken = (id) => {
    return jwt.sign({ id: id }, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRE
    });
}

const signup = asyncErrorHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const token = getToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

const login = asyncErrorHandler(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        const error = new CustomError('Please Enter Password and Email', 400)
        return next(error)
    }

    const user = await User.findOne({ email: email }).select('+password')

    if (!user || !(await user.comparePassword(password, user.password))) {
        const error = new CustomError('Incorrect Email or Password', 400)
        return next(error)
    }

    const token = getToken(user._id);

    res.status(200).json({
        status: "success",
        token
    })

})

const protect = asyncErrorHandler(async (req, res, next) => {

    // Read Token
    const testToken = req.headers.authorization;
    let token;
    if (testToken && testToken.startsWith('Bearer')) {
        token = testToken.split(' ')[1];
    }
    if (!token) {
        next(new CustomError("You are not logged in", 401))
    }

    // Verify Token

    const decoded = jwt.verify(token, process.env.SECRET_STR)

    // Get User

    const user = await User.findById(decoded.id)

    if (!user) {
        next(new CustomError("User not found", 401))
    }

    // Check Password Changed

    const isChanged = await user.isPasswordChanged(decoded.iat)

    if (isChanged) {
        next(new CustomError("Password has changed recently. Please Login again", 401))
    }

    req.user = user;
    next();
})

const restrict = (...role)=>{
    return (req,res,next)=>{
        if(!role.includes(req.user.role)){
            next(new CustomError('You are not allowed to do this.',403))
        }
        next()
    }
}

const forgotPassword = asyncErrorHandler(async (req,res,next)=>{

    const user = await User.findOne({email:req.body.email});
    if(!user){
        next(new CustomError('Cannot find email',404));
    }

    const resetToken = user.createPasswordResetToken();

    await user.save({validateBeforeSave:false});

    return res.json({
        "hello":"hello"
    })

})

const resetPassword = (req,res,next)=>{

}

module.exports = { signup, login, protect, restrict, forgotPassword, resetPassword }
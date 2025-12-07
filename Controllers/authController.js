const User = require('./../Models/userModel.js')
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const jwt = require('jsonwebtoken')
const CustomError = require('../utils/CustomeError.js')
const crypto = require('crypto')
const sendMail = require('../utils/email.js')

const getToken = (id) => {
    return jwt.sign({ id: id }, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRE
    });
}

const createSendResponse = (user, statusCode, res) => {
    user.password = undefined;
    user.confirmPassword = undefined;
    user.passwordChangedAt = undefined;
    
    const token = getToken(user._id);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

const signup = asyncErrorHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);
    createSendResponse(newUser, 201, res);
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

    createSendResponse(user, 200, res);

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

const restrict = (...role) => {
    return (req, res, next) => {
        if (!role.includes(req.user.role)) {
            next(new CustomError('You are not allowed to do this.', 403))
        }
        next()
    }
}

const forgotPassword = asyncErrorHandler(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        next(new CustomError('Cannot find email', 404));
    }

    const resetToken = await user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    const msg = `We received the password reset request. use the below link to reset your password.\n\n${resetUrl}\n\nThis link will work for only 15 minutes.`

    try {
        await sendMail({
            email: user.email,
            subject: 'Password Reset',
            message: msg
        })

        return res.status(200).json({
            status: 'success',
            message: 'password reset email sent successfully'
        })
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetTokenExpires = undefined
        await user.save({ validateBeforeSave: false });
        return next(new CustomError('There was an error sending password reset email, please try again later.', 500))
    }


})

const resetPassword = asyncErrorHandler(async (req, res, next) => {

    const token = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({ passwordResetToken: token, passwordResetTokenExpires: { $gt: Date.now() } });

    if (!user) {
        next(new CustomError('Token is invalid or expired.', 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    createSendResponse(user, 200, res);
})

const updatePassword = asyncErrorHandler(async (req, res, next) => {

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
        return next(new CustomError('The password you provided is wrong.', 401))
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordChangedAt = Date.now();

    await user.save();

    createSendResponse(user, 200, res);
})

module.exports = { signup, login, protect, restrict, forgotPassword, resetPassword, updatePassword }
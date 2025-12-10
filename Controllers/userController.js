const User = require('./../Models/userModel.js')
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require('../utils/CustomeError.js')
const authController = require('./authController.js')

const filterObj = (obj, ...allowedFields)=>{
    const newObj = {};
    Object.keys(obj).forEach(key=>{
        if(allowedFields.includes(key)){
            newObj[key] = obj[key]
        }
    })

    return newObj;
}

const getAllUsers = asyncErrorHandler(async (req,res,next)=>{
    const users = await User.find();
    return res.status(200).json({
        status:'success',
        users:users
    })
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

    authController.createSendResponse(user, 200, res);
})

const updateUser = asyncErrorHandler(async(req,res,next)=>{

    if(req.body.password || req.body.confirmPassword){
        return next(new CustomError('You cannot update password from this endpoint.',400))
    }
    const filteredObj = filterObj(req.body,'name','email','photo')
    const user = await User.findByIdAndUpdate(req.user._id,filteredObj,{runValidators:true,new:true});

    return res.status(200).json({
        status:"success",
        message:"User updated successfully"
    })
})

const deleteUser = asyncErrorHandler(async (req,res,next)=>{

    const user = await User.findByIdAndUpdate(req.user._id,{active:false})

    return res.status(204).json({
        status:"success",
        data:null
    })
})

module.exports = {updatePassword, updateUser, deleteUser, getAllUsers}
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name.']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email."]
    },
    photo: {
        type: String,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter a password.'],
        minLength: [8, 'Password must be 8 characters or more.'],
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password.'],
        validate: {
            validator: function (val) {
                return val == this.password
            },
            message: "Confirm password must be the same as password."
        }
    },
    passwordChangedAt: {
        type:Date
    },
    passwordResetToken:{
        type:String
    },
    passwordResetTokenExpires:{
        type:Date
    }
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
})

userSchema.methods.comparePassword = async function (pass,passDb) {
    return await bcrypt.compare(pass,passDb);
}

userSchema.methods.isPasswordChanged = async function(jwtTimeStamp){
    if(this.passwordChangedAt){
        const passTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10)

        return jwtTimeStamp < passTimeStamp;
    }

    return false;
}

userSchema.methods.createPasswordResetToken = async function(){
    const token = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    this.passwordResetTokenExpires = Date.now() + (15*60*1000);

    return token;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
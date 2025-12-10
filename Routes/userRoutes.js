const express = require('express')
const userController = require('./../Controllers/userController.js')
const authController = require('./../Controllers/authController.js')

const router = express.Router()

router.route('/updatePassword').patch(authController.protect,userController.updatePassword)

router.route('/updateUser').patch(authController.protect,userController.updateUser)

router.route('/deleteUser').delete(authController.protect,userController.deleteUser)

router.route('/getUsers').get(authController.protect,authController.restrict('admin'),userController.getAllUsers)

module.exports = router
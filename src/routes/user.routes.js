const { getAll, createUser, getOne, remove, update, getUserCode, login, getLoggedUser, updatePassword, changePassword } = require('../controllers/user.controllers');
const express = require('express');
const verifyJWT = require('../utils/verifyJWT.JS');


const routerUser = express.Router();

//reset Password
routerUser.route('/reset_password')
    .post(updatePassword)

routerUser.route('/reset_password/:code')
    .post(changePassword)

//CR
routerUser.route('/')
    .get(verifyJWT, getAll)
    .post(createUser);

//The user who is logged in is reading.
routerUser.route('/me')
    .get(verifyJWT, getLoggedUser)

//RUD
routerUser.route('/:id')
    .get(verifyJWT, getOne)
    .delete(verifyJWT, remove)
    .put(verifyJWT, update);

//Verification User
routerUser.route('/verify/:code')
    .get(getUserCode)

//Login User
routerUser.route('/login')
    .post(login)



module.exports = routerUser;
const { getAll, createUser, getOne, remove, update, isVerifed } = require('../controllers/user.controllers');
const express = require('express');

const routerUser = express.Router();

routerUser.route('/')
    .get(getAll)
    .post(createUser);

routerUser.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);




module.exports = routerUser;
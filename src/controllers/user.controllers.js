const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');

require('dotenv').config();

const getAll = catchError(async (req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

const createUser = catchError(async (req, res) => {
    const { email, password, firstName, lastName, country, image } = req.body
    const encriptPassword = await bcrypt.hash(password, 10)
    const result = await User.create({
        email,
        password: encriptPassword,
        firstName,
        lastName,
        country,
        image
    });
    const code = require('crypto').randomBytes(32).toString("hex");
    const link = `${process.env.FRONTBASEURL}#/verify_email/${code}`
    await sendEmail({
        to: email, 
        subject: "verify your email", 
        html: `
            <h1 style = color:gray> Hello ${firstName} </h1>
            <p> verify your email</p>
            <p> go to your email</p>
            <a href='${link}'> ${link} </a>
            <h5>Thanks You</h5>
        `
    })
    return res.status(201).json(result);
});

const getOne = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await User.findByPk(id);
    if (!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async (req, res) => {
    const { id } = req.params;
    await User.destroy({ where: { id } });
    return res.sendStatus(204);
});

const update = catchError(async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, country, image } = req.body;
    const result = await User.update(
        { firstName, lastName, country, image },
        { where: { id }, returning: true }
    );
    if (result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

module.exports = {
    getAll,
    createUser,
    getOne,
    remove,
    update,

}
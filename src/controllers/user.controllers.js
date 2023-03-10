const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const EmailCode = require('../models/EmailCode');
const jwt = require('jsonwebtoken');

const getAll = catchError(async (req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

const createUser = catchError(async (req, res) => {
    const { email, password, firstName, lastName, country, image, frontBaseUrl } = req.body
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
    const link = `${frontBaseUrl}/verify_email/${code}`
    await sendEmail({
        to: email,
        subject: "Check your email",
        html: `
        <h1 style = color:gray> Hello ${firstName} </h1>
        <p> Check your emai</p>
        <p>Confirm your email by clicking on the following linkl</p>
        <a href='${link}'> ${link} </a>
        <h5>Thanks You</h5>
        `
    })


    await EmailCode.create({
        code,
        userId: result.id
    });

    return res.status(201).json(result);
});


const getUserCode = catchError(async (req, res) => {
    const { code } = req.params;
    const emailCode = await EmailCode.findOne({ where: { code } });
    if (!emailCode) return res.sendStatus(401);

    await User.update(
        { isVerifed: true },
        { where: { id: emailCode.userId }, returning: true } // para que me devuelva un array con todos los registros actualizados de db
    )
    await EmailCode.destroy({ where: { id: emailCode.id } })

    return res.json(emailCode);
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


const login = catchError(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "invalid credentials" });

    if (!user.isVerifed) return res.status(401).json({ error: "unverified user" });

    const token = jwt.sign(
        { user },
        process.env.TOKEN_SECRET,
        { expiresIn: '1d' }
    )

    return res.json({ user, token });
})

const getLoggedUser = catchError(async (req, res) => {
    const user = req.user
    return res.json(user)
})

const updatePassword = catchError(async (req, res) => {
    const { email, frontBaseUrl } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.sendStatus(401);


    const code = require('crypto').randomBytes(32).toString("hex");
    const link = `${frontBaseUrl}/reset_password/${code}`
    await sendEmail({
        to: email,
        subject: "Update password",
        html: `
        <h1 style = color:gray> Hello ${user.firstName} </h1>
        <p> Click here to change your password</p>
        <a href='${link}'> ${link} </a>
        <h5>Thanks You</h5>
        `
    })

    await EmailCode.create({
        code,
        userId: user.id
    });



    return res.json(user)
});

const changePassword = catchError(async (req, res) => {
    const { code } = req.params;
    const emailCode = await EmailCode.findOne({ where: { code } });
    if (!emailCode) return res.status(401).send('no enocntrado');

    const { password } = req.body;
    const encriptPassword = await bcrypt.hash(password, 10)
   

    await User.update(
     { password: encriptPassword },
        { where: { id: emailCode.userId }, returning: true } // para que me devuelva un array con todos los registros actualizados de db
    )
     await EmailCode.destroy({ where: { id: emailCode.id } })

    return res.json(emailCode);
});



module.exports = {
    getAll,
    createUser,
    getOne,
    remove,
    update,
    getUserCode,
    login,
    getLoggedUser,
    updatePassword,
    changePassword

}
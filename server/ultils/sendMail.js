const nodemailer = require('nodemailer')
const asyncHandler = require('express-async-handler')

const sendMail = asyncHandler(async ({ email, html }) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    // async..await is not allowed in global scope, must use a wrapper
    // async function main() {
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"E-Commerce" <no-reply@ethereal.email>', // sender address
        to: email, // list of receivers
        subject: "Forgot password", // Subject line
        html: html, // html body
    });

    return info
})

module.exports = sendMail
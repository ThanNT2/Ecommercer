const User = require('../models/user')
const ansyncHandler = require('express-async-handler')


const register = ansyncHandler(async (req, res) => {
    const { email, password, firstname, lastname, mobile } = req.body
    if (!email || !password || !lastname || !firstname || !mobile) {
        return res.status(400).json({
            sucess: false,
            mes: "missing inputs 1234"
        })
    }
    const response = await User.create(req.body)
    return res.status(200).json({
        sucess: response ? true : false,
        response
    })
})

module.exports = {
    register
}
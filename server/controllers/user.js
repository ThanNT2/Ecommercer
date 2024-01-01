const User = require('../models/user')
const ansyncHandler = require('express-async-handler')
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const { response } = require('express')
const jwt = require('jsonwebtoken')
const sendMail = require('../ultils/sendMail')


const register = ansyncHandler(async (req, res) => {
    const { email, password, firstname, lastname, mobile } = req.body
    if (!email || !password || !lastname || !firstname || !mobile) {
        return res.status(400).json({
            sucess: false,
            mes: "missing inputs register"
        })
    }
    const user = await User.findOne({ email })
    if (user) {
        throw new Error('User has existed!')
    } else {
        const newUser = await User.create(req.body)
        return res.status(200).json({
            sucess: newUser ? true : false,
            mes: newUser ? 'Register is successfully. Please go login' : 'Somthing went wrong'
        })
    }
})
////login
// refresh Token => cap moi access Token
// access token => xac thuc nguoi dung, quyen, phan quyen nguoi dung
const login = ansyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({
            sucess: false,
            mes: "missing inputs login"
        })
    }
    //plain object
    const response = await User.findOne({ email })
    console.log("dkm password =", await response.isCorrectPassword(password))
    if (response && await response.isCorrectPassword(password)) {
        // tach password and role khoi respone
        const { password, role, refreshToken, ...userData } = response.toObject()
        //tao access Token
        const accessToken = generateAccessToken(response._id, role)
        //tao refresh Token
        const newrefreshToken = generateRefreshToken(response._id)
        //luu refresh Token vao data base
        await User.findByIdAndUpdate(response._id, { refreshToken: newrefreshToken }, { new: true })
        //luu refresh Token vao cookie
        res.cookie('refreshToken', newrefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
        return res.status(200).json({
            success: true,
            accessToken,
            userData
        })
    } else {
        throw new Error('Invalid credentials!')
    }
})
const getCurrent = ansyncHandler(async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password -role')
    return res.status(200).json({
        success: user ? true : false,
        rs: user ? user : 'User not found'
    })
})
const refreshAccessToken = ansyncHandler(async (req, res) => {
    //lay token tu cookie
    const cookie = req.cookies
    // check co token ko
    if (!cookie && !cookie.refreshToken) {
        throw new Error('No refresh token in cookies')
    }
    //check token cos hop le hay ko 
    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({ _id: rs._id, refreshToken: cookie.refreshToken })
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? generateAccessToken(response._id, response.role) : 'Refresh token not matched'
    })
})

///logout
const logout = ansyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie || !cookie.refreshToken) {
        throw new Error('No refresh token in cookies')
    }
    //xoa refresh token o db
    await User.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: '' }, { new: true })
    //xoa refresh token o cookie trinh duyet
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    })
    return res.status(200).json({
        success: true,
        mess: 'logout is done'
    })
})
// client gui mail
// server check mail co hop le ko sau do gui mail kem link (change pass token)
//client check mail -->click mail
// client gui API kem token
//check token co giong token sever gui mail ko 
// giong thi cho change
const forgotPassword = ansyncHandler(async (req, res) => {
    const { email } = req.query
    if (!email) {
        throw new Error('Missing email')
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('User not found')
    }
    const resetToken = user.createPasswordChangedToken()
    await user.save()

    const html = `Please click the link here to change your password. this link will the end after 15 minues from now <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>CLICK</a>`
    const data = {
        email,
        html
    }
    const rs = await sendMail(data)
    return res.status(200).json({
        success: true,
        rs
    })
})

//get all users
const getUsers = ansyncHandler(async (req, res) => {
    const response = await User.find().select('-refreshToken -password -role')
    return res.status(200).json({
        success: response ? true : false,
        users: response
    })
})
//Delete users
const detleteUser = ansyncHandler(async (req, res) => {
    const { _id } = req.query
    if (!_id) throw new Error('Missing inputs')

    const response = await User.findByIdAndDelete(_id)
    return res.status(200).json({
        success: response ? true : false,
        detleteUser: response ? `User with email ${response.email} deleted` : 'No user delete'
    })
})
//update for user
const updateUser = ansyncHandler(async (req, res) => {
    const { _id } = req.user
    if (!_id || Object.keys(req.body).length === 0) throw new Error('Missing inputs')

    const response = await User.findByIdAndUpdate(_id, req.body, { new: true }).select('-password -role -refreshToken')
    return res.status(200).json({
        success: response ? true : false,
        updateUser: response ? response : 'Some thing went wrong'
    })
})
//update by admin
const updateUserByAdmin = ansyncHandler(async (req, res) => {
    const { uid } = req.params
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')

    const response = await User.findByIdAndUpdate(uid, req.body, { new: true }).select('-password -role -refreshToken')
    return res.status(200).json({
        success: response ? true : false,
        updateUser: response ? response : 'Some thing went wrong'
    })
})
module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    forgotPassword,
    getUsers,
    detleteUser,
    updateUser,
    updateUserByAdmin
}
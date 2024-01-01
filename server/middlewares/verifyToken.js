const jwt = require('jsonwebtoken')
const ansyncHandler = require('express-async-handler')

const verifyAccessToken = ansyncHandler(async (req, res, next) => {
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1]
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) return res.status(401).json({
                success: false,
                mes: 'Invalid access token'
            })
            console.log("dkm decode =", decode)
            req.user = decode
            next()
        })
    } else {
        return res.status(401).json({
            success: false,
            mes: 'Require authentication!'
        })
    }
})
const isAdmin = ansyncHandler((req, res, next) => {
    const { role } = req.user
    // if (role !== 'admin') throw new Error('Require admin role')
    if (role !== 'admin') {
        return res.status(401).json({
            succes: false,
            mes: 'Require admin'
        })
    }
    next()
})
module.exports = {
    verifyAccessToken,
    isAdmin
}
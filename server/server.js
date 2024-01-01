const express = require('express')
const app = express();
require('dotenv').config();
const dbConnect = require('./config/dbconnect')
const initRoutes = require('./routes')
const cookieParser = require('cookie-parser')



app.use(cookieParser())
const port = process.env.PORT || 888
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

dbConnect()
initRoutes(app)

// app.use('/', (req, res) => {
//     return res.send("SERVER ON")
// })
app.listen(port, () => {
    console.log("sever run " + port)
})
const express = require('express')
const app = express();
require('dotenv').config();

const port = process.env.PORT || 888
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', (req, res) => {
    return res.send("SERVER ON")
})
app.listen(port, () => {
    console.log("sever run " + port)
})
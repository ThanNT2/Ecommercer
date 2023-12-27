const { default: mongoose } = require('mongoose')

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        if (conn.connection.readyState === 1) console.log("db connection is success");
        else console.log("db connection is false");
    } catch (error) {
        console.log("db connection is failed")
        throw new Error(error)
    }
}
module.exports = dbConnect
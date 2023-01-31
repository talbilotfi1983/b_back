const {default: mongoose} = require('mongoose');
const dbConnect = () => {
    const connect = mongoose.connect(process.env.MONGOOSE_URI , error => {
        if (error) {
            console.log(error)
        } else {
            console.log("DATABASE CONNECT SUCCESSFULL")
        }
    })
}
module.exports = dbConnect;
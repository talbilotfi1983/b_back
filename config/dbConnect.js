const {default: mongoose} = require('mongoose');
const dbConnect = () => {
    console.log(process.env.MONGOOSE_URI)
    const connect = mongoose.connect(process.env.MONGOOSE_URI , error => {
        if (error) {
            console.log(error)
        } else {
            console.log("DATABASE CONNECT SUCCESSFULL")

        }
    })
}
module.exports = dbConnect;

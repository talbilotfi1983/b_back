const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
     let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'tl0753662720@gmail.com',
            pass: 'nqnnypzmzggrlhku'
        },
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'ltalbi@autovision.fr', // sender address
        to: data.to, // list of receivers
        subject: data.subject, // Subject line
        text: data.text, // plain text body
        html: data.htm, // html body
    });
});
module.exports = {
    sendEmail
};
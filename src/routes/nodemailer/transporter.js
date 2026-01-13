const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt( process.env.EMAIL_PORT ),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASSWORD
  },
  tls:{
    rejectUnauthorized:false
  }
});

module.exports = transporter;
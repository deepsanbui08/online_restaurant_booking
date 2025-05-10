const nodemailer = require('nodemailer');
require("dotenv").config();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Not your email password
  }
});

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification OTP",
    html: `<p>Your OTP for verification is <b>${otp}</b>. It will expire in 10 minutes.</p>`
  });
  console.log("otp sending via mail: "+email)
};
module.exports =sendOTP
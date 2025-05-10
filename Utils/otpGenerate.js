// utils/otpGenerator.js
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  const otpExpires = Date.now() + 10 * 60 * 1000; // expires in 10 minutes
  return { otp, otpExpires };
}

module.exports = generateOTP;

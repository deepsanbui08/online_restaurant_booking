const nodemailer= require("nodemailer")
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendConfirmationEmail = (userEmail, restaurantName,date, timeSlot, name, people) => {
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Your email
      to: userEmail, // User's email (from the form data)
      subject: 'Booking Confirmation - Table Reservation',
      html: `
        <h2>Thank You for Your Reservation!</h2>
          <p>Hello ${name},</p>
          <p>Your table at <strong>${restaurantName}</strong> has been successfully reserved.</p>
          <p><strong>Reservation Details:</strong></p>
          <ul>
            <li><strong>Date of Booking:</strong> ${date}</li> <!-- Added booking date -->
            <li><strong>Date & Time:</strong> ${timeSlot}</li>
            <li><strong>Number of People:</strong> ${people}</li>
          </ul>
          <p>We look forward to serving you!</p>
          <p>For any further inquiries, please feel free to contact us.</p>
          <p><em>Best Regards,</em><br>Your Restaurant Team</p>
      `
    };
  
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Confirmation email sent: ' + info.response);
      }
    });
  };
  
  module.exports=sendConfirmationEmail;
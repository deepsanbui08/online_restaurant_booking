const express=require("express");
const router=express.Router();
const User= require("../Models/userModels");
const isAuthenticated = require("../Middlewares/auth");
const Booking= require("../Models/booking")
const sendConfirmationEmail = require("../Utils/ConfirmationEmail");
const sendOTP = require("../Utils/otpVerification");
const generateOTP= require("../Utils/otpGenerate");
const bcrypt = require('bcrypt');

// home page 
router.get('/', (req, res) => {
    // Pass session info to the frontend
     let isLoggedIn = req.session.email ? true : false;
    res.render('home',{isLoggedIn}); // Send isLoggedIn variable to the front-end
  });

//registration page rendering
router.get("/register",(req,res)=>{
    res.render("registration")
});

// router.post('/register', async (req, res) => {
//     try {
//         const { name, dob, gender, mobile, aadharNumber, password, email } = req.body;

//         // Check if email already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).send('Email is already in use.');
//         }

//         // Create a new user
//         const newUser = new User({
//             name,
//             dob,
//             gender,
//             mobile,
//             aadharNumber,
//             password,
//             email
//         });

//         await newUser.save();
//         res.rend('Registration successful!');
//     } catch (error) {
//         res.status(500).send('Error during registration: ' + error.message);
//     }
// });

//login page rendering

router.post('/register', async (req, res) => {
    try {
        const { name, gender, mobile, password, email } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
           return res.redirect('/register?errorEmail=' + encodeURIComponent('Email has already been registered. Please log in.'));

        }
        // Generate OTP
         // 10 minutes
        const { otp, otpExpires } = generateOTP();
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Store user and OTP in session
        req.session.pendingUser = { name, gender, mobile, password:hashedPassword, email };
        req.session.otp = otp;
        req.session.otpExpires = otpExpires;
        await sendOTP(email, otp);
        res.redirect('/verify-otp');

    } catch (error) {
        res.status(500).send('Error during registration: ' + error.message);
    }
});

router.get("/login",(req,res)=>{
    res.render("login")
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!user || !isMatch) {
          
          //return res.send('Invalid email or password.')
          return res.redirect('/login?error=Invalid email or password')
          
        }
        else{
           
            req.session.userId = user._id;
        
            req.session.email = user.email;
            // ✅ Render profile.ejs with user data directly
            const bookings = await Booking.find({ email:user.email }).sort({ bookingDate: -1 });
            res.render('profile',{user,bookings});
        }
    } catch (error) {
        res.status(500).send('Error during login: ' + error.message);
    }
});

// profile page route
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
      const email = req.session.email;
  
      // Get logged-in user's data
      const user = await User.findOne({ email });
  
      // Fetch all bookings by this user's email
      const bookings = await Booking.find({ email }).sort({ bookingDate: -1 });
  
      // Render the profile page with user and booking data
      res.render("profile", {
        user,
        bookings
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      res.status(500).send("Internal Server Error");
    }
  });


// logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error destroying session:', err);
            return res.redirect('/'); // Or an error page
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        return res.redirect('/login?successLogOut=' + encodeURIComponent('Logged Out, Sucessfully.'));; // Redirect to login page
    });
});

// restaurant details
router.get("/restaurant-details/:restaurant",(req,res)=>{
    const restaurant = req.params.restaurant 
    res.render(restaurant)
})

// router.get("/restaurant-details/barbq",(req,res)=>{
//     res.render("bbq-details")
// })

router.get("/:restaurantname/book",isAuthenticated,(req,res)=>{
    const restaurantName=req.params.restaurantname;
    res.render("booking",{restaurantName})
})

router.post("/:restaurantname/book", async (req, res) => {
    try {
      const { date, time, people, name, mobile,  request } = req.body;
      const restaurantName = req.params.restaurantname;
        const email = req.session.email
      const newBooking = new Booking({
        restaurantName,
        bookingDate: date, // New field added
        timeSlot: time,
        people,
        fullName: name,
        phone: mobile,
        email,
        requests: request
      });
  
      await newBooking.save();
  
      // Send confirmation email to the user with booking date
      sendConfirmationEmail(email, restaurantName,date, time, name, people);
  
      res.render('thankyou'); // Renders thankyou.ejs
    } catch (error) {
      console.error('Booking failed:', error);
      res.status(500).send('Something went wrong while booking.');
    }
  });
  
  
  router.get('/verify-otp', (req, res) => {
    res.render('verify-otp'); // EJS or any template engine you're using
});


  router.post('/verify-otp', async (req, res) => {
    const { otp } = req.body;
    const { pendingUser, otp: sessionOtp, otpExpires } = req.session;

    if (!pendingUser || Date.now() > otpExpires) {
        // return res.status(400).send('OTP expired or invalid session.');
        return res.redirect('/register?errorOtp=' + encodeURIComponent('OTP expired or invalid session.'));

    }

    if (parseInt(otp) !== sessionOtp) {
        return res.redirect('/register?errorIncorrectOtp=' + encodeURIComponent('Incorrect OTP. Please try again.'));

    }

    try {
        const newUser = new User(pendingUser);
        await newUser.save();

        // Clear session
        req.session.pendingUser = null;
        req.session.otp = null;
        req.session.otpExpires = null;
        req.session.userId =newUser._id;
        req.session.email = newUser.email;

        res.redirect('/profile');
    } catch (err) {
        res.status(500).send('Error saving user: ' + err.message);
    }
});

router.post('/resend-otp', async (req, res) => {
    const { pendingUser, otp: sessionOtp, otpExpires } = req.session;

  if (!pendingUser || !pendingUser.email) {
    //return res.status(400).send('Session expired. Please register again.');
    return res.redirect('/register?errorOtp=' + encodeURIComponent('OTP expired or invalid session.'))
  }
  const { otp, otpExpire } = generateOTP();
  const newOtp = otp;
  req.session.otp = newOtp;
  req.session.otpExpires = otpExpire;

  try {
    await sendOTP(pendingUser.email, newOtp);
    res.redirect("/verify-otp");
  } catch (err) {
    console.error('Error resending OTP:', err);
    res.status(500).send('Failed to resend OTP.');
  }
});



// forgot password otp sending....

router.get("/forgot-password",(req,res)=>{
  res.render("f-email");
})
router.post("/forgot-password",async(req,res)=>{
  try{
      const email = req.body.email;
      const userForPassChange= await User.findOne({email})
      if(!userForPassChange){
        return res.redirect('/forgot-password?errorNoAccFound=' + encodeURIComponent('No account found with this email.'));
      }
        const OTP = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
        const OTPexpire = Date.now() + 10 * 60 * 1000;
      req.session.userForPassChange = userForPassChange;
      req.session.f_otp = OTP;
      req.session.f_otpExpire= OTPexpire;
      await sendOTP(email,OTP);
      res.redirect("/forgot-password/verify");
  }catch(err){
    res.status(500).send('Error saving user: ' + err.message);
  }
  
})



// otp verification for forgot password
router.get("/forgot-password/verify",(req,res)=>{
  res.render("f-otp-verify");
})
router.post("/forgot-password/verify",(req,res)=>{
  const otp = req.session.f_otp;
  const userForPassChange=req.session.userForPassChange;
  const OTPexpire = req.session.f_otpExpire;
  const f_otp = req.body.otp;
   if (!userForPassChange || Date.now() > OTPexpire) {
        return res.redirect('/forgot-password?otpErrorForgotPass=' + encodeURIComponent('OTP expired or invalid session.'));

    }
    if (parseInt(f_otp) !== otp) {
       return res.redirect('/forgot-password?otpErrorIncorrect=' + encodeURIComponent('Incorrect OTP. Please try again.'));

    }
    try{
      res.redirect("/reset-password");
    }catch(err){
      res.status(500).send('Error saving user: ' + err.message);
    }
})


router.post("/forgot-password/resend-otp",async(req,res)=>{
  const {userForPassChange,OTP,OTPexpires} = req.session;
   if (!userForPassChange) {
        return res.status(400).send('Session expired. Please try again.');
    }
    const newOTP = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const newOTPexpire = Date.now() + 10 * 60 * 1000;
    req.session.f_otp= newOTP;
    req.session.f_otpExpire= newOTPexpire;
     try {
    await sendOTP(userForPassChange.email, newOTP);
    res.redirect("/forgot-password/verify");
  } catch (err) {
    console.error('Error resending OTP:', err);
    res.status(500).send('Failed to resend OTP.');
  }
})

// reseting password

router.get("/reset-password",(req,res)=>{
  res.render("reset-password");
})
router.post("/reset-password", async(req,res)=>{
    try{
      const user = req.session.userForPassChange;
      const newPass = req.body.password;
      const hashedPassword = await bcrypt.hash(newPass, 10);
      const update = await User.findOneAndUpdate({email:user.email},{password:hashedPassword})
      req.session.userForPassChange = null;
      req.session.f_otp=null;
      req.session.f_otpExpire=null;
          if (!update) {
            return res.status(404).json({ message: 'User not found' });
            }

       
      res.redirect('/login?successPasschange=' + encodeURIComponent("You've successfully changed your password. Please use the new password to log in next time."));

    }catch(err){
      res.status(500).send('Error saving user: ' + err.message);
      console.log(err.message);
    }
    
})

module.exports=router;
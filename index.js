require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./db");
const path = require('path')
const userRoutes = require("./routes/userRoutes")
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))




// Middleware to parse cookies
app.use(cookieParser());



app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache'); // HTTP 1.0 backward compatibility
    res.setHeader('Expires', '0'); // Forces cache to expire immediately
    next();
});
// Session middleware
app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET, // Secret key for signing the session ID cookie
    resave: false,             // Do not save session if unmodified
    saveUninitialized: false,  // Do not create session until something is stored
     store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URL, // Replace with your MongoDB connection string
            collectionName: 'sessions',
            ttl: 14 * 24 * 60 * 60, // Expiry time: 14 days
        })
}));

//flash messages
app.use(flash());




app.use("/",userRoutes);

const PORT = process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`Server running at ${PORT} `);
})

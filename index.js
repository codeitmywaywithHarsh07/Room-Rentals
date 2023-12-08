const express=require('express');
const app=express();
const mongoose = require('mongoose');
const path=require('path');
const methodOverride=require('method-override');
const Listing = require('./models/listing');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const {listingSchema,reviewSchema} = require('./schema');
const Review = require('./models/review');
// Requiring Routes Area
const listingRoutes = require('./routes/listingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');
const flash = require('connect-flash');
// Requiring passport and passport-local
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


const sessionOptions = {
    secret:"harshTripathi",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()*7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
}

app.use(session(sessionOptions));
app.use(flash());

// passport related
app.use(passport.initialize());  // To Use it With Express
app.use(passport.session());

// Configure Local Strategy
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



let PORT=7000;

app.listen(PORT,(err)=>{
    if(!err)
    {
        console.log(`Server established at PORT : ${PORT}`);
    }
});

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.engine('ejs',ejsMate);

// For Mongoose - Database

main()
.then((res)=>{console.log("Connected to DataBase ✅")})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/room_rentals');
}

// Defining local variables for ejs Templates for each and every requests
app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.faliure=req.flash('faliure');
    res.locals.currUser=req.user;
    res.locals.flag = (req.isAuthenticated() ? true : false);
    next();
});

// Creating a demoUser route

app.get('/demoUser',async(req,res)=>{
    let fakeUser = new User({
        email:"harshtripathi20000@gmail.com",
        username:"harsh70"
    });

    let regUser = await User.register(fakeUser,"mypassw70");
    res.send(regUser);
});

app.use('/',userRoutes);
app.use('/listings',listingRoutes);
app.use('/listings/:id/reviews',reviewRoutes);

// Error Handler 

app.use((err,req,res,next)=>{
    let {status=500, message="Some Error Occured"} = err;
    res.status(status).render('error.ejs',{err});
});

app.use('*',(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

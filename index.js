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
const authRoutes = require('./routes/authRoutes');
const session = require('express-session');
const flash = require('connect-flash');
// Requiring passport and passport-local
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Notification = require('./models/notification');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();



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

passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        User.findOne({ email }).then((existingUser) => {
          if (existingUser) {
            return done(null, existingUser);
          } else {
            new User({
              email,
              username: profile.displayName,
            })
              .save()
              .then((user) => done(null, user));
          }
        });
      }
    )
  );

// Serialize and deserialize user for both strategies
passport.serializeUser((user, done) => {
done(null, user.id);
});

passport.deserializeUser((id, done) => {
User.findById(id).then((user) => {
  done(null, user);
});
});



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

app.use(async(req,res,next)=>{
  let currUser = res.locals.currUser;
  if(currUser){
      let notifyArr = await Notification.find({recipient:currUser._id,read:false});
      if(notifyArr.length){
          res.locals.notifyArr = notifyArr;
      }
      else{
          res.locals.notifyArr = [];
      }
  }else{
      res.locals.notifyArr = [];
  }
  console.log(res.locals.notifyArr);
  next();
});

app.use('/user',userRoutes);
app.use('/listings',listingRoutes);
app.use('/listings/:id/reviews',reviewRoutes);
app.use('/auth',authRoutes);


// For favourites

app.get('/favourites/:userId',wrapAsync(async (req,res)=>{
    let {userId} = req.params;
    let thisUser = await User.findById(userId).populate('favorites');
    console.log(thisUser);
    res.render('favourites.ejs',{thisUser});
}))

// Error Handler 

app.use((err,req,res,next)=>{
    let {status=500, message="Some Error Occured"} = err;
    res.status(status).render('error.ejs',{err});
});

app.use('*',(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

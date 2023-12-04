const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const {listingSchema,reviewSchema} = require('../schema');
const ExpressError = require('../utils/ExpressError');


// Validation Middleware function

const validateListing = (req,res,next)=>{
    let{title,location,image,description,price,country}=req.body;
    let data=
    {
        title:title,
        location:location,
        description:description,
        price:price,
        country:country,
        image:{
            url:image,
            filename:"photo"
        }
    };
    let {error} = listingSchema.validate(data);
    console.log(res);
    if(error)
    {
        throw new ExpressError(400,error);
    }
    else{
        next();
    }
}

//Basic Route ----> ' / '

// router.get('/',(req,res)=>{
//     res.send('This is the Home Route!');
// });


// Index Route ----> ' /listings '

router.get('/', wrapAsync(async (req,res)=>{
    let data=await Listing.find();
    res.render('index.ejs',{data});
    console.log(res.locals);
}));

// New Route : '/listings/new' ---> render form for new listing

router.get('/new',(req,res)=>{
    // Authentication
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash('faliure',"Yopu must be loggedIn first!");
        res.redirect('/login');
    }
    else{
        res.render('newListing.ejs');
    }
});

// Create a new Listing

router.post('/', wrapAsync( async (req,res)=>{
    let{title,location,image,description,price,country}=req.body;
    let data=
    {
        title:title,
        location:location,
        description:description,
        price:price,
        country:country,
        image:{
            url:image,
            filename:"photo"
        },
        owner:req.user._id
    };
    await new Listing(data).save();
    req.flash("success","New Listing Created Successfully!");
    res.redirect('/listings');
}));

// Show Route ----> '/listings/:id'

router.get('/:id',wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let item=await Listing.findById(id)
    .populate("reviews").populate('owner');  // Get the Complete Information about Listing
    console.log(res.locals.currUser);
    if(!item){
        req.flash("faliure","Listing you searched for does not exists!");
        res.redirect('/listings');
    }
    console.log(item);
    res.render('oneItem.ejs',{item});
}));

// update route : '/listings/:id/edit'

router.get('/:id/edit',wrapAsync(async (req,res)=>{
    if(!req.isAuthenticated()){
        req.flash('faliure',"Yopu must be loggedIn first!");
        res.redirect('/login');
    }else{
        let {id} = req.params;
        let item = await Listing.findById(id);
        if(!item){
            throw new ExpressError(400,"Select Valid Data!");
        }
        // console.log(item);
        res.render('editListing.ejs',{item});
    }
}));

// PUT request

router.put('/:id',wrapAsync(async (req,res)=>{
    let{title,location,image,description,price,country}=req.body;
    let {id}=req.params;
    let updObj={
        title:title,
        location:location,
        image:{
            url:image,
            filename:"photo"
        },
        description:description,
        price:price,
        country:country
    };


    let updatedListing=await Listing.findByIdAndUpdate(id,updObj,{new:true,runValidators:true});
    req.flash("success","Listing Updated!");
    res.redirect("/listings");
}));

// DELETE Request

router.delete('/:id',wrapAsync(async (req,res)=>{
    if(!req.isAuthenticated()){
        req.flash('faliure',"Yopu must be loggedIn first!");
        res.redirect('/login');
    }else{
        let {id} =req.params;
        let deletedListing=await Listing.findByIdAndDelete(id);
        // console.log(deletedListing);
        req.flash("success","Listing Deleted!");
        res.redirect('/listings');
    }
}));


module.exports = router;


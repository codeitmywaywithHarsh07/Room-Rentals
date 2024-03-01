const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const {listingSchema,reviewSchema} = require('../schema');
const ExpressError = require('../utils/ExpressError');
const {isOwner,isLoggedIn,validateListing} = require('../middleware');
const User = require('../models/user');
const multer = require('multer');
const {storage,cloudinary} = require('../cloudConfig.js');
const upload = multer({storage:storage});



// Index Route ----> ' /listings ' , 
// Create a new Listing

router.route('/')
.get(wrapAsync(async (req,res)=>{
    let data=await Listing.find();
    res.render('index.ejs',{data});
    console.log(res.locals);
}))
.post(isLoggedIn,upload.single('image'),wrapAsync(async (req,res)=>{
    console.log(req.file);
    let{title,location,description,price,country}=req.body;
    let data=
    {
        title:title,
        location:location,
        description:description,
        price:price,
        country:country,
        image:{
            url:req.file.path,
            filename:req.file.filename
        },
        owner:req.user._id
    };
    await new Listing(data).save();
    console.log(data);
    req.flash("success","New Listing Created Successfully!");
    res.redirect('/listings');
    // res.send(req.file);
}));

// New Route : '/listings/new' ---> render form for new listing

router.get('/new',isLoggedIn,(req,res)=>{
    res.render('newListing.ejs');
});

// Route for Text Search

router.get('/search',async(req,res)=>{
    let {query} = req.query;
    let listings = await Listing.find({$text:{$search:query}});
    if(!listings)
    {
        next(new ExpressError(500,"Listings Not Found!"));
    }
    else{
        res.render('index.ejs',{data : listings});
    }
})


// Show Route ----> '/listings/:id'

router.get('/:id',wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let item=await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author"
        }
    }).populate('owner');  // Get the Complete Information about Listing
    // console.log(res.locals.currUser);
    if(!item){
        req.flash("faliure","Listing you searched for does not exists!");
        res.redirect('/listings');
    }
    console.log(item);
    let currUser = res.locals.currUser;
    res.render('oneItem.ejs',{item,currUser});
}));

// update route : '/listings/:id/edit'

router.get('/:id/edit',isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let item = await Listing.findById(id);
    if(!item){
        throw new ExpressError(400,"Select Valid Data!");
    }
    // console.log(item);
    res.render('editListing.ejs',{item});
}));

// PUT request

router.put('/:id',isLoggedIn,isOwner,upload.single('image'),wrapAsync(async (req,res)=>{
    console.log(req.file);
    let{title,location,description,price,country}=req.body;
    let {id}=req.params;
    let updObj={
        title:title,
        location:location,
        // image:{
        //     url:req.file.path,
        //     filename:req.file.filename
        // },
        description:description,
        price:price,
        country:country
    };

    let updatedListing=await Listing.findByIdAndUpdate(id,updObj,{new:true,runValidators:true});
    
    if(typeof req.file!== "undefined")
    {
        updatedListing.image.url=req.file.path;
        updatedListing.image.filename=req.file.filename;
        await updatedListing.save();
    }
    
    req.flash("success","Listing Updated!");
    res.redirect("/listings");
}));

// DELETE Request

router.delete('/:id',isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
    let {id} =req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect('/listings');
}));

// Like 

router.post('/:id/like',isLoggedIn,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let thisListing = await Listing.findById(id);
    let thisUser = await User.findById(req.user._id);
    if (!thisListing.likes.includes(req.user._id)) {
        thisListing.likes.push(req.user._id);
        thisUser.favorites.push(id);
        await thisListing.save();
        await thisUser.save();
        req.flash("success","Added to Favorites!");
    }
    else{
        const listing_index = thisListing.likes.indexOf(req.user._id);
        const user_index = thisUser.favorites.indexOf(id);
        if (listing_index !== -1) {
            thisListing.likes.splice(listing_index, 1);
            await thisListing.save();
        }

        if (user_index !== -1) {
            thisUser.favorites.splice(user_index, 1);
            await thisUser.save();
        }

        req.flash("success","Removed From Favorites!");
    }
    console.log(thisListing.likes);
    res.redirect(`/listings/${id}`);
}));


module.exports = router;


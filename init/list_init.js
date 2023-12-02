const mongoose = require('mongoose');
const Listing = require('../models/listing');
const {data}=require('./data');

// For Mongoose - Database

main()
.then((res)=>{console.log("Connected to DataBase ✅")})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/room_rentals');
}

//

const initData = async ()=>{
   await Listing.deleteMany({});
   await Listing.insertMany(data);
   console.log("Database Initialized");
}

initData();

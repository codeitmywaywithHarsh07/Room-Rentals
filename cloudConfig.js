const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary');
require('dotenv').config();

// Configuration

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret :process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:'RoomRentals',
        allowed_formats:['png','jpeg', 'jpg']
    }
});

module.exports={storage,cloudinary};
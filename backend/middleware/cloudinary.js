const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timaout: 600000,
});


const uploadCloudinary = async (file) => {
 try {
  const result = await cloudinary.uploader.upload(file, {
    folder: "images",
  });
  return result;
 } catch (error) {
  console.log(error);
 }
}

module.exports = { uploadCloudinary, cloudinary };
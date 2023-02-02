const cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: 'dlqhd5nhy',
    api_key: '611863171916668',
    api_secret: 'O4GgmOsEFu9wd1MQxFWDfaqD0Uc'
});
const cloudinaryUloadImg = async (fileToUpload) => {
    return new Promise((resolve) => {
        cloudinary.uploader.upload(fileToUpload, (result) => {
            resolve(
                {url: result.secure_url}, {resource_type: "auto"})
        })
    });
}
module.exports = {cloudinaryUloadImg}
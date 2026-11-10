const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {

        cloudinary.uploader.upload_stream(
            {
                folder: "farmconnect/products"
            },
            (error, result) =>{

                if(error) {
                    return reject(error);
                }

                resolve(result);
            }
        ).end(buffer);
    });
};

module.exports = uploadToCloudinary;
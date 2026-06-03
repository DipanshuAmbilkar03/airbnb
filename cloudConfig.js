const cloudinary = require('cloudinary').v2;
const multer = require("multer");
const { Readable } = require("stream");
const expressError = require("./utils/expressError.js");

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return cb(new expressError(400, "Only JPEG, PNG, and WEBP images are allowed."));
        }

        cb(null, true);
    },
});

const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return resolve(null);
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "WanderLust_DEV",
                resource_type: "image",
                transformation: [
                    { width: 1600, height: 1200, crop: "limit" },
                    { quality: "auto", fetch_format: "auto" },
                ],
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve({
                    url: result.secure_url,
                    filename: result.public_id,
                });
            }
        );

        Readable.from(file.buffer).pipe(uploadStream);
    });
};

module.exports = {
    cloudinary,
    upload,
    uploadImage,
};

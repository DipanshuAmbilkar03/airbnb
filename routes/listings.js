const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn , isowner, validateFunc, validateObjectId, verifyMultipartCsrfToken } = require("../appMiddleware.js");

// controller
const listingController = require("../controllers/listings");

// multer (for handling multipart/form-data)  => basically image uploads <= 
const { upload } = require("../cloudConfig.js");


// router.route path for ("/") 
router.route("/")
    .get(
        wrapAsync(listingController.index))
    .post(isLoggedIn,
        upload.single('listing[image]'),
        verifyMultipartCsrfToken,
        validateFunc,
        wrapAsync(listingController.createListing)
    )

// new route
router.get("/new", 
    isLoggedIn,
        listingController.renderNewForm
)

// router.route path for ("/:id") 
router.route("/:id")
    .all(validateObjectId("id"))
    .get(
        wrapAsync(listingController.showListings))
    .put(isLoggedIn,isowner,
        upload.single('listing[image]'),
        verifyMultipartCsrfToken,
        validateFunc, 
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn,
        isowner,
        wrapAsync(listingController.destroyListing)
    )

// edit route
router.get("/:id/edit" 
        ,validateObjectId("id")
        ,isLoggedIn
            ,isowner
                ,wrapAsync(listingController.editListing)
)

module.exports = router;

//  <------------------------------------------------------------------>

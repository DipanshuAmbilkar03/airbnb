const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const adminController = require("../controllers/admin.js");
const { isLoggedIn, isAdmin, validateObjectId } = require("../middleware.js");

router.use(isLoggedIn, isAdmin);

router.get("/", wrapAsync(adminController.dashboard));

router.get("/listings", wrapAsync(adminController.listings));
router.delete(
    "/listings/:id",
    validateObjectId("id"),
    wrapAsync(adminController.destroyListing)
);

router.get("/users", wrapAsync(adminController.users));
router.put(
    "/users/:id/admin",
    validateObjectId("id"),
    wrapAsync(adminController.updateUserRole)
);

router.get("/reviews", wrapAsync(adminController.reviews));
router.delete(
    "/reviews/:reviewId",
    validateObjectId("reviewId"),
    wrapAsync(adminController.destroyReview)
);

module.exports = router;

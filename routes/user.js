const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, validateUser } = require("../middleware.js");
const userController = require("../controllers/user.js");
const homeController = require("../controllers/home.js");

// signup (router.route)
router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(validateUser, wrapAsync(userController.SignUp)
);

// login User (router.route)
router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl
        ,passport.authenticate("local"
        ,{ failureRedirect : "/login", failureFlash : true })
            ,(userController.Login)
);
// logout 
router.post("/logout" 
    ,userController.logOut
);

router.get("/", wrapAsync(homeController.renderHome));


module.exports = router;

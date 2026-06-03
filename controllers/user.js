const User = require("../models/user.js");

module.exports.renderSignUpForm = (req,res) => {
    res.render("./user/signup.ejs");
}

module.exports.SignUp = async(req,res,next) => {
    try {
        let { username, email ,password} = req.body;
        const newUser = new User({username: username.trim(), email: email.trim().toLowerCase()});
        const registeredUser = await User.register(newUser , password);

        req.login(registeredUser,(err)=>{
            if(err) {
                return next(err);
            }
        req.flash("success" , "Welcome to WanderLust");
        res.redirect("/listings");
        })  

    }catch(e) {
        req.flash("error" , e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("./user/login.ejs", { messages: req.flash() });
}

module.exports.Login = async(req,res) => {
    // let{ user } = req.params;
    req.flash("success", "Welcome to WanderLust");
    let checkRedirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(checkRedirectUrl);
}

module.exports.logOut = (req,res,next) => {
    req.logout((err) => {
        if(err) {
            return next(err);  
        }
        req.flash("success" , "You are Logged out");
        res.redirect("/listings")
    });
}

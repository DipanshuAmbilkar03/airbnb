if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// REQUIREMENTS
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 8080;
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const expressError = require("./utils/expressError.js");
const session = require("express-session");
const { MongoStore } = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport"); 
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const { ensureCsrfToken, verifyCsrfToken } = require("./middleware.js");

// Mongoose connections
const dbUrl = process.env.ATLASDB;
const sessionSecret = process.env.SECRET;
const isProduction = process.env.NODE_ENV === "production";

if (!dbUrl) {
    throw new Error("ATLASDB must be configured before starting the app.");
}

if (!sessionSecret) {
    throw new Error("SECRET must be configured before starting the app.");
}

const store = new MongoStore({
    mongoUrl: dbUrl,
    crypto: {
        secret: sessionSecret,
    },
    touchAfter: 24 * 3600,
});

store.on("error" , (err) => {
    console.log("Error in MONGO SESSION STORE", err);
});

// session 
const sessionOption = {
    name: "wanderlust.sid",
    store,
    secret : sessionSecret,
    resave : false,
    saveUninitialized : false,
    cookie: {
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
        sameSite: "lax",
        secure: isProduction,
    },
};

// express routers
const listingRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");

// middleWares
app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "./views"));
app.engine("ejs", ejsMate); 
app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(compression());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "https://images.unsplash.com", "https://res.cloudinary.com"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: isProduction ? [] : null,
        },
    },
    crossOriginEmbedderPolicy: false,
}));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: "draft-7",
    legacyHeaders: false,
}));

app.use(["/login", "/signup"], rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
}));

app.use(express.urlencoded({ extended : true, limit: "100kb" }));
app.use(mongoSanitize());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "/public"), {
    maxAge: isProduction ? "7d" : 0,
}));

// session middleware
app.use(session(sessionOption));

// flash 
app.use(flash());

// passport initialization and session setup
app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(ensureCsrfToken);

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.searchQuery = typeof req.query.search === "string" ? req.query.search : "";
    next();
});

app.use(verifyCsrfToken);


// main connection
main()
    .then(() => {
        console.log("connected to DataBase");
    })
    .catch((err) => console.log(err));

async function main() {
    mongoose.set("sanitizeFilter", true);
    await mongoose.connect(dbUrl);
}

// listings 
app.use("/listings" , listingRouter); 
// reviews
app.use("/listings/:id/reviews" , reviewsRouter);
// admin
app.use("/admin", adminRouter);
// users
app.use("/" , userRouter);

// error for an entirly different api route
app.all("*" , (req, res, next) => {
    next(new expressError(404 , "Page Not Found!"))
})
    
// error middleware
// app.use((err, req, res, next) => {
//     res.send("something failed");
// })

// error middleware using expressclass
app.use((err, req, res, next) => {
    if (err.name === "MulterError") {
        err.statusCode = 400;
        err.message = err.message || "The uploaded file could not be processed.";
    }

    let {statusCode=500, message="something went wrong"} = err;
    const safeMessage = isProduction && statusCode === 500 ? "Something went wrong." : message;
    res.status(statusCode).render("error.ejs", {
        err: {
            statusCode,
            message: safeMessage,
        },
    });
});

app.listen(port, () => {
    console.log(`app is listening to port ${port}`)
}); 

// Load environment variables
require("dotenv").config();

// Core modules
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

// View engine
const ejsMate = require("ejs-mate");

// Session and flash
const session = require("express-session");
const flash = require("connect-flash");

// Passport for authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Custom error utility
const ExpressError = require("./utils/ExpressError.js");

// Routers
const homeRouter = require("./routes/home.js");
const blogingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");
const employeeRoutes = require("./routes/employee.js");

// Load environment variables
const port = process.env.PORT || 8080;
const mongo_url = process.env.MONGODB_URL;

// --- DATABASE CONNECTION ---
if (!mongo_url) {
  console.error("❌ MONGODB_URL is not defined in .env file.");
  process.exit(1);
}

mongoose
  .connect(mongo_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// --- SESSION SETUP ---
const sessionOptions = {
  secret: "mytsupersecretcode", // should be in .env in real production apps
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
};
// --- Admin User Creation from ENV (only if not already exists) ---
const setupAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({
      username: process.env.ADMIN_USERNAME,
    });

    if (!existingAdmin) {
      const newAdmin = new User({
        username: process.env.ADMIN_USERNAME,
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        role: "admin",
      });

      await User.register(newAdmin, process.env.ADMIN_PASSWORD);
      console.log("✅ Admin user created successfully");
    } else {
      console.log("ℹ️ Admin user already exists");
    }
  } catch (err) {
    console.error("❌ Error setting up admin user:", err);
  }
};

// Call the setup function
setupAdminUser();

// --- VIEW ENGINE SETUP ---
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- MIDDLEWARE ---
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionOptions));
app.use(flash());

// --- PASSPORT CONFIG ---
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// --- GLOBAL TEMPLATE VARIABLES ---
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// --- ROUTES ---
app.use("/admin", adminRouter);
app.use("/bloging", blogingRouter);
app.use("/bloging/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", homeRouter);
app.use("/employee", employeeRoutes);

// --- 404 HANDLER ---
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// --- START SERVER ---
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

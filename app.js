const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const mongo_url = "mongodb://127.0.0.1:27017/analitix";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//  Renamed listingRouter to blogingRouter for clarity
const homeRouter = require("./routes/home.js");
const blogingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");
const employeeRoutes = require("./routes/employee.js");

// DB connection
main()
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(mongo_url);
}

const sessionOptions = {
  secret: "mytsupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
// const newAdmin = new User({
//   username: "admin",
//   name: "Admin",
//   email: "admin@example.com",
//   role: "admin",
// });
// User.register(newAdmin, "adminpassword");

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionOptions));
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global variables for templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Root route
// app.get("/", (req, res) => {
//   res.send("Server is running");
// });

// Use consistent route naming
app.use("/admin", adminRouter);
app.use("/bloging", blogingRouter);
app.use("/bloging/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", homeRouter);
app.use("/employee", employeeRoutes);
// 404 and Error handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});

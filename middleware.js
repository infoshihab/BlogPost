const Bloging = require("./models/bloging.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { blogpost } = require("./schema.js");
const { reviewSchema } = require("./schema.js");

// Check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to perform this action!");
    return res.redirect("/login");
  }
  next();
};

// Save the redirect URL for after login
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// Check if the current user is the owner of the blog post
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const bloging = await Bloging.findById(id);
  if (!bloging) {
    req.flash("error", "Blog post not found");
    return res.redirect("/bloging");
  }
  if (!bloging.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this blog post");
    return res.redirect(`/bloging/${id}`);
  }

  next();
};

// Validate blog post input data using Joi
module.exports.validateListing = (req, res, next) => {
  const { error } = blogpost.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Validate review input data using Joi
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Check if the current user is the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId, id } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/bloging/${id}`);
  }
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/bloging/${id}`);
  }
  next();
};

// middlewares/isEmployee.js
module.exports.isEmployee = (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== "employee") {
    req.flash("error", "Only employees can perform this action.");
    return res.redirect("/");
  }
  next();
};

// middlewares/isUser.js
module.exports.isUser = (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== "user") {
    req.flash("error", "Only regular users can perform this action.");
    return res.redirect("/");
  }
  next();
};

// middlewares/isAdmin.js
module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    req.flash("error", "Admin access only.");
    return res.redirect("/");
  }
  next();
};

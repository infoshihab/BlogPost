const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner } = require("../middleware.js");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review");
const Bloging = require("../models/bloging");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Post review route
router.post(
  "/",
  isLoggedIn,

  validateReview,
  wrapAsync(async (req, res) => {
    let bloging = await Bloging.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    bloging.reviews.push(newReview);
    await newReview.save();
    await bloging.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/bloging/${bloging._id}`);
  })
);

//Delete review route

router.delete(
  "/:reviewId",
  isLoggedIn,

  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Bloging.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/bloging/${id}`);
  })
);

module.exports = router;

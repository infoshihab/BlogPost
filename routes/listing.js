const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, isEmployee } = require("../middleware.js");
const { blogpost } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Bloging = require("../models/bloging.js");

const validateListing = (req, res, next) => {
  let { error } = blogpost.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Index Route

router.get(
  "/",
  isLoggedIn,
  isEmployee,
  wrapAsync(async (req, res) => {
    const allbloging = await Bloging.find({ owner: req.user._id }).populate(
      "owner"
    );
    res.render("blogings/index.ejs", { allbloging });
  })
);

//New Route

router.get("/new", isLoggedIn, async (req, res) => {
  res.render("blogings/new.ejs");
});

//Show route
router.get(
  "/:id",

  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const bloging = await Bloging.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");
    if (!bloging) {
      req.flash("error", "Bloging you requested for dose not exist!");
      return res.redirect("/bloging");
    }
    res.render("blogings/show.ejs", { bloging });
  })
);
//Create route
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    let newBloging = new Bloging(req.body.bloging);
    newBloging.owner = req.user._id;
    await newBloging.save();
    req.flash("success", "New Bloging Created!");
    res.redirect("/");
  })
);

//Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const bloging = await Bloging.findById(id);
    if (!bloging) {
      req.flash("error", "Bloging you requested for dose not exist!");
      return res.redirect("/bloging");
    }
    res.render("blogings/edit.ejs", { bloging });
  })
);

//Update Route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Bloging.findByIdAndUpdate(id, { ...req.body.bloging });
    req.flash("success", "Bloging Updated!");
    res.redirect(`/bloging/${id}`);
  })
);

//Delete Route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deletebloging = await Bloging.findByIdAndDelete(id);
    req.flash("success", "Bloging Deleted!");
    res.redirect("/bloging");
    //console.log(deletebloging);
  })
);

module.exports = router;

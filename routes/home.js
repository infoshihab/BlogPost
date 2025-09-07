const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Bloging = require("../models/bloging.js");

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const selectedCategory = req.query.category || null;

    let filter = { isApproved: true };
    if (selectedCategory && selectedCategory !== "breakingnews") {
      filter.category = new RegExp(`^${selectedCategory}$`, "i");
    }

    let allbloging = await Bloging.find(filter);

    let breakingNews = [];
    let normalNews = [];

    if (selectedCategory === "breakingnews") {
      breakingNews = await Bloging.find({ isApproved: true, isBreaking: true });
    } else {
      breakingNews = await Bloging.find({ isApproved: true, isBreaking: true });
      breakingNews = breakingNews.slice(0, 2); // Only show latest 2 on home
      normalNews = allbloging.filter((b) => !b.isBreaking);
    }

    const showBreakingSection =
      selectedCategory !== "breakingnews" && breakingNews.length > 0;

    res.render("blogings/home.ejs", {
      breakingNews,
      normalNews,
      selectedCategory,
      showBreakingSection,
    });
  })
);

module.exports = router;

const express = require("express");
const router = express.Router();
const Bloging = require("../models/bloging.js");
const User = require("../models/user.js");
const { isAdmin } = require("../middleware.js");
const passport = require("passport");

// Admin Dashboard - Show Unapproved & Approved Blog Posts
router.get("/dashboard", isAdmin, async (req, res) => {
  const unapprovedBlogs = await Bloging.find({ isApproved: false }).populate(
    "owner"
  );
  const approvedBlogs = await Bloging.find({ isApproved: true });
  res.render("admin/dashboard", { unapprovedBlogs, approvedBlogs });
});

// Approve Blog Post
router.post("/approve/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  await Bloging.findByIdAndUpdate(id, { isApproved: true });
  req.flash("success", "Blog post approved!");
  res.redirect("/admin/dashboard");
});

// Delete Blog Post
router.post("/delete/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  await Bloging.findByIdAndDelete(id);
  req.flash("success", "Blog post deleted!");
  res.redirect("/admin/dashboard");
});

// ✅ Toggle Breaking News
router.post("/toggle-breaking/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Bloging.findById(id);
    blog.isBreaking = !blog.isBreaking;
    await blog.save();
    req.flash("success", `Breaking status updated for "${blog.title}"`);
  } catch (err) {
    req.flash("error", "Error updating breaking status");
  }
  res.redirect("/admin/dashboard");
});

// Register Employee Page
router.get("/register", isAdmin, (req, res) => {
  res.render("admin/register");
});

// Register Employee Handler
router.post("/register", isAdmin, async (req, res) => {
  const { username, password, name, email } = req.body;
  const newUser = new User({ username, name, email, role: "employee" });
  await User.register(newUser, password);
  req.flash("success", "New employee registered!");
  res.redirect("/admin/dashboard");
});

module.exports = router;

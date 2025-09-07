const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware.js");
const Employee = require("../models/employee");
const User = require("../models/user");

// Create new employee (also registers as a user)
router.post("/", isAdmin, async (req, res) => {
  const { name, position, email, username, password } = req.body;

  try {
    // 1. Register the employee as a User
    const newUser = new User({
      username,
      name,
      email,
      role: "employee",
    });
    const registeredUser = await User.register(newUser, password);

    // 2. Create an Employee document with extra info
    await Employee.create({
      name,
      position,
      email,
      username,
      createBy: req.user._id,
    });

    req.flash("success", "New employee created and can now log in!");
    res.redirect("/employee");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create employee: " + err.message);
    res.redirect("/employee/new");
  }
});

// Show all employees created by current admin
router.get("/", isAdmin, async (req, res) => {
  const employees = await Employee.find({ createBy: req.user._id })
    .sort({ createdAt: -1 })
    .populate("createBy");
  res.render("employee/index", { employees });
});

// Show new employee form
router.get("/new", isAdmin, (req, res) => {
  res.render("employee/new");
});

// Show edit form
router.get("/:id/edit", isAdmin, async (req, res) => {
  const { id } = req.params;
  const employee = await Employee.findById(id);
  res.render("employee/edit", { employee });
});

// Update employee info
router.post("/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, position, email } = req.body;
  await Employee.findByIdAndUpdate(id, { name, position, email });
  res.redirect("/employee");
});

// Delete employee
router.delete("/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await Employee.findByIdAndDelete(id);
    const employee = await Employee.findById(id);
    if (employee) {
      await User.findOneAndDelete({ username: employee.username });
    }

    req.flash("success", "Employee deleted successfully.");
    res.redirect("/employee");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete employee.");
    res.redirect("/employee");
  }
});

module.exports = router;

const { required } = require("joi");
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: String,
    position: String,
    email: String,
    username: String,
    createBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true } // ✅ This adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("Employee", employeeSchema);

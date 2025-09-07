const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;
const blogpost = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: { type: String, required: true },
  image: {
    type: String,
  },
  description: { type: String, required: true },
  date: {
    type: Date,
    default: Date.now,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  category: {
    type: String,
    enum: ["Global", "Politics", "Sports", "Blogs", "Other"],
    default: "Other",
    required: true,
  },
  isBreaking: {
    type: Boolean,
    default: false,
  },
});

blogpost.post("findOneAndDelete", async (bloging) => {
  if (bloging) {
    await Review.deleteMany({ _id: { $in: bloging.reviews } });
  }
});
const Bloging = mongoose.model("Bloging", blogpost);
module.exports = Bloging;

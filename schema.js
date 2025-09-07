const Joi = require("joi");

module.exports.blogpost = Joi.object({
  bloging: Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().allow("", null),
    category: Joi.string()
      .valid("Global", "Politics", "Sports", "Blogs", "Other")
      .required(),
    isBreaking: Joi.boolean(),
    date: Joi.date().required(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});

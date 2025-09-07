const mongoose = require("mongoose");
const mongo_url = "mongodb://127.0.0.1:27017/analitix";
const initData = require("./data.js");
const Bloging = require("../models/listEntry.js");

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

const initDB = async () => {
  await Bloging.deleteMany({});
  await Bloging.insertMany(initData.data);
  console.log("data was initialized");
};
initDB();

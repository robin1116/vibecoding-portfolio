const mongoose = require("mongoose");

const DEFAULT_URI =
  process.env.MONGO_URI || "mongodb://192.168.0.115:27017/?directConnection=true";

let isConnected = false;

async function connectMongoose() {
  if (isConnected) return mongoose.connection;

  mongoose.set("strictQuery", true);

  await mongoose.connect(DEFAULT_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    family: 4,
    dbName: process.env.MONGO_DB || "appdb",
  });

  isConnected = true;
  return mongoose.connection;
}

module.exports = { mongoose, connectMongoose };

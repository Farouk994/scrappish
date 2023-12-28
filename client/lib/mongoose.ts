/** @format */

import mongoose from "mongoose";

let isConnected = false; // variable to track the connection status

export const connectDb = async () => {
  mongoose.set("strictQuery", true); // this is to allow the use of $push in the updateOne method
  if (!process.env.MONGODB_URI)
    return console.log("MONDODB_URI is not defined");

  if (isConnected) return console.log("=> using existing database connection");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error);
  }
};
// H1ZXTtWYhMSBEcFx
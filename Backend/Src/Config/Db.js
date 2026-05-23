/**
 * @file Db.js
 * @description Mongoose connection helper configuration for MongoDB.
 */

import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database using the environment-defined connection URI.
 * Logs connection status and terminates the process if the connection fails.
 */
const connectDB = async () => {
  try {
    // Attempt connection using the MONGO_URI environment variable
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log error message and exit the process with code 1 (failure)
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
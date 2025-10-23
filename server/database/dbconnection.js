import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const Connection = async () => {
  const dbURL = process.env.DB_URL;

  if (!dbURL) {
    console.error("❌ DB_URL not found in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(dbURL, {
      dbName: "ECOMMERCE",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ Connected to MongoDB [${mongoose.connection.name}]`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default Connection;

import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import { Product } from "./models/productModel.js";

// dotenv.config();

// mongoose
//   .connect(process.env.DB_URL, {
//     dbName: "ECOMMERCE",
 
//   })
//   .then(() => {
//     console.log("✅ MongoDB connected.");
//     importAndInsertProducts();
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB connection failed:", err.message);
//   });

// const importAndInsertProducts = async () => {
//   try {
//     const dataBuffer = fs.readFileSync("./product.json", "utf-8");
//     const products = JSON.parse(dataBuffer);

//     if (!Array.isArray(products)) {
//       console.error("❌ Invalid JSON data format");
//       process.exit(1);
//     }

//     // Direct insert without changing images
//     await Product.insertMany(products);
//     console.log(`✅ Successfully inserted ${products.length} products (without image upload).`);
//     process.exit();
//   } catch (error) {
//     console.error("❌ Error inserting products:", error.message);
//     process.exit(1);
//   }
// };

// .env file ko load karne ke liye yeh line add karein












// const DB_URL = "mongodb://localhost:27017/ECOMMERCE";

// const runUpdate = async () => {
//     console.log("--- STEP 1: DATABASE CONNECTION ---");
//     console.log("Connecting to DB:", DB_URL);

//     try {
//         await mongoose.connect(DB_URL);
//         console.log("✅ MongoDB se successfully connect ho gaye.");
//         console.log("-------------------------------------\n");

//         console.log("--- STEP 2: CHECKING COLLECTION DATA ---");
//         const totalDocs = await Product.countDocuments();
//         console.log(`'Product' model ko collection mein ${totalDocs} documents mile.`);

//         if (totalDocs === 0) {
//             console.error("❌ ERROR: Collection khali hai.");
//             await mongoose.connection.close();
//             return;
//         }

//         console.log("--- STEP 3: RUNNING UPDATE OPERATION ---");
//         const electronicCategories = [
//             "Smartphone"
//         ];
//         const categoriesRegex = electronicCategories.map(cat => new RegExp(`^${cat}$`, 'i'));

//         const result = await Product.updateMany(
//             { category: { $in: categoriesRegex } },
//             { $set: { type: 'Smartphone' } }
//         );

//         console.log("\n🎉 Update operation ka result:");
//         console.log(`Documents jo condition se mile (matchedCount): ${result.matchedCount}`);
//         console.log(`Documents jo update hue (modifiedCount): ${result.modifiedCount}`);
//         console.log("-------------------------------------\n");

//     } catch (error) {
//         console.error('❌ SCRIPT MEIN ERROR AAGAYA:', error);
//     } finally {
//         if (mongoose.connection.readyState === 1) {
//             await mongoose.connection.close();
//             console.log('🔌 MongoDB connection band kar diya gaya.');
//         }
//     }
// };

// runUpdate();










// import { Review } from "./models/reviewModel.js";

// const MONGO_URI = "mongodb://localhost:27017/ECOMMERCE";
// const specificUserId = '68e246092c0593e2c5dad981';


// const sampleComments = [
//   "This is an amazing product! Totally worth the price.",
//   "Good quality and fast delivery. I'm very satisfied.",
//   "Exceeded my expectations. Highly recommended to everyone.",
//   "Decent product for the cost. Does the job well.",
//   "I've been using this for a week and I love it.",
//   "The build quality is excellent. Feels very premium.",
//   "A must-buy item! You won't regret it.",
// ];


// // --- STEP 3: MAIN FUNCTION TO CONNECT AND ADD REVIEWS ---

// const connectAndAddReviews = async () => {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("✅ MongoDB से सफलतापूर्वक कनेक्ट हो गया है।");
//     const allProducts = await Product.find({});
//     if (allProducts.length === 0) {
//       console.log("🟡 डेटाबेस में कोई प्रोडक्ट नहीं मिला।");
//       return;
//     }
//     console.log(`🔍 कुल ${allProducts.length} प्रोडक्ट्स मिले। रिव्यू जोड़ना शुरू किया जा रहा है...`);
//     for (const product of allProducts) {
//       const randomRating = Math.floor(Math.random() * 3) + 3;
//       const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
//       const newReview = new Review({
//         user: specificUserId,
//         product: product._id,
//         rating: randomRating,
//         comment: randomComment,
//       });
//       const savedReview = await newReview.save();

//       // ✨✨✨ यहाँ बदलाव किया गया है ✨✨✨
//       await Product.updateOne(
//         { _id: product._id },
//         { $push: { reviews: savedReview._id } }
//       );

//       console.log(`✔️ प्रोडक्ट "${product.name}" के लिए सफलतापूर्वक रिव्यू जोड़ा गया।`);
//     }
//     console.log("\n🎉 सभी प्रोडक्ट्स को सफलतापूर्वक रिव्यू कर दिया गया है!");
//   } catch (error) {
//     console.error("❌ स्क्रिप्ट चलाने में एक त्रुटि हुई:", error);
//   } finally {
//     await mongoose.connection.close();
//     console.log("🔌 MongoDB कनेक्शन बंद हो गया है।");
//   }
// };

// // --- RUN SCRIPT ---
// connectAndAddReviews();










// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import { Product } from "./models/productModel.js"; // सुनिश्चित करें कि यह पाथ सही है

dotenv.config();

// वह सेलर आईडी जिसे आप सभी प्रोडक्ट्स में डालना चाहते हैं
const sellerIdToUpdate = "68edf275eb600ee3c6387215";

/**
 * यह फ़ंक्शन डेटाबेस में मौजूद सभी प्रोडक्ट्स के 'seller' फ़ील्ड को अपडेट करता है।
 */
const updateAllProductsWithSellerId = async () => {
  try {
    console.log("🔄 Starting to update products with new seller ID...");

    // Product.updateMany(filter, update)
    // पहला आर्गुमेंट {}: इसका मतलब है कि सभी डॉक्यूमेंट्स को चुनें (कोई फ़िल्टर नहीं)।
    // दूसरा आर्गुमेंट { $set: ... }: इसका मतलब है कि चुने हुए सभी डॉक्यूमेंट्स में 'seller' फ़ील्ड को नई वैल्यू पर सेट करें।
    const result = await Product.updateMany(
      {}, // खाली फ़िल्टर का मतलब है "सभी प्रोडक्ट्स"
      { $set: { seller: sellerIdToUpdate } }
    );

    console.log(`✅ Success! ${result.modifiedCount} products were updated.`);
    process.exit(0); // सफलता के बाद स्क्रिप्ट को बंद कर दें
  } catch (error) {
    console.error("❌ Error updating products:", error.message);
    process.exit(1); // एरर आने पर स्क्रिप्ट को बंद कर दें
  }
};

// MongoDB कनेक्शन
mongoose
  .connect(process.env.DB_URL, {
    dbName: "ECOMMERCE",
  })
  .then(() => {
    console.log("✅ MongoDB connected.");
    // कनेक्शन सफल होने पर अपडेट वाला फ़ंक्शन चलाएँ
    updateAllProductsWithSellerId();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
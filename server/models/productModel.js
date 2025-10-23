// import mongoose from "mongoose";

// const specSchema = new mongoose.Schema({
//   key: String,
//   value: String,
// });

// const imageSchema = new mongoose.Schema({
//   url: String,
//   public_id: String,
// });

// const productSchema = new mongoose.Schema({
//   seller: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   name: { type: String, required: true },
//   description: String,
//   price: { type: Number, required: true },
//   stock: { type: Number, required: true },
//   category: { type: String, required: true },
//   type: { type: String ,required: true},
//   specifications: [specSchema],
//   images: [imageSchema],
//     reviews: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Review", // 'Review' model ko reference karega
//     },
//   ],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// export const Product =  mongoose.model("Product", productSchema);



import mongoose from "mongoose";

const specSchema = new mongoose.Schema({
  key: String,
  value: String,
});

const imageSchema = new mongoose.Schema({
  url: String,
  public_id: String,
});

const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, required: true },
  specifications: [specSchema],
  images: [imageSchema],
  banner: {
    url: { type: String, required: false },
    public_id: { type: String, required: false }
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.model("Product", productSchema);

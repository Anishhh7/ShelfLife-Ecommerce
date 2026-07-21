import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
 {
  name: {
   type: String,
   required: [true, "Please provide your product name"],
   trim: true
  },

  description: {
   type: String,
   maxlength: [250, "Description can not be longer that 250 characters"]
  },

  price: {
   type: Number,
   required: [true, "A product must have a price"]
  },

  stock: {
   type: Number,
   required: [true, "A product stock must be provided"]
  },

  images: {
   type: [String]
  },

  vendor: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "User",
   required: true
  },

  active: {
   type: Boolean,
   default: true
  }
 },
 {
  timestamps: true
 }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;

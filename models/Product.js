import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    imageUrl: { type: String }, // stores relative path like "/uploads/xxx.jpg"
    category: { type: String },
    stock: { type: Number, default: 0 },
    sizeOptions: { type: [String], default: [] },
    colorOptions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);

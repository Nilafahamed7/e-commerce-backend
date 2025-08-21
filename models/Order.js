import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, default: 1 },
        customText: String,
        customImageUrl: String
      }
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: "COD" },        // Razorpay later
    orderStatus: { type: String, default: "Processing" }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

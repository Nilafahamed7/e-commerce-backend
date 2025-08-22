

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
        title: { type: String, required: true }, // snapshot of product name
        price: { type: Number, required: true }, // snapshot of product price
        quantity: { type: Number, default: 1 },
        customText: String,
        customImageUrl: String,
      },
    ],

    totalAmount: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ["COD", "Razorpay", "Stripe"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    paymentInfo: {
      transactionId: String, // order_id from Razorpay/Stripe
      paymentId: String,     // payment_id
      signature: String,     // for Razorpay verification
    },

    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },

    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

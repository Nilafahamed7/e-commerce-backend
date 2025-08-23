// server/controllers/orderController.js
import Order from "../models/Order.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
import Product from "../models/Product.js";

dotenv.config();

console.log("KEY ID:", process.env.RAZORPAY_KEY_ID);
console.log("KEY SECRET:", process.env.RAZORPAY_KEY_SECRET);


// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("❌ Razorpay Order Error:", err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

// ✅ Verify Razorpay Payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      products,
      totalAmount,
      shippingAddress,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment details missing" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // ✅ Save order in DB
    const newOrder = new Order({
      userId: req.user.id,
      products,
      totalAmount,
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
      shippingAddress,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("❌ Payment Verification Error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// ✅ Create COD Order
export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    const newOrder = new Order({
      userId: req.user.id,
      products,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      shippingAddress,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("❌ COD Order Error:", err);
    res.status(500).json({ message: err.message });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("products.productId", "name price imageUrl") // ✅ populate imageUrl
      .sort({ createdAt: -1 });

    res.json(orders); // return array
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ Admin: Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email") // show user info
      .populate("products.productId", "name price imageUrl") // include product image
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching all orders:", error);
    res.status(500).json({ message: "Server error while fetching all orders" });
  }
};


// ✅ Admin: Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = req.body.orderStatus;
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    console.error("❌ Update Status Error:", err);
    res.status(500).json({ message: err.message });
  }
};

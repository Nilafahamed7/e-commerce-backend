import Order from "../models/Order.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // in paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("❌ Razorpay Order Error:", err.message);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

// ✅ Verify Razorpay Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, products, totalAmount } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const newOrder = new Order({
      userId: req.user.id,
      products,
      totalAmount,
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("❌ Payment Verification Error:", err.message);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// ✅ Create COD Order
export const createOrder = async (req, res) => {
  try {
    const newOrder = new Order({
      userId: req.user.id,
      products: req.body.products,
      totalAmount: req.body.totalAmount,
      paymentMethod: req.body.paymentMethod || "COD",
      paymentStatus: req.body.paymentMethod === "COD" ? "Pending" : "Paid",
      shippingAddress: req.body.shippingAddress,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("❌ COD Order Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ User: Get My Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Get My Orders Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email");
    res.json(orders);
  } catch (err) {
    console.error("❌ Get All Orders Error:", err.message);
    res.status(500).json({ message: err.message });
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
    console.error("❌ Update Status Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

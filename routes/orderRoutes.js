// // server/routes/orderRoutes.js
// import express from "express";
// import {
//   createOrder,
//   getMyOrders,
//   getAllOrders,
//   updateOrderStatus,
//   createRazorpayOrder,
//   verifyPayment,
// } from "../controllers/orderController.js";
// import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // ✅ COD Orders
// router.post("/", authMiddleware, createOrder);

// // ✅ Razorpay Order Creation
// router.post("/razorpay", authMiddleware, createRazorpayOrder);

// // ✅ Razorpay Payment Verification
// router.post("/verify", authMiddleware, verifyPayment);

// // ✅ User: Get My Orders
// router.get("/myorders", authMiddleware, getMyOrders);

// // ✅ Admin: Get All Orders
// router.get("/", authMiddleware, adminMiddleware, getAllOrders);

// // ✅ Admin: Update Order Status
// router.put("/:id", authMiddleware, adminMiddleware, updateOrderStatus);

// export default router;

// server/routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyPayment,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// ✅ COD Orders
router.post("/", protect, createOrder);

// ✅ Razorpay Order Creation
router.post("/razorpay", protect, createRazorpayOrder);

// ✅ Razorpay Payment Verification
router.post("/verify", protect, verifyPayment);

// ✅ User: Get My Orders
router.get("/myorders", protect, getMyOrders);

// ✅ Admin: Get All Orders
router.get("/", protect, admin, getAllOrders);

// ✅ Admin: Update Order Status
router.put("/:id", protect, admin, updateOrderStatus);

export default router;

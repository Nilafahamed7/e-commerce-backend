import express from "express";
import { createOrder, getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getAllOrders);
router.patch("/:id/status", protect, updateOrderStatus);

export default router;

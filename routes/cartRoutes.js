import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getCart,
  addToCart,
  updateCartQuantity, // ✅ use the right name
  removeFromCart,     // ✅ use the right name
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.patch("/:itemId", protect, updateCartQuantity);
router.delete("/:itemId", protect, removeFromCart);

export default router;

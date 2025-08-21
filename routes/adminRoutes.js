import express from "express";
import { protect, admin } from "../middleware/auth.js";
import { getDashboardStats } from "../controllers/adminController.js";

const router = express.Router();

// Only admin can access dashboard stats
router.get("/dashboard", protect, admin, getDashboardStats);

export default router;

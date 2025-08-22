import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Get current user profile
router.get("/me", protect, (req, res) => {
  const u = req.user;
  res.json({ id: u._id, name: u.name, email: u.email, isAdmin: u.isAdmin });
});

export default router;

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// ✅ Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Ensure uploads folder exists (server/uploads)
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // unique filename (timestamp + extension)
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ------------------ ROUTES ------------------

// 🔹 Get all products
router.get("/", getAllProducts);

// 🔹 Get product by ID
router.get("/:id", getProductById);

// 🔹 Create product (admin only)
router.post("/", protect, admin, createProduct);

// 🔹 Delete product (admin only)
router.delete("/:id", protect, admin, deleteProduct);

// 🔹 Upload image (admin only)
router.post(
  "/upload-image",
  protect,
  admin,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✅ Return relative path (so DB stores `/uploads/...`)
    const relativePath = `/uploads/${req.file.filename}`;

    // ✅ Also return absolute URL for frontend preview
    const imageUrl = `${req.protocol}://${req.get("host")}${relativePath}`;

    res.json({ url: imageUrl, path: relativePath });
  }
);

export default router;

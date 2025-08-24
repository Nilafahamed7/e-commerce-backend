// import express from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import {
//   getAllProducts,
//   getProductById,
//   createProduct,
//   deleteProduct,
// } from "../controllers/productController.js";
// import { protect, admin } from "../middleware/auth.js";

// const router = express.Router();

// // ✅ Setup __dirname for ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ✅ Ensure uploads folder exists (server/uploads)
// const uploadDir = path.join(__dirname, "../uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // ✅ Multer storage config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     // unique filename (timestamp + extension)
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// // ------------------ ROUTES ------------------

// // 🔹 Get all products
// router.get("/", getAllProducts);

// // 🔹 Get product by ID
// router.get("/:id", getProductById);

// // 🔹 Create product (admin only)
// router.post("/", protect, admin, createProduct);

// // 🔹 Delete product (admin only)
// router.delete("/:id", protect, admin, deleteProduct);

// // 🔹 Upload image (admin only)
// router.post(
//   "/upload-image",
//   protect,
//   admin,
//   upload.single("image"),
//   (req, res) => {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     // ✅ Return relative path (so DB stores `/uploads/...`)
//     const relativePath = `/uploads/${req.file.filename}`;

//     // ✅ Also return absolute URL for frontend preview
//     const imageUrl = `${req.protocol}://${req.get("host")}${relativePath}`;

//     res.json({ url: imageUrl, path: relativePath });
//   }
// );

// export default router;

import express from "express";
import multer from "multer";
import { Readable } from "stream";
import {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/auth.js";
import cloudinary from "../config/cloudinary.js";
// ✅ your cloudinary config

const router = express.Router();

// ✅ Use memory storage (so files go to buffer instead of disk)
const upload = multer({ storage: multer.memoryStorage() });

// Helper: upload buffer to Cloudinary
function uploadBufferToCloudinary(buffer, folder = "ecommerce/products") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

// ------------------ ROUTES ------------------

// 🔹 Get all products
router.get("/", getAllProducts);

// 🔹 Get product by ID
router.get("/:id", getProductById);

// 🔹 Create product (admin only, with image upload)
router.post("/", protect, admin, upload.single("image"), async (req, res) => {
  try {
    let imageUrl = null;

    // ✅ If an image is uploaded → send to Cloudinary
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    // ✅ Call controller but inject Cloudinary URL
    req.body.imageUrl = imageUrl || req.body.imageUrl; // fallback if no file
    return createProduct(req, res);
  } catch (err) {
    console.error("Product creation error:", err);
    res.status(500).json({ message: "Product creation failed" });
  }
});

// 🔹 Delete product (admin only)
router.delete("/:id", protect, admin, deleteProduct);

export default router;

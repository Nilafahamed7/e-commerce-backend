import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

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

// ------------------ CONTROLLERS ------------------

// GET /api/products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    // ✅ imageUrl is already Cloudinary URL → return as-is
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products
export const createProduct = async (req, res) => {
  try {
    let imageUrl = null;

    // ✅ If file uploaded, send to Cloudinary
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    } else if (req.body.imageUrl) {
      // In case you pass a direct Cloudinary URL manually
      imageUrl = req.body.imageUrl;
    }

    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock,
      sizeOptions: req.body.sizeOptions || [],
      colorOptions: req.body.colorOptions || [],
      imageUrl, // ✅ now always Cloudinary absolute URL
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

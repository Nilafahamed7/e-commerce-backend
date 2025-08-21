import Product from "../models/Product.js";
import path from "path";

// GET /api/products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const formatted = products.map((p) => ({
      ...p._doc,
      imageUrl: p.imageUrl
        ? `${req.protocol}://${req.get("host")}${p.imageUrl}`
        : null,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const formatted = {
      ...product._doc,
      imageUrl: product.imageUrl
        ? `${req.protocol}://${req.get("host")}${product.imageUrl}`
        : null,
    };

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products
export const createProduct = async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl;

    if (imageUrl) {
      try {
        // Strip full URL to relative path
        const parsed = new URL(imageUrl);
        imageUrl = parsed.pathname;
      } catch (_) {
        // Not a full URL, ignore
      }

      // Auto-correct missing /uploads prefix
      if (!imageUrl.startsWith("/uploads/")) {
        imageUrl = `/uploads/${path.basename(imageUrl)}`;
      }
    }

    const newProduct = new Product({ ...req.body, imageUrl });
    const savedProduct = await newProduct.save();

    const formatted = {
      ...savedProduct._doc,
      imageUrl: savedProduct.imageUrl
        ? `${req.protocol}://${req.get("host")}${savedProduct.imageUrl}`
        : null,
    };

    res.status(201).json(formatted);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

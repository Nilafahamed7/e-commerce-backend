import Product from "../models/Product.js";

const buildImageUrl = (req, rawUrl) => {
  if (!rawUrl) return null;
  const normalized = String(rawUrl).trim();
  const lower = normalized.toLowerCase();
  if (lower.startsWith("http://") || lower.startsWith("https://")) {
    return normalized;
  }
  return `${req.protocol}://${req.get("host")}${normalized}`;
};

// GET /api/products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    // ✅ Prepend host when stored value is relative; keep absolute as-is
    const formatted = products.map((p) => ({
      ...p._doc,
      imageUrl: buildImageUrl(req, p.imageUrl),
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

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const formatted = {
      ...product._doc,
      imageUrl: buildImageUrl(req, product.imageUrl),
    };

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products
export const createProduct = async (req, res) => {
  try {
    // ✅ Normalize imageUrl to a relative path before saving
    let imageUrl = req.body.imageUrl;
    if (imageUrl) {
      // If a full URL was sent (e.g., http://localhost:3000/uploads/xxx.jpg), strip host
      try {
        const parsed = new URL(imageUrl);
        imageUrl = parsed.pathname;
      } catch (_) {
        // Not a full URL, keep as-is
      }

      if (!imageUrl.startsWith("/uploads/")) {
        return res.status(400).json({
          message: "imageUrl must resolve under /uploads (e.g. /uploads/file.png)",
        });
      }
    }

    const newProduct = new Product({ ...req.body, imageUrl });
    const savedProduct = await newProduct.save();

    const formatted = {
      ...savedProduct._doc,
      imageUrl: buildImageUrl(req, savedProduct.imageUrl),
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
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

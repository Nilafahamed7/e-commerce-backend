import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import cloudinary from "./config/cloudinary.js";
import Product from "./models/Product.js";

dotenv.config();

async function migrateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const products = await Product.find();

    for (let product of products) {
      if (!product.imageUrl) continue;

      // already Cloudinary?
      if (product.imageUrl.startsWith("http")) {
        console.log(`⏩ Skipping (already Cloudinary): ${product.name}`);
        continue;
      }

      // local file path
      const localPath = path.join("uploads", path.basename(product.imageUrl));
      if (!fs.existsSync(localPath)) {
        console.warn(`⚠️ File not found: ${localPath}`);
        continue;
      }

      console.log(`📤 Uploading ${product.name} -> Cloudinary...`);

      const result = await cloudinary.uploader.upload(localPath, {
        folder: "ecommerce/products",
      });

      product.imageUrl = result.secure_url;
      await product.save();

      console.log(`✅ Updated ${product.name}`);
    }

    console.log("🎉 Migration completed!");
    process.exit();
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrateImages();

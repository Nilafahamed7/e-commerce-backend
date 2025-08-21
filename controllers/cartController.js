import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ✅ Get Cart with product details populated
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate({
        path: "items.productId",
        model: "Product",
        select: "name price imageUrl", // only necessary fields
      });

    if (!cart) {
      return res.json({ items: [] });
    }

    // Format cart so frontend can directly access product info
    const formattedItems = cart.items.map(item => ({
      _id: item._id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      product: {
        _id: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        imageUrl: item.productId.imageUrl
          ? `${req.protocol}://${req.get("host")}${item.productId.imageUrl}`
          : null,
      },
    }));

    res.json({ items: formattedItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add Item to Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: [{ productId, quantity, size, color }],
      });
    } else {
      const existingItem = cart.items.find(
        item =>
          item.productId.toString() === productId &&
          item.size === size &&
          item.color === color
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, size, color });
      }
    }

    await cart.save();
    res.json({ message: "Item added to cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Quantity
export const updateCartQuantity = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = quantity;
    await cart.save();

    res.json({ message: "Quantity updated" });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Remove from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

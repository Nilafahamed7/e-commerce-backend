import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const newOrder = new Order({
      userId: req.user.id,
      products: req.body.products,
      totalAmount: req.body.totalAmount,
      paymentMethod: "COD"
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    order.orderStatus = req.body.orderStatus;
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

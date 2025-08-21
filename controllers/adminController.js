import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Example stats - customize as needed
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    // Monthly revenue chart data
    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      revenue: totalRevenue[0]?.total || 0,
      orders: totalOrders,
      products: totalProducts,
      users: totalUsers,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

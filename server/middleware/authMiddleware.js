
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Không có token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });

    req.user = user;
    req.auth = { userId: user._id };
    next();
  } catch (err) {
    console.error("Lỗi xác thực:", err);
    res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }
};

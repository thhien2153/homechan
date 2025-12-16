import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import Profile from '../models/Profile.js';


const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
//Hàm register - Đăng ký user:
export const register = async (req, res) => {
  try {
    const { username, fullname, email, phone, address, password } = req.body;
    let image;

    // Nếu có gửi file avatar
    if (req.file) {
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const upload = await cloudinary.uploader.upload(base64, { folder: "avatars" });
      image = upload.secure_url;
    } else {
      image = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
    }

    if (!username || !fullname || !email || !phone || !address || !password) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Mật khẩu phải tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt."
      });
    }

    const existing = await User.findOne({
      $or: [{ username }, { email }, { phone }]
    });
    if (existing) {
      return res.status(400).json({
        message: "Username, email hoặc số điện thoại đã tồn tại"
      });
    }

    const hashed = await bcrypt.hash(password, 8);
    const user = await User.create({
      username,
      fullname,
      email,
      phone,
      address,
      password: hashed,
      image,
      role: "user",
      recentSearchedCities: []
    });

    //tạo profile nếu chưa có
    const existingProfile = await Profile.findOne({ userId: user._id });

    if (!existingProfile) {
      await Profile.create({
        userId: user._id,
        username,
        fullname,
        email,
        phone,
        address,
        avatar: image   // dùng image đã upload hoặc dicebear
      });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
//Hàm login - Đăng nhập:
export const login = async (req, res) => {
  try {
    const { account, password } = req.body;

    const user = await User.findOne({
      $or: [{ username: account },
      { email: account },
      { phone: account }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

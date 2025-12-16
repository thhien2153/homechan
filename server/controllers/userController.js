import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { v2 as cloudinary } from 'cloudinary'; // <-- ĐÃ THÊM

// GET /api/user/
export const getUserData = async (req, res) => {
    try {
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
        res.json({ success: true, role, recentSearchedCities })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Người dùng cửa hàng đã tìm kiếm gần đây Thành phố
export const storeRecentSearchedCities = async (req, res) => {
    try {
        const { recentSearchedCity } = req.body;
        const user = await req.user;

        if (user.recentSearchedCities.length < 3) {
            user.recentSearchedCities.push(recentSearchedCity)
        } else {
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity)
        }

        await user.save();
        res.json({ success: true, message: "City added" });

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const promoteToOwner = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Admin cannot be promoted' });
        }

        user.role = 'hotelOwner';
        await user.save();

        const safeUser = user.toObject();
        delete safeUser.password;

        res.json({ success: true, message: 'User promoted to hotelOwner', user: safeUser });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// profile
// Lấy thông tin Profile đầy đủ (bao gồm Họ và tên, SĐT, Địa chỉ)
export const getProfile = async (req, res) => {
    try {
        // Lấy User model (chứa username, email, image)
        const user = await User.findById(req.user._id).select('username email role image');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Lấy Profile model (chứa fullname, phone, address, avatar)
        const profile = await Profile.findOne({ userId: req.user._id });

        // Tạo đối tượng profile hoàn chỉnh bằng cách kết hợp
        const fullProfile = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            // Lấy từ Profile model hoặc mặc định là rỗng
            fullname: profile?.fullname || user.username || '',
            phone: profile?.phone || '',
            address: profile?.address || '',
            // Sử dụng image từ User model (thường là link avatar chính)
            image: user.image || profile?.avatar || '',
            avatar: profile?.avatar || user.image || ''
        };

        res.json({ success: true, profile: fullProfile });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Cập nhật Profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { address } = req.body;
        let avatarUrl;

        // Xử lý upload ảnh avatar mới
        if (req.file) {
            const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
            const upload = await cloudinary.uploader.upload(base64, { folder: "avatars" });
            avatarUrl = upload.secure_url;
        }

        // Cập nhật User model
        const updateUserData = {};
        if (address) updateUserData.address = address;
        if (avatarUrl) updateUserData.image = avatarUrl;

        const user = await User.findByIdAndUpdate(
            userId,
            updateUserData,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Cập nhật hoặc tạo Profile model
        const profileUpdate = {};
        if (address) profileUpdate.address = address;
        if (avatarUrl) profileUpdate.avatar = avatarUrl;

        let profile = await Profile.findOne({ userId });

        if (profile) {
            // Nếu đã tồn tại, cập nhật
            profile = await Profile.findOneAndUpdate(
                { userId },
                profileUpdate,
                { new: true }
            );
        } else {
            // Nếu chưa tồn tại, tạo mới
            profile = await Profile.create({
                userId,
                username: user.username,
                fullname: user.username,
                email: user.email,
                phone: '',
                address: address || '',
                avatar: avatarUrl || user.image || ''
            });
        }

        // Tạo đối tượng profile hoàn chỉnh để gửi về client
        const fullProfile = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullname: profile?.fullname || user.username || '',
            phone: profile?.phone || '',
            address: profile?.address || '',
            dob: profile?.dob || '',
            image: user.image || '',
            avatar: profile?.avatar || user.image || ''
        };

        res.json({ success: true, user, profile: fullProfile });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ success: false, message: err.message || "Failed to update profile" });
    }
};

import express from 'express';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();


router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalHotels = await Hotel.countDocuments();
        const totalBookings = await Booking.countDocuments();

        const bookings = await Booking.find({ status: 'confirmed' });
        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

        res.json({
            totalUsers,
            totalHotels,
            totalBookings,
            totalRevenue
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Lấy danh sách tất cả users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const role = req.query.role || '';

        const query = {};

        // Tìm kiếm theo tên hoặc email
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Lọc theo role
        if (role && role !== 'all') {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cập nhật thông tin user
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role, isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { username, email, role, isActive },
            { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        res.json({ message: 'Cập nhật thành công', user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Xóa user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Không cho phép xóa chính mình
        if (id === req.user.id) {
            return res.status(400).json({ message: 'Không thể xóa chính mình' });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        // Xóa các hotels của user nếu là hotelOwner
        if (user.role === 'hotelOwner') {
            await Hotel.deleteMany({ owner: id });
        }

        // Xóa các bookings của user
        await Booking.deleteMany({ userId: id });

        res.json({ message: 'Xóa user thành công' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cập nhật trạng thái active/inactive
router.patch('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Không cho phép vô hiệu hóa chính mình
        if (id === req.user.id) {
            return res.status(400).json({ message: 'Không thể thay đổi trạng thái chính mình' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { isActive },
            { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        res.json({
            message: isActive ? 'Kích hoạt tài khoản thành công' : 'Vô hiệu hóa tài khoản thành công',
            user
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Lấy danh sách tất cả hotels
router.get('/hotels', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const query = {};

        // Tìm kiếm theo tên khách sạn
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const hotels = await Hotel.find(query)
            .populate('owner', 'username email') // Lấy thông tin chủ khách sạn
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Hotel.countDocuments(query);

        res.json({
            hotels,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Get hotels error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Xóa hotel
router.delete('/hotels/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const hotel = await Hotel.findByIdAndDelete(id);

        if (!hotel) {
            return res.status(404).json({ message: 'Khách sạn không tồn tại' });
        }

        res.json({ message: 'Xóa khách sạn thành công' });
    } catch (error) {
        console.error('Delete hotel error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
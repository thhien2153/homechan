import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';

//Lấy thống kê tổng quan:
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments(); //// Đếm tổng số user
        const totalHotels = await Hotel.countDocuments(); // Đếm tổng số hotel
        const totalBookings = await Booking.countDocuments();// Đếm tổng số booking
        // Tính tổng doanh thu từ các booking đã confirmed và paid
        const revenueResult = await Booking.aggregate([
            { $match: { status: 'confirmed', isPaid: true } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({
            success: true,
            data: { totalUsers, totalHotels, totalBookings, totalRevenue }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê dashboard',
            error: error.message
        });
    }
};

//Lấy danh sách user với phân trang
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(query)
            .select('-password')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách người dùng',
            error: error.message
        });
    }
};

export const createUser = async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        const newUser = new User({
            name,
            email,
            password,
            role,
            isActive: true
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'Tạo người dùng thành công',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isActive: newUser.isActive
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo người dùng',
            error: error.message
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { name, email, role, isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật người dùng thành công',
            user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật người dùng',
            error: error.message
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.json({
            success: true,
            message: 'Xóa người dùng thành công'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa người dùng',
            error: error.message
        });
    }
};

export const getAllHotels = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { location: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const hotels = await Hotel.find(query)
            .populate('owner', 'username email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Hotel.countDocuments(query);

        res.json({
            success: true,
            hotels,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Error getting hotels:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách khách sạn',
            error: error.message
        });
    }
};

export const deleteHotel = async (req, res) => {
    try {
        const { id } = req.params;

        const hotel = await Hotel.findByIdAndDelete(id);
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khách sạn'
            });
        }

        res.json({
            success: true,
            message: 'Xóa khách sạn thành công'
        });
    } catch (error) {
        console.error('Error deleting hotel:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa khách sạn',
            error: error.message
        });
    }
};

// Toggle trạng thái hotel
export const toggleHotelStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khách sạn'
            });
        }

        // Toggle trạng thái
        hotel.isActive = !hotel.isActive;
        await hotel.save();

        res.json({
            success: true,
            message: `${hotel.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} khách sạn thành công`,
            hotel: {
                _id: hotel._id,
                name: hotel.name,
                isActive: hotel.isActive
            }
        });
    } catch (error) {
        console.error('Error toggling hotel status:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái khách sạn',
            error: error.message
        });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        if (status !== 'all') {
            query.status = status;
        }

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            const users = await User.find({
                $or: [
                    { username: searchRegex },
                    { email: searchRegex }
                ]
            }).select('_id');

            const hotels = await Hotel.find({
                $or: [
                    { name: searchRegex },
                    { location: searchRegex }
                ]
            }).select('_id');

            const userIds = users.map(u => u._id);
            const hotelIds = hotels.map(h => h._id);

            query.$or = [
                { user: { $in: userIds } },
                { hotel: { $in: hotelIds } }
            ];
        }

        const bookings = await Booking.find(query)
            .populate('user', 'username email phone')
            .populate('hotel', 'name location images')
            .populate('room', 'roomType pricePerNight')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Booking.countDocuments(query);

        res.json({
            success: true,
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Error getting bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách booking',
            error: error.message
        });
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, isPaid } = req.body;

        const validStatuses = ['pending', 'confirmed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const updateData = { status };
        if (typeof isPaid === 'boolean') {
            updateData.isPaid = isPaid;
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('user', 'username email')
            .populate('hotel', 'name')
            .populate('room', 'roomNumber type');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy booking'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái booking thành công',
            booking
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái booking',
            error: error.message
        });
    }
};

export const getHotelBookingStats = async (req, res) => {
    try {
        const hotelStats = await Booking.aggregate([
            {
                $match: {
                    status: { $in: ['confirmed', 'pending'] }
                }
            },
            {
                $group: {
                    _id: '$hotel',
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' }
                }
            },
            {
                $lookup: {
                    from: 'hotels',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'hotelInfo'
                }
            },
            {
                $unwind: '$hotelInfo'
            },
            {
                $project: {
                    hotelName: '$hotelInfo.name',
                    hotelAddress: '$hotelInfo.address',
                    totalBookings: 1,
                    totalRevenue: 1
                }
            },
            {
                $sort: { totalBookings: -1 }
            },
            {
                $limit: 10
            }
        ]);

        res.json({
            success: true,
            data: hotelStats
        });
    } catch (error) {
        console.error('Error getting hotel booking stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê booking theo hotel',
            error: error.message
        });
    }
};
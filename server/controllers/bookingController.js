import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import nodemailer from "nodemailer";

// API to check room availability 
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;

        if (!room || !checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Kiểm tra có booking nào trung với khoảng thời gian này không
        const conflictingBookings = await Booking.find({
            room: room,
            $or: [
                {
                    // Booking bắt đầu trong khoảng thời gian này
                    checkInDate: {
                        $gte: new Date(checkInDate),
                        $lt: new Date(checkOutDate)
                    }
                },
                {
                    // Booking kết thúc trong khoảng thời gian này
                    checkOutDate: {
                        $gt: new Date(checkInDate),
                        $lte: new Date(checkOutDate)
                    }
                },
                {
                    // Booking bao phủ toàn bộ khoảng thời gian này
                    checkInDate: { $lte: new Date(checkInDate) },
                    checkOutDate: { $gte: new Date(checkOutDate) }
                }
            ],
            status: { $nin: ['cancelled'] } // Không tính booking đã hủy
        });

        const isAvailable = conflictingBookings.length === 0;

        return res.json({
            success: true,
            isAvailable: isAvailable,
            message: isAvailable ? "Room is available" : "Room is not available"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to check availability"
        });
    }
}

// API to create booking 
export const createBooking = async (req, res) => {
    try {
        const {
            room,
            checkInDate,
            checkOutDate,
            guests = 1,
            customerName,
            customerPhone,
            customerEmail,
            note,
            paymentMethod
        } = req.body;

        // Kiểm tra user đăng nhập
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Missing user token"
            });
        }

        const userId = req.user._id;

        //  Kiểm tra room có tồn tại không
        const roomExists = await Room.findById(room);
        if (!roomExists) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        //  Kiểm tra ngày nhập hợp lệ
        if (!checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: "Missing check-in or check-out date"
            });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        // Calculate nights using UTC date difference to avoid timezone off-by-one
        const msPerDay = 1000 * 60 * 60 * 24;
        const utcCheckIn = Date.UTC(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
        const utcCheckOut = Date.UTC(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
        const nights = Math.floor((utcCheckOut - utcCheckIn) / msPerDay);

        if (nights <= 0) {
            return res.status(400).json({
                success: false,
                message: "Check-out date must be after check-in date"
            });
        }

        //  Tính tổng tiền
        const totalPrice = roomExists.pricePerNight * nights;

        //  Tạo booking mới
        const newBooking = new Booking({
            user: userId,
            room: roomExists._id,
            hotel: roomExists.hotel,
            checkInDate,
            checkOutDate,
            guests,
            customerName,
            customerPhone,
            customerEmail,
            note,
            totalPrice,
            status: 'pending',
            isPaid: false,
            paymentMethod: paymentMethod || 'Pay At Hotel'
        });

        await newBooking.save();

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: newBooking
        });

    } catch (error) {
        console.error(" Error creating booking:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create booking"
        });
    }
};

// API to get hotel bookings - SỬA ĐỂ HIỂN THỊ ĐÚNG DOANH THU
export const getHotelBookings = async (req, res) => {
    try {
        const ownerId = req.user._id;

        // 1. Tìm hotel của owner này
        const hotel = await Hotel.findOne({ owner: ownerId });

        if (!hotel) {
            return res.json({
                success: true,
                dashboardData: {
                    bookings: [],
                    totalBookings: 0,
                    totalRevenue: 0
                }
            });
        }

        // 2. Tìm tất cả rooms thuộc khách sạn của owner này
        const hotelIds = [hotel._id];
        const rooms = await Room.find({ hotel: { $in: hotelIds } });
        const roomIds = rooms.map(room => room._id);

        if (roomIds.length === 0) {
            return res.json({
                success: true,
                dashboardData: {
                    bookings: [],
                    totalBookings: 0,
                    totalRevenue: 0
                }
            });
        }

        // 3. Tìm tất cả bookings có room thuộc hotel của owner
        const bookings = await Booking.find({
            room: { $in: roomIds }
        })
            .populate('user', 'username phone email')
            .populate('room', 'roomType images')
            .populate('hotel', 'name address')
            .sort({ createdAt: -1 });

        // 4. Tính tổng doanh thu và số lượt đặt
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, booking) => {
            // Đảm bảo totalPrice là số và không null/undefined
            const price = Number(booking.totalPrice) || 0;
            return sum + price;
        }, 0);

        // 5. Format data để hiển thị (chỉ lấy 20 booking gần nhất cho table)
        const recentBookings = bookings.slice(0, 20);
        const formattedBookings = recentBookings.map(booking => ({
            _id: booking._id,
            user: {
                username: booking.customerName || booking.user?.username || 'N/A',
                phone: booking.customerPhone || booking.user?.phone || 'N/A'
            },
            room: {
                roomType: booking.room?.roomType || 'N/A',
                images: booking.room?.images || []
            },
            hotel: {
                name: booking.hotel?.name || hotel.name,
                address: booking.hotel?.address || 'N/A'
            },
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            totalPrice: Number(booking.totalPrice) || 0,
            guests: booking.guests || 1,
            status: booking.status || 'pending',
            isPaid: booking.isPaid || false,
            createdAt: booking.createdAt
        }));

        return res.json({
            success: true,
            dashboardData: {
                bookings: formattedBookings,
                totalBookings: totalBookings,
                totalRevenue: totalRevenue
            }
        });

    } catch (error) {
        console.error('Get hotel bookings error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to get hotel bookings",
            dashboardData: {
                bookings: [],
                totalBookings: 0,
                totalRevenue: 0
            }
        });
    }
}

// API to get all bookings for a user
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id.toString();
        const bookings = await Booking.find({ user: user });

        if (bookings.length === 0) {
            return res.status(200).json({ success: true, bookings: [] });
        }

        const populatedBookings = await Promise.all(
            bookings.map(async (booking) => {
                const userInfo = await User.findById(booking.user).select('username phone');
                const roomInfo = await Room.findById(booking.room).select('roomType images roomImages');
                const hotelInfo = await Hotel.findById(booking.hotel).select('name address');

                return {
                    _id: booking._id.toString(),
                    user: {
                        username: booking.customerName || (userInfo ? userInfo.username : "N/A"),
                        phone: booking.customerPhone || (userInfo ? userInfo.phone : "N/A")
                    },
                    room: {
                        _id: roomInfo ? roomInfo._id.toString() : null,
                        roomType: roomInfo ? roomInfo.roomType : "N/A",
                        images: roomInfo
                            ? (roomInfo.images?.length ? roomInfo.images : roomInfo.roomImages)
                            : []
                    },
                    hotel: {
                        name: hotelInfo ? hotelInfo.name : "N/A",
                        address: hotelInfo ? hotelInfo.address : "N/A"
                    },
                    checkInDate: booking.checkInDate,
                    checkOutDate: booking.checkOutDate,
                    totalPrice: booking.totalPrice,
                    guests: booking.guests,
                    status: booking.status,
                    isPaid: booking.isPaid,
                    hasReviewed: booking.hasReviewed,
                    createdAt: booking.createdAt,
                    updatedAt: booking.updatedAt
                };
            })
        );


        populatedBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return res.status(200).json({ success: true, bookings: populatedBookings });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch bookings" });
    }
}

//  API để lấy tất cả bookings của owner (cho trang manage bookings)
export const getOwnerBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
        const skip = (page - 1) * limit;
        const ownerId = req.user._id;

        // 1. Tìm tất cả khách sạn của owner này từ MongoDB
        const hotels = await Hotel.find({ owner: ownerId }).select('_id');
        const hotelIds = hotels.map(h => h._id);

        if (hotelIds.length === 0) {
            return res.json({
                success: true,
                bookings: [],
                totalPages: 0,
                currentPage: parseInt(page),
                total: 0
            });
        }

        // 2. Tìm tất cả rooms thuộc các hotels của owner
        const rooms = await Room.find({ hotel: { $in: hotelIds } }).select('_id');
        const roomIds = rooms.map(r => r._id);

        if (roomIds.length === 0) {
            return res.json({
                success: true,
                bookings: [],
                totalPages: 0,
                currentPage: parseInt(page),
                total: 0
            });
        }

        // 3. Tạo query để tìm bookings
        let query = { room: { $in: roomIds } };

        // Filter theo status
        if (status !== 'all') {
            query.status = status;
        }

        // Search theo tên user
        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            const users = await User.find({
                $or: [
                    { username: searchRegex },
                    { email: searchRegex }
                ]
            }).select('_id');

            const userIds = users.map(u => u._id);

            // Thêm điều kiện search theo customerName hoặc user
            query.$or = [
                { user: { $in: userIds } },
                { customerName: searchRegex }
            ];
        }

        // 4. Lấy bookings từ MongoDB với pagination
        const bookings = await Booking.find(query)
            .populate('user', 'username email phoneNumber')
            .populate('hotel', 'name address city')
            .populate('room', 'roomType pricePerNight')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // 5. Đếm tổng số bookings
        const total = await Booking.countDocuments(query);

        res.json({
            success: true,
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Error getting owner bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách booking'
        });
    }
};

// : API để cập nhật trạng thái booking cho owner
export const updateOwnerBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, isPaid } = req.body;
        const ownerId = req.user._id;

        const booking = await Booking.findById(id)
            .populate("user", "email username")
            .populate("hotel", "name")
            .populate("room", "roomType");

        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy booking" });
        }

        const hotel = await Hotel.findById(booking.hotel);
        if (!hotel || hotel.owner.toString() !== ownerId.toString()) {
            return res.status(403).json({ success: false, message: "Không có quyền cập nhật booking này" });
        }

        booking.status = status;
        booking.isPaid = isPaid;
        await booking.save();

        if (status === "confirmed" && booking.user?.email) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            const reviewLink = `${process.env.FRONTEND_URL}/my-bookings`;
            const mailOptions = {
                from: `"${hotel.name}" <${process.env.SMTP_USER}>`,
                to: booking.user.email,
                subject: `Cảm ơn bạn đã đặt phòng tại ${hotel.name}`,
                html: `
          <h2>Xin chào ${booking.user.username || "Quý khách"},</h2>
          <p>Đơn đặt phòng của bạn tại <b>${hotel.name}</b> đã được xác nhận.</p>
          <p><b>Phòng:</b> ${booking.room.roomType}</p>
          <p><b>Ngày nhận phòng:</b> ${new Date(booking.checkInDate).toLocaleDateString("vi-VN")}</p>
          <p><b>Ngày trả phòng:</b> ${new Date(booking.checkOutDate).toLocaleDateString("vi-VN")}</p>
          <p>Tổng tiền: <b>${booking.totalPrice.toLocaleString("vi-VN")} VND</b></p>
          <br/>
          <p>Cảm ơn bạn đã tin tưởng và lựa chọn chúng tôi!</p>
          <p>Hãy chia sẻ cảm nhận của bạn sau chuyến đi bằng cách nhấn vào nút bên dưới 👇</p>
          <a href="${reviewLink}" 
             style="background-color:#ff5a5f;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
             Đánh giá ngay
          </a>
          <br/><br/>
          <p>Trân trọng,<br/>Đội ngũ ${hotel.name}</p>
        `,
            };

            await transporter.sendMail(mailOptions);
        }

        res.json({ success: true, message: "Cập nhật trạng thái booking thành công" });
    } catch (error) {
        console.error("Error updating owner booking status:", error);
        res.status(500).json({ success: false, message: "Lỗi khi cập nhật trạng thái booking" });
    }
};

export const getAdminBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
        const skip = (page - 1) * limit;


        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { customerName: { $regex: search, $options: 'i' } },
                    { customerEmail: { $regex: search, $options: 'i' } }
                ]
            };
        }


        if (status !== 'all') {
            searchQuery.status = status;
        }


        const bookings = await Booking.find(searchQuery)
            .populate('user', 'username email phoneNumber')
            .populate('hotel', 'name address city')
            .populate('room', 'roomType')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));


        const total = await Booking.countDocuments(searchQuery);
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            bookings,
            currentPage: parseInt(page),
            totalPages,
            total
        });

    } catch (error) {
        console.error('Error in getAdminBookings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách booking'
        });
    }
};


export const updateAdminBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, isPaid } = req.body;

        const booking = await Booking.findByIdAndUpdate(
            id,
            { status, isPaid },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy booking'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái booking thành công',
            booking
        });

    } catch (error) {
        console.error('Error in updateAdminBookingStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật booking'
        });
    }
};

// API để lấy thống kê doanh thu theo ngày và tháng cho owner
export const getRevenueStats = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { period = 'month' } = req.query; // 'day' hoặc 'month'

        // 1. Tìm tất cả hotels của owner này
        const hotels = await Hotel.find({ owner: ownerId });
        if (!hotels || hotels.length === 0) {
            return res.json({
                success: true,
                stats: []
            });
        }

        // 2. Tìm tất cả rooms thuộc tất cả hotels của owner
        const hotelIds = hotels.map(hotel => hotel._id);
        const rooms = await Room.find({ hotel: { $in: hotelIds } });
        const roomIds = rooms.map(room => room._id);

        if (roomIds.length === 0) {
            return res.json({
                success: true,
                stats: []
            });
        }

        // 3. Lấy tất cả bookings của owner
        const bookings = await Booking.find({
            room: { $in: roomIds }
        }).select('createdAt totalPrice');

        // 4. Tạo thống kê theo period
        const stats = {};
        const now = new Date();

        bookings.forEach(booking => {
            const date = new Date(booking.createdAt);
            let key;

            if (period === 'day') {
                // Thống kê theo ngày (7 ngày gần nhất)
                const diffTime = now - date;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 6) {
                    key = date.toISOString().split('T')[0]; // YYYY-MM-DD
                }
            } else {
                // Thống kê theo tháng (12 tháng gần nhất)
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

                // Chỉ lấy 12 tháng gần nhất
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;
                const monthsDiff = (currentYear - year) * 12 + (currentMonth - month);

                if (monthsDiff <= 11) {
                    key = monthKey;
                }
            }

            if (key) {
                stats[key] = (stats[key] || 0) + (Number(booking.totalPrice) || 0);
            }
        });

        // 5. Format data cho chart
        let formattedStats = [];

        if (period === 'month') {
            // Tạo danh sách 12 tháng gần nhất
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const key = `${year}-${month.toString().padStart(2, '0')}`;
                formattedStats.push({
                    date: key,
                    revenue: stats[key] || 0,
                    label: `${month}/${year}`
                });
            }
        } else {
            // Thống kê theo ngày (7 ngày gần nhất)
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const key = date.toISOString().split('T')[0];
                formattedStats.push({
                    date: key,
                    revenue: stats[key] || 0,
                    label: date.toLocaleDateString('vi-VN')
                });
            }
        }

        return res.json({
            success: true,
            stats: formattedStats,
            period
        });

    } catch (error) {
        console.error('Error getting revenue stats:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to get revenue statistics"
        });
    }
};

export const getHotRooms = async (req, res) => {
    try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        // Count bookings grouped by room
        const recentCounts = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: threeDaysAgo },
                    status: { $nin: ["cancelled"] }
                }
            },
            {
                $group: {
                    _id: "$room",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 12
            }
        ]);

        const ids = recentCounts.map(r => r._id);

        let rooms = await Room.find({ _id: { $in: ids } }).populate("hotel").lean();

        rooms = rooms.map(r => {
            const found = recentCounts.find(x => String(x._id) === String(r._id));
            r.recentBookingsCount = found?.count || 0;
            return r;
        });

        return res.json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getRecentBookingsByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        if (!hotelId) return res.json({ recentBookings: 0 });

        const since = new Date();
        since.setHours(since.getHours() - 168);

        // Đếm số booking trong 72h
        const count = await Booking.countDocuments({
            hotel: hotelId,
            createdAt: { $gte: since }
        });

        return res.json({ recentBookings: count });
    } catch (err) {
        console.error("Lỗi API recent booking:", err);
        return res.status(500).json({ recentBookings: 0 });
    }
};


// API để lấy thống kê booking theo ngày và tháng cho owner
export const getBookingStats = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { period = 'month' } = req.query; // 'day' hoặc 'month'

        // 1. Tìm tất cả hotels của owner này
        const hotels = await Hotel.find({ owner: ownerId });
        if (!hotels || hotels.length === 0) {
            return res.json({
                success: true,
                stats: []
            });
        }

        // 2. Tìm tất cả rooms thuộc tất cả hotels của owner
        const hotelIds = hotels.map(hotel => hotel._id);
        const rooms = await Room.find({ hotel: { $in: hotelIds } });
        const roomIds = rooms.map(room => room._id);

        if (roomIds.length === 0) {
            return res.json({
                success: true,
                stats: []
            });
        }

        // 3. Lấy tất cả bookings của owner
        const bookings = await Booking.find({
            room: { $in: roomIds }
        }).select('createdAt');

        // 4. Tạo thống kê theo period
        const stats = {};
        const now = new Date();

        bookings.forEach(booking => {
            const date = new Date(booking.createdAt);
            let key;

            if (period === 'day') {
                // Thống kê theo ngày (7 ngày gần nhất)
                const diffTime = now - date;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 6) {
                    key = date.toISOString().split('T')[0]; // YYYY-MM-DD
                }
            } else {
                // Thống kê theo tháng (12 tháng gần nhất)
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

                // Chỉ lấy 12 tháng gần nhất
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;
                const monthsDiff = (currentYear - year) * 12 + (currentMonth - month);

                if (monthsDiff <= 11) {
                    key = monthKey;
                }
            }

            if (key) {
                stats[key] = (stats[key] || 0) + 1;
            }
        });

        // 5. Format data cho chart
        let formattedStats = [];

        if (period === 'month') {
            // Tạo danh sách 12 tháng gần nhất
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const key = `${year}-${month.toString().padStart(2, '0')}`;
                formattedStats.push({
                    date: key,
                    bookings: stats[key] || 0,
                    label: `${month}/${year}`
                });
            }
        } else {
            // Thống kê theo ngày (7 ngày gần nhất)
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const key = date.toISOString().split('T')[0];
                formattedStats.push({
                    date: key,
                    bookings: stats[key] || 0,
                    label: date.toLocaleDateString('vi-VN')
                });
            }
        }

        return res.json({
            success: true,
            stats: formattedStats,
            period
        });

    } catch (error) {
        console.error('Error getting booking stats:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to get booking statistics"
        });
    }
};
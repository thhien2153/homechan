import express from "express";
import {
    checkAvailabilityAPI,
    createBooking,
    getHotelBookings,
    getBookingStats,
    getRevenueStats,
    getUserBookings,
    getOwnerBookings,
    updateOwnerBookingStatus,
    getAdminBookings,
    updateAdminBookingStatus,
    getHotRooms,
    getRecentBookingsByHotel
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import Booking from "../models/Booking.js";

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityAPI);
bookingRouter.post('/book', protect, createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/stats', protect, getBookingStats);
bookingRouter.get('/revenue-stats', protect, getRevenueStats);
bookingRouter.get('/hotel', protect, getHotelBookings);
bookingRouter.get('/owner', protect, getOwnerBookings);
bookingRouter.patch('/owner/:id/status', protect, updateOwnerBookingStatus);
bookingRouter.get('/admin', protect, getAdminBookings);
bookingRouter.patch('/admin/:id/status', protect, updateAdminBookingStatus);
bookingRouter.get("/hot", getHotRooms);
bookingRouter.get("/hotel/:hotelId/recent", getRecentBookingsByHotel);


bookingRouter.get("/hotel/:hotelId/recent", getRecentBookingsByHotel);

//route để lấy danh sách ngày đã đặt cho 1 phòng
bookingRouter.get('/hotel/:hotelId', protect, async (req, res) => {
    try {
        const { hotelId } = req.params;
        const bookings = await Booking.find({ hotel: hotelId })
            .populate('user', 'username phone email')
            .populate('room', 'roomType images')
            .populate('hotel', 'name address');

        res.json({ success: true, bookings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 📌 Lấy danh sách ngày đã đặt theo roomId
bookingRouter.get('/room/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;

        const bookings = await Booking.find({ room: roomId });

        return res.json({
            success: true,
            bookings
        });

    } catch (err) {
        console.error("Error get room booked dates:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


export default bookingRouter;
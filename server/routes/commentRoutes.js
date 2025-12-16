import express from 'express';
import {
    addComment,
    getCommentsByRoom,
    getCommentsByHotel,
    getHotelRating,
    getCommentsByBooking,
    replyToComment
} from '../controllers/commentController.js';

import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// =======================
// 💡 Quan trọng: đặt route HOTEL trước
// =======================

// Lấy comment theo hotel
router.get('/hotel/:hotelId', getCommentsByHotel);

// Lấy rating của khách sạn
router.get('/hotel-rating/:hotelId', getHotelRating);

// Lấy comment theo booking
router.get('/booking/:bookingId', getCommentsByBooking);

// =======================
// 📌 Route comment theo phòng
// =======================

// Lấy bình luận theo phòng - công khai
router.get('/:roomId', getCommentsByRoom);

// Gửi bình luận cho phòng - yêu cầu đăng nhập
router.post('/:roomId', protect, upload.array('media', 15), addComment);

// Trả lời comment - yêu cầu đăng nhập
router.post('/:commentId/reply', protect, replyToComment);

export default router;

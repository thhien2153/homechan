import Comment from '../models/Comment.js';
import { v2 as cloudinary } from 'cloudinary';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

export const addComment = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ success: false, message: 'Không có dữ liệu gửi lên' });
    }

    const { text, rating } = req.body;
    // isAnonymous có thể là "true" hoặc "false" (từ FormData)
    const isAnonymous = req.body.isAnonymous === 'true';
    const roomId = req.params.roomId;

    if (!text || !rating || !roomId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu nội dung, điểm đánh giá hoặc mã phòng',
      });
    }

    // Xử lý upload hình ảnh / video
    const mediaUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Nếu dùng Cloudinary:
        try {
          const upload = await cloudinary.uploader.upload(file.path, {
            folder: 'comments',
            resource_type: 'auto',
          });
          mediaUrls.push(upload.secure_url);
        } catch (err) {
          // fallback: nếu upload lên cloud failed, bạn có thể push local path
          console.error('Upload media error:', err);
        }
        // Nếu bạn dùng lưu local: mediaUrls.push(`/uploads/${file.filename}`);
      }
    }

    // Tạo comment mới
    const comment = await Comment.create({
      room: roomId,
      user: req.user._id,
      booking: req.body.bookingId,
      text,
      rating: Number(rating),
      media: mediaUrls,
      isAnonymous: !!isAnonymous,
    });

    await comment.populate('user', 'username image');

    await Booking.findByIdAndUpdate(
      req.body.bookingId,
      { $set: { hasReviewed: true } }
    );
    res.status(201).json({ success: true, comment });
  } catch (err) {
    console.error('Lỗi thêm bình luận:', err);
    console.log(`Booking của user ${req.user._id} - room ${roomId} đã cập nhật hasReviewed = true`);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCommentsByRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const comments = await Comment.find({ room: roomId })
      .populate('user', 'username image')
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy bình luận' });
  }
};

export const getCommentsByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    if (!hotelId) return res.status(400).json({ success: false, message: 'Missing hotelId' });

    // Lấy tất cả roomIds thuộc hotel
    const rooms = await Room.find({ hotel: hotelId }).select('_id roomNumber roomType');
    const roomIds = rooms.map(r => r._id);

    const comments = await Comment.find({ room: { $in: roomIds } })
      .populate('user', 'username image')
      .populate('room', 'roomNumber roomType')
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (err) {
    console.error('Lỗi getCommentsByHotel:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// LẤY RATING CỦA MỘT KHÁCH SẠN
export const getHotelRating = async (req, res) => {
  try {
    const { hotelId } = req.params;

    // Lấy các phòng thuộc khách sạn
    const rooms = await Room.find({ hotel: hotelId }).select('_id');
    const roomIds = rooms.map(r => r._id);

    // Lấy comment của tất cả phòng trong khách sạn
    const comments = await Comment.find({ room: { $in: roomIds } });

    if (comments.length === 0) {
      return res.json({
        success: true,
        avgRating: 0,
        totalReviews: 0
      });
    }

    const totalReviews = comments.length;
    const totalRating = comments.reduce((sum, c) => sum + c.rating, 0);
    const avgRating = Number((totalRating / totalReviews).toFixed(1));

    return res.json({
      success: true,
      avgRating,
      totalReviews
    });
  }
  catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// LẤY COMMENT THEO BOOKING
export const getCommentsByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) return res.status(400).json({ success: false, message: 'Missing bookingId' });

    // Lấy comment của booking đó
    const comments = await Comment.find({ booking: bookingId })
      .populate('user', 'username image')
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (err) {
    console.error('Lỗi getCommentsByBooking:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// TRẢ LỜI COMMENT
export const replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { replyText } = req.body;

    if (!commentId || !replyText) {
      return res.status(400).json({ success: false, message: 'Missing commentId or replyText' });
    }

    // Tìm comment và cập nhật reply
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        reply: {
          text: replyText,
          createdAt: new Date()
        }
      },
      { new: true }
    ).populate('user', 'username image');

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    res.json({ success: true, comment });
  } catch (err) {
    console.error('Lỗi replyToComment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

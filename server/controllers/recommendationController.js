// server/controllers/recommendationController.js
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js";
import { getSimilarRooms } from "../utils/recommendation.js"; // now provided

// GET /api/rooms/recommend-rooms?roomId=...&top=6
export const getRoomRecommendations = async (req, res) => {
    try {
        const { roomId, top = 6 } = req.query;
        if (!roomId || roomId === "undefined" || roomId === "null") {
            return res.json({ success: false, message: "Invalid roomId" });
        }

        // lấy tất cả phòng đang available (populate hotel)
        const rooms = await Room.find({ isAvailable: true }).populate("hotel").lean();

        // getSimilarRooms trả về [{room, score}]
        const similar = await getSimilarRooms(rooms, roomId, Number(top) * 2);

        // chia bucket: cùng khách sạn vs khác khách sạn
        const base = rooms.find(r => String(r._id) === String(roomId));
        const sameHotelRooms = [];
        const otherHotelRooms = [];

        similar.forEach(entry => {
            const r = entry.room;
            if (!r || String(r._id) === String(roomId)) return;
            if (base && r.hotel && base.hotel && String(r.hotel._id) === String(base.hotel._id)) {
                sameHotelRooms.push(entry);
            } else {
                otherHotelRooms.push(entry);
            }
        });

        return res.json({
            success: true,
            sameHotelRooms: sameHotelRooms.slice(0, Number(top)),
            otherHotelRooms: otherHotelRooms.slice(0, Number(top))
        });
    } catch (err) {
        console.error("getRoomRecommendations error", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /api/rooms/recommend-hotels?hotelId=...&top=6
export const getHotelRecommendations = async (req, res) => {
    try {
        const { hotelId, top = 6 } = req.query;
        if (!hotelId) return res.json({ success: false, message: "hotelId required" });

        // simple: recommend other hotels in same city, exclude itself
        const baseHotel = await Hotel.findById(hotelId).lean();
        if (!baseHotel) return res.json({ success: false, message: "Hotel not found" });

        const hotels = await Hotel.find({
            _id: { $ne: baseHotel._id },
            city: baseHotel.city
        }).limit(Number(top)).lean();

        return res.json({ success: true, recommendations: hotels });
    } catch (err) {
        console.error("getHotelRecommendations error", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getRecommendationsList = async (req, res) => {
    try {
        // lấy trong 72h gần nhất
        const since = new Date();
        since.setHours(since.getHours() - 168);

        const bookings = await Booking.find({
            createdAt: { $gte: since }
        });

        // đếm số lượt đặt theo id phòng
        const countMap = {}; // { roomId: count }

        bookings.forEach(b => {
            const roomId = String(b.room); // booking.room chứ không phải booking.roomId

            if (!countMap[roomId]) countMap[roomId] = 0;
            countMap[roomId]++;
        });

        // phòng hot = >= 3 lượt đặt
        const hotRoomIds = Object.keys(countMap).filter(id => countMap[id] >= 3);

        // lấy thông tin phòng
        const rooms = await Room.find({ _id: { $in: hotRoomIds } })
            .populate("hotel");

        return res.json({
            success: true,
            recommendations: rooms.map(r => ({
                ...r.toObject(),
                recentBookingsCount: countMap[String(r._id)] || 0,
                isHot: (countMap[String(r._id)] || 0) >= 3
            }))
        });

    } catch (err) {
        console.error("Recommendation error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// GET /api/rooms/optimal-price?roomType=...&city=...
export const getOptimalPrice = async (req, res) => {
    try {
        const { roomType, city } = req.query;
        if (!roomType || !city) {
            return res.json({ success: false, message: "roomType and city required" });
        }

        // Gọi script Python để dự đoán giá
        const pythonProcess = spawn('python', ['predict.py', roomType, city]);

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({ success: false, message: `Python error: ${error}` });
            }

            const predictedPrice = parseFloat(result.trim());
            if (isNaN(predictedPrice)) {
                return res.status(500).json({ success: false, message: "Invalid prediction result" });
            }

            return res.json({
                success: true,
                optimalPrice: predictedPrice,
                message: `Giá tối ưu cho phòng ${roomType} tại ${city} là ${predictedPrice} VND`
            });
        });
    } catch (err) {
        console.error("getOptimalPrice error", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


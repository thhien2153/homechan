import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { registerHotel, getAllHotels, getHotelById, updateHotel } from "../controllers/hotelController.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";

const hotelRouter = express.Router();

// --- Thay thế toàn bộ handler hiện tại cho /search bằng code này ---
hotelRouter.get("/search", async (req, res) => {
    try {
        let {
            keyword = "",
            checkIn,
            checkOut,
            rooms = 1,
            adults = 1,
            children = 0,
            page = 1,
            limit = 20
        } = req.query;

        rooms = Number(rooms);
        adults = Number(adults);
        children = Number(children);
        page = Number(page);
        limit = Number(limit);

        // chuẩn hoá null/""
        if (checkIn === "null" || checkIn === "") checkIn = null;
        if (checkOut === "null" || checkOut === "") checkOut = null;

        // nếu không có ngày thì fallback trả danh sách hotels (như hiện tại)
        if (!checkIn || !checkOut) {
            const hotels = await Hotel.find({
                $or: [
                    { name: { $regex: keyword, $options: "i" } },
                    { city: { $regex: keyword, $options: "i" } },
                ],
            })
                .skip((page - 1) * limit)
                .limit(limit);

            return res.json(hotels);
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Aggregation pipeline:
        const pipeline = [
            // 1) match hotels by name or city
            {
                $match: {
                    $or: [
                        { name: { $regex: keyword, $options: "i" } },
                        { city: { $regex: keyword, $options: "i" } },
                    ],
                },
            },

            // 2) lookup rooms belonging to hotel
            {
                $lookup: {
                    from: "rooms",
                    localField: "_id",
                    foreignField: "hotel",
                    as: "rooms",
                },
            },

            // 3) unwind rooms to evaluate each room individually
            { $unwind: { path: "$rooms", preserveNullAndEmptyArrays: false } },

            // 4) filter rooms by capacity (maxAdults >= adults && maxChildren >= children)
            {
                $match: {
                    "rooms.maxAdults": { $gte: adults },
                    "rooms.maxChildren": { $gte: children },
                },
            },

            // 5) lookup bookings for that room which overlap the requested date range
            {
                $lookup: {
                    from: "bookings",
                    let: { roomId: "$rooms._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$room", "$$roomId"] },
                                        // overlap condition: booking.checkIn < requestedCheckOut AND booking.checkOut > requestedCheckIn
                                        { $lt: ["$checkIn", checkOutDate] },
                                        { $gt: ["$checkOut", checkInDate] },
                                    ],
                                },
                            },
                        },
                        { $project: { _id: 1 } },
                    ],
                    as: "conflictingBookings",
                },
            },

            // 6) keep only rooms that have NO conflicting bookings (i.e., available)
            {
                $match: {
                    "conflictingBookings.0": { $exists: false },
                },
            },

            // 7) group back by hotel, collect available rooms minimal info
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    city: { $first: "$city" },
                    address: { $first: "$address" },
                    images: { $first: "$images" },
                    owner: { $first: "$owner" },
                    availableRooms: {
                        $push: {
                            roomId: "$rooms._id",
                            roomNumber: "$rooms.roomNumber",
                            roomType: "$rooms.roomType",
                            pricePerNight: "$rooms.pricePerNight",
                            maxAdults: "$rooms.maxAdults",
                            maxChildren: "$rooms.maxChildren",
                            amenities: "$rooms.amenities",
                            // thêm trường khác tùy schema của bạn
                        },
                    },
                    availableCount: { $sum: 1 },
                },
            },

            // 8) only return hotels that have enough rooms to satisfy the requested 'rooms' count
            {
                $match: {
                    availableCount: { $gte: rooms },
                },
            },

            // 9) Optionally sort (ví dụ theo availableCount desc then name)
            {
                $sort: { availableCount: -1, name: 1 },
            },

            // 10) Pagination
            { $skip: (page - 1) * limit },
            { $limit: limit },

            // 11) Project fields you want to return
            {
                $project: {
                    _id: 1,
                    name: 1,
                    city: 1,
                    address: 1,
                    images: 1,
                    availableCount: 1,
                    availableRooms: 1,
                },
            },
        ];

        const results = await Hotel.aggregate(pipeline).allowDiskUse(true);

        res.json(results);
    } catch (err) {
        console.error("Lỗi search (agg):", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
});

// Các route cũ
hotelRouter.post("/", protect, registerHotel);
hotelRouter.get("/", getAllHotels);
hotelRouter.get("/:id", getHotelById);
hotelRouter.put("/:id", protect, upload.array("images", 10), updateHotel);

export default hotelRouter;

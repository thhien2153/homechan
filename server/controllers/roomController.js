import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const normalizeFiles = (files) => {
    const map = {};
    if (!files) return map;

    // Nếu là object (upload.fields)
    if (!Array.isArray(files) && typeof files === "object") {
        for (const key of Object.keys(files)) {
            map[key] = Array.isArray(files[key]) ? files[key] : [files[key]];
        }
        return map;
    }

    // Nếu là array (upload.any() / upload.array())
    if (Array.isArray(files)) {
        for (const f of files) {
            const key = f.fieldname || "unknown";
            if (!map[key]) map[key] = [];
            map[key].push(f);
        }
        return map;
    }

    return map;
};

// API: Tạo khách sạn + nhiều phòng cùng lúc (hoặc 1 phòng)
export const createRoom = async (req, res) => {
    try {
        const {
            hotelName,
            hotelDescription,
            hotelAddress,
            contact,
            city,
            rooms,
            hotelId, // for adding room to existing hotel
            roomNumber,
            roomType,
            pricePerNight,
            roomArea,
            maxAdults,
            maxChildren,
            discount,
            bedsDetails,
            bathroomsDetails,
            amenities
        } = req.body;

        // Check if adding room to existing hotel
        if (hotelId) {
            // Adding single room to existing hotel
            const existingHotel = await Hotel.findById(hotelId);
            if (!existingHotel) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy khách sạn"
                });
            }

            // Parse single room data
            let bedsArr = [];
            let bathsArr = [];
            let amenitiesArr = [];

            try {
                bedsArr = Object.entries(bedsDetails || {}).map(([type, count]) => ({
                    type,
                    count: Number(count) || 0,
                }));
                bathsArr = Object.entries(bathroomsDetails || {}).map(([type, count]) => ({
                    type,
                    count: Number(count) || 0,
                }));
                amenitiesArr = typeof amenities === "string" ? JSON.parse(amenities) : (amenities || []);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: "Dữ liệu phòng không hợp lệ"
                });
            }

            // Upload room images
            const roomImages = [];
            const roomImageFiles = req.files?.filter(f => f.fieldname === 'images') || [];

            for (const file of roomImageFiles) {
                try {
                    const cloudinaryUrl = await uploadToCloudinary(file.path, 'hotel_rooms');
                    roomImages.push(cloudinaryUrl);
                    fs.unlinkSync(file.path);
                } catch (error) {
                    console.error('Error uploading room image to Cloudinary:', error);
                    roomImages.push(file.path);
                }
            }

            const newRoom = await Room.create({
                roomNumber,
                roomType,
                pricePerNight: Number(pricePerNight) || 0,
                roomArea: Number(roomArea) || 0,
                maxAdults: Number(maxAdults) || 0,
                maxChildren: Number(maxChildren) || 0,
                discountPercent: Number(discount) || 0,
                discount: Number(discount) || 0,
                bedsDetails: bedsArr,
                bathroomsDetails: bathsArr,
                amenities: amenitiesArr,
                roomImages: roomImages,
                hotel: hotelId,
                owner: req.user?._id || null
            });

            return res.status(200).json({
                success: true,
                message: "Thêm phòng thành công",
                room: newRoom,
            });
        }

        // Original logic: Create new hotel with rooms
        // Parse rooms JSON
        let roomsData = [];
        try {
            roomsData = typeof rooms === "string" ? JSON.parse(rooms) : rooms;
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu rooms không hợp lệ"
            });
        }

        if (!Array.isArray(roomsData) || roomsData.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Phải có ít nhất 1 phòng"
            });
        }

        // Upload hotel images to Cloudinary
        const hotelImages = [];
        const hotelImageFiles = req.files?.filter(f => f.fieldname === 'images') || [];

        for (const file of hotelImageFiles) {
            try {
                const cloudinaryUrl = await uploadToCloudinary(file.path, 'hotel_images');
                hotelImages.push(cloudinaryUrl);
                // Clean up local file after upload
                fs.unlinkSync(file.path);
            } catch (error) {
                console.error('Error uploading hotel image to Cloudinary:', error);
                // If upload fails, keep local path as fallback
                hotelImages.push(file.path);
            }
        }

        // Create hotel first
        const newHotel = await Hotel.create({
            name: hotelName,
            description: hotelDescription,
            address: hotelAddress,
            contact,
            city,
            owner: req.user?._id || null,
            images: hotelImages
        });

        // Create rooms
        const createdRooms = [];
        for (let i = 0; i < roomsData.length; i++) {
            const room = roomsData[i];

            // Convert bedsDetails (object → array)
            const bedsArr = Object.entries(room.bedsDetails || {}).map(([type, count]) => ({
                type,
                count: Number(count) || 0,
            }));

            // Convert bathroomsDetails (object → array)
            const bathsArr = Object.entries(room.bathroomsDetails || {}).map(([type, count]) => ({
                type,
                count: Number(count) || 0,
            }));

            // Room images from FormData (roomImages_0_0, roomImages_0_1, etc.) - upload to Cloudinary
            const roomImages = [];
            const roomImageFiles = req.files?.filter(file => {
                const match = file.fieldname.match(/^roomImages_(\d+)_(\d+)$/);
                return match && parseInt(match[1]) === i;
            }) || [];

            for (const file of roomImageFiles) {
                try {
                    const cloudinaryUrl = await uploadToCloudinary(file.path, 'hotel_rooms');
                    roomImages.push(cloudinaryUrl);
                    // Clean up local file after upload
                    fs.unlinkSync(file.path);
                } catch (error) {
                    console.error('Error uploading room image to Cloudinary:', error);
                    // If upload fails, keep local path as fallback
                    roomImages.push(file.path);
                }
            }

            const newRoom = await Room.create({
                roomNumber: room.roomNumber,
                roomType: room.roomType,
                pricePerNight: room.pricePerNight,
                roomArea: room.roomArea,
                maxAdults: room.maxAdults,
                maxChildren: room.maxChildren,
                discountPercent: Number(room.discount) || Number(room.discountPercent) || 0,
                discount: room.discount || room.discountPercent || 0,
                bedsDetails: bedsArr,
                bathroomsDetails: bathsArr,
                amenities: room.amenities,
                roomImages: roomImages,
                hotel: newHotel._id,
                owner: req.user?._id || null
            });

            createdRooms.push(newRoom);
        }

        return res.status(200).json({
            success: true,
            message: "Thêm khách sạn và phòng thành công",
            hotel: newHotel,
            rooms: createdRooms,
        });

    } catch (err) {
        console.error("createRoom error:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi thêm khách sạn",
            error: err.message,
        });
    }
};

/* ===================== Các API khác giữ nguyên ===================== */
/* Cập nhật phòng, xóa phòng, lấy phòng... dùng code hiện tại của bạn
   (mình giữ nguyên phần dưới để tập trung sửa createRoom - nếu bạn muốn,
   mình sẽ gửi lại toàn bộ file với các hàm khác copy nguyên bản) */

export const updateRoom = async (req, res) => {
    try {
        const roomId = req.params.id;
        let {
            roomNumber,
            roomType,
            pricePerNight,
            roomArea,
            maxAdults,
            maxChildren,
            discount,
            bedsDetails,
            bathroomsDetails,
            amenities,
            existingImages
        } = req.body;

        // Parse JSON fields (vì frontend gửi FormData dạng string)
        try {
            bedsDetails = typeof bedsDetails === "string" ? JSON.parse(bedsDetails) : bedsDetails;
            bathroomsDetails = typeof bathroomsDetails === "string" ? JSON.parse(bathroomsDetails) : bathroomsDetails;
            amenities = typeof amenities === "string" ? JSON.parse(amenities) : amenities;
            existingImages = typeof existingImages === "string" ? JSON.parse(existingImages) : existingImages;
        } catch (err) { }

        // Upload new images to Cloudinary
        const newUploadedImages = [];
        const newImageFiles = req.files || [];

        for (const file of newImageFiles) {
            try {
                const cloudinaryUrl = await uploadToCloudinary(file.path, 'hotel_rooms');
                newUploadedImages.push(cloudinaryUrl);
                // Clean up local file after upload
                fs.unlinkSync(file.path);
            } catch (error) {
                console.error('Error uploading new room image to Cloudinary:', error);
                // If upload fails, keep local path as fallback
                newUploadedImages.push(file.path);
            }
        }

        // Gộp ảnh cũ + ảnh mới
        const finalImages =
            Array.isArray(existingImages)
                ? [...existingImages, ...newUploadedImages]
                : newUploadedImages;

        // Chuẩn hoá bedsDetails (frontend gửi dạng object)
        // Backend mong dạng array [
        //    { type: "Giường đôi", count: 2 }
        // ]
        const bedsArr = Object.entries(bedsDetails || {}).map(([type, count]) => ({
            type,
            count: Number(count) || 0
        }));

        const bathsArr = Object.entries(bathroomsDetails || {}).map(([type, count]) => ({
            type,
            count: Number(count) || 0
        }));

        const updated = await Room.findByIdAndUpdate(
            roomId,
            {
                roomNumber,
                roomType,
                pricePerNight,
                roomArea,
                maxAdults,
                maxChildren,
                discountPercent: Number(discount) || Number(room.discountPercent) || 0,
                discount: (typeof discount === 'object' || typeof discount === 'number') ? discount : Number(discount) || 0,
                bedsDetails: bedsArr,
                bathroomsDetails: bathsArr,
                amenities,
                roomImages: finalImages,
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
        }

        return res.json({
            success: true,
            message: "Cập nhật phòng thành công",
            room: updated
        });

    } catch (err) {
        console.error("updateRoom error:", err);
        res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id).populate("hotel");
        if (!room) return res.json({ success: false, message: "Không tìm thấy phòng!" });

        const hotel = await Hotel.findOne({ owner: req.user._id });
        if (!hotel || room.hotel._id.toString() !== hotel._id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        await Room.findByIdAndDelete(id);
        res.json({ success: true, message: "Đã xóa phòng thành công!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getRooms = async (req, res) => {
    try {
        // Lấy tất cả phòng đang available
        const rooms = await Room.find({ isAvailable: true })
            .populate({
                path: "hotel",
                populate: { path: "owner", select: "image" },
            })
            .sort({ createdAt: -1 })
            .lean();

        // Lọc ra những phòng thuộc hotel active (giữ logic cũ)
        const activeRooms = rooms.filter((room) => {
            if (room.hotel) return room.hotel.isActive !== false;
            if (room.hotelName && room.hotelName.trim() !== "") return true;
            return false;
        });

        // --- TÍNH recentBookingsCount trong 3 ngày gần nhất ---
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        // Aggregate bookings nhóm theo room field, đếm bookings >= threeDaysAgo và status không phải 'cancelled'
        const recentCounts = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: threeDaysAgo },
                    status: { $nin: ["cancelled"] },
                },
            },
            {
                $group: {
                    _id: "$room",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Chuyển thành map roomId -> count
        const recentMap = {};
        recentCounts.forEach((r) => {
            if (r._id) recentMap[r._id.toString()] = r.count;
        });

        // Gắn recentBookingsCount và isHot (ngưỡng 5) vào mỗi room/room.hotel
        const HOT_THRESHOLD = 5;
        activeRooms.forEach((r) => {
            const rid = r._id?.toString();
            const c = recentMap[rid] || 0;
            r.recentBookingsCount = c;
            r.isHot = c >= HOT_THRESHOLD;
        });

        // --- Tính availableRooms trên hotel (giữ logic hiện tại) ---
        const hotelRoomCount = {};
        activeRooms.forEach((r) => {
            if (!r.hotel?._id) return;
            const hid = r.hotel._id.toString();
            if (!hotelRoomCount[hid]) hotelRoomCount[hid] = 0;
            if (r.isAvailable !== false) hotelRoomCount[hid]++;
        });

        // Gắn availableRooms vào hotel
        activeRooms.forEach((r) => {
            if (r.hotel?._id) {
                r.hotel.availableRooms = hotelRoomCount[r.hotel._id.toString()] || 0;
            }
        });

        res.json({ success: true, rooms: activeRooms });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getOwnerRooms = async (req, res) => {
    try {
        const hotelData = await Hotel.findOne({ owner: req.auth.userId });
        let rooms = [];

        if (hotelData) {
            rooms = await Room.find({
                $or: [{ hotel: hotelData._id }, { owner: req.auth.userId }],
            }).populate("hotel");
        } else {
            rooms = await Room.find({ owner: req.auth.userId }).populate("hotel");
        }

        res.json({ success: true, rooms });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getRoomsByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        //tính giá cuối sau giảm giá
        function calcFinalPrice(room, hotel) {
            let price = room.price;
            const now = new Date();

            // room discount
            if (room.discount && room.discount.percent > 0 &&
                (!room.discount.startDate || now >= room.discount.startDate) &&
                (!room.discount.endDate || now <= room.discount.endDate)) {
                price -= price * (room.discount.percent / 100);
            }

            // hotel discount
            if (hotel && hotel.hotelDiscount && hotel.hotelDiscount.percent > 0 &&
                (!hotel.hotelDiscount.startDate || now >= hotel.hotelDiscount.startDate) &&
                (!hotel.hotelDiscount.endDate || now <= hotel.hotelDiscount.endDate)) {
                price -= price * (hotel.hotelDiscount.percent / 100);
            }

            return Math.round(price);
        }

        // Lấy danh sách phòng thuộc khách sạn này, bao gồm hình ảnh
        const rooms = await Room.find({ hotel: hotelId })
            .populate("hotel")
            .lean();

        // TÍNH GIÁ FINAL
        const now = new Date();
        const transformedRooms = rooms.map((room) => {
            let final = room.pricePerNight;

            // giảm giá theo phòng
            if (room.discount > 0) {
                final -= final * (room.discount / 100);
            }

            // giảm giá toàn khách sạn
            if (room.hotel?.hotelDiscount?.percent > 0) {
                const hs = room.hotel.hotelDiscount.startDate;
                const he = room.hotel.hotelDiscount.endDate;
                if ((!hs || now >= hs) && (!he || now <= he)) {
                    final -= final * (room.hotel.hotelDiscount.percent / 100);
                }
            }

            return {
                ...room,
                finalPrice: Math.round(final),     // <<< FRONTEND CẎN CÁI NÀY
            };
        });

        return res.json({
            success: true,
            rooms: transformedRooms,
        });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách phòng thành công",
            rooms: roomsWithPrice,
        });

    } catch (error) {
        console.error("Lỗi khi lấy rooms theo hotelId:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách phòng",
            error: error.message,
        });
    }
};

export const toggleRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.body;
        const roomData = await Room.findById(roomId);
        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();
        res.json({ success: true, message: "Room availability updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: "Missing room id" });

        // Tìm room, populate hotel thông tin
        const room = await Room.findById(id).populate({
            path: "hotel",
            populate: { path: "owner", select: "username image" } // tuỳ chọn
        }).lean();

        if (!room) return res.status(404).json({ success: false, message: "Room not found" });

        // Tính finalPrice nếu bạn muốn gửi sẵn cho frontend (tùy bạn)
        // Ví dụ: room.finalPrice = room.pricePerNight;
        return res.json({ success: true, room });
    } catch (error) {
        console.error("getRoomById error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const recommendRooms = async (req, res) => {
    try {
        const { roomId, top } = req.query;
        if (!roomId) return res.status(400).json({ success: false, message: "Missing roomId" });

        const rooms = await Room.find({});
        return res.json({
            success: true,
            sameHotelRooms: [],
            otherHotelRooms: []
        });
    } catch (err) {
        console.error("recommendRooms error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const recommendHotels = async (req, res) => {
    try {
        const { hotelId, top } = req.query;
        if (!hotelId) return res.status(400).json({ success: false, message: "Missing hotelId" });

        const hotels = await Hotel.find({});
        return res.json({
            success: true,
            recommendations: []
        });
    } catch (err) {
        console.error("recommendHotels error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

import Favorite from '../models/Favorite.js';
import Room from '../models/Room.js';

// Thêm phòng vào yêu thích
export const addFavorite = async (req, res) => {
    try {
        const { roomId } = req.body;
        const userId = req.user._id;

        // Kiểm tra xem đã favorite chưa
        const existingFavorite = await Favorite.findOne({
            user: userId,
            room: roomId
        });

        if (existingFavorite) {
            return res.status(400).json({
                success: false,
                message: 'Phòng đã có trong danh sách yêu thích'
            });
        }

        // Tạo favorite mới
        const favorite = new Favorite({
            user: userId,
            room: roomId
        });

        await favorite.save();

        res.status(201).json({
            success: true,
            message: 'Đã thêm vào yêu thích',
            favorite
        });

    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Xóa phòng khỏi yêu thích
export const removeFavorite = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        const favorite = await Favorite.findOneAndDelete({
            user: userId,
            room: roomId
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy trong danh sách yêu thích'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa khỏi yêu thích'
        });

    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy danh sách phòng yêu thích
export const getFavorites = async (req, res) => {
    try {
        const userId = req.user._id;

        const favorites = await Favorite.find({ user: userId })
            .populate({
                path: 'room',
                populate: {
                    path: 'hotel',
                    select: 'name address'
                }
            })
            .sort({ createdAt: -1 });

        // Lọc bỏ những favorite có room bị xóa
        const validFavorites = favorites.filter(fav => fav.room);

        res.json({
            success: true,
            favorites: validFavorites.map(fav => fav.room)
        });

    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Kiểm tra trạng thái yêu thích
export const checkFavoriteStatus = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        const favorite = await Favorite.findOne({
            user: userId,
            room: roomId
        });

        res.json({
            success: true,
            isFavorite: !!favorite
        });

    } catch (error) {
        console.error('Check favorite status error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};
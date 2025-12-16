// routes/favoriteRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    addFavorite,
    removeFavorite,
    getFavorites,
    checkFavoriteStatus
} from '../controllers/favoriteController.js';

const favoriteRouter = express.Router();

// Tất cả routes đều cần authentication
favoriteRouter.use(protect);

// POST /api/favorites - Thêm vào yêu thích
favoriteRouter.post('/', addFavorite);

// GET /api/favorites - Lấy danh sách yêu thích
favoriteRouter.get('/', getFavorites);

// GET /api/favorites/check/:roomId - Kiểm tra trạng thái yêu thích
favoriteRouter.get('/check/:roomId', checkFavoriteStatus);

// DELETE /api/favorites/:roomId - Xóa khỏi yêu thích
favoriteRouter.delete('/:roomId', removeFavorite);

export default favoriteRouter;
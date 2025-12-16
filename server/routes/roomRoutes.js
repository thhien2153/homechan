
import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { createRoom, getOwnerRooms, getRooms, toggleRoomAvailability, updateRoom, deleteRoom, getRoomsByHotel, getRoomById } from "../controllers/roomController.js";
import {
    getRoomRecommendations,
    getHotelRecommendations,
    getRecommendationsList,
    getOptimalPrice
} from "../controllers/recommendationController.js";

const roomRouter = express.Router();

// existing routes...
roomRouter.post('/', upload.any(), protect, createRoom);
roomRouter.get('/', getRooms);
roomRouter.get('/hotel/:hotelId', getRoomsByHotel);

roomRouter.post('/toggle-availability', protect, toggleRoomAvailability);
roomRouter.put('/:id', upload.array("images", 15), protect, updateRoom);
roomRouter.delete('/:id', getRoomById, protect, deleteRoom);
roomRouter.get('/owner', protect, getOwnerRooms);

// new recommendation routes (read-only)
roomRouter.get("/recommend-rooms", getRoomRecommendations);     // ?roomId=...
roomRouter.get("/recommend-hotels", getHotelRecommendations);  // ?hotelId=...
roomRouter.get("/optimal-price", getOptimalPrice);
roomRouter.get("/:id", getRoomById);

roomRouter.get("/recommendations/list", getRecommendationsList);

export default roomRouter;

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    checkRoomImage,
    checkRoomImages,
    getRoomImageStatus,
    getSuspiciousImages,
    getImageAnalysisDetail,
    approveOrRejectImage
} from "../controllers/imageCheckController.js";

const imageRouter = express.Router();

// HOST routes - Upload và check ảnh
imageRouter.post("/check-image", protect, checkRoomImage);
imageRouter.post("/check-room-images/:roomId", protect, checkRoomImages);

// USER routes - Xem trạng thái ảnh của phòng
imageRouter.get("/room-status/:roomId", getRoomImageStatus);

// ADMIN routes - Quản lý ảnh nghi vấn
imageRouter.get("/suspicious", protect, getSuspiciousImages);
imageRouter.get("/analysis/:analysisId", protect, getImageAnalysisDetail);
imageRouter.put("/analyze/:analysisId/decision", protect, approveOrRejectImage);

export default imageRouter;

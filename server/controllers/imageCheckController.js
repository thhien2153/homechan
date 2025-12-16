import ImageAnalysis from "../models/ImageAnalysis.js";
import Room from "../models/Room.js";
import { analyzeImage, analyzeMultipleImages, getDetailedRecommendations } from "../services/imageDetectionService.js";

/**
 * HOST: Upload và check ảnh trước khi đăng
 */
export const checkRoomImage = async (req, res) => {
    try {
        const { imageUrl, roomId } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ success: false, message: "Image URL required" });
        }

        // Phân tích ảnh
        const analysisResult = await analyzeImage(imageUrl);

        if (!analysisResult.success) {
            return res.status(400).json({
                success: false,
                message: analysisResult.error || "Failed to analyze image"
            });
        }

        // Lưu kết quả phân tích vào database
        const imageAnalysis = await ImageAnalysis.create({
            imageUrl,
            roomId: roomId || null,
            uploadedBy: req.user._id,
            uploadedByRole: req.user.role,
            status: analysisResult.status,
            confidence: analysisResult.confidence,
            details: analysisResult.details,
            verdict: getDetailedRecommendations(analysisResult.status, analysisResult.details)
        });

        res.json({
            success: true,
            analysis: {
                id: imageAnalysis._id,
                status: analysisResult.status,
                confidence: analysisResult.confidence,
                details: analysisResult.details,
                verdict: getDetailedRecommendations(analysisResult.status, analysisResult.details)
            }
        });
    } catch (error) {
        console.error("Check image error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * HOST: Check tất cả ảnh của phòng
 */
export const checkRoomImages = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Tìm phòng
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        // Kiểm tra quyền
        if (room.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Phân tích tất cả ảnh của phòng
        const imageUrls = room.roomImages || [];
        const results = await analyzeMultipleImages(imageUrls);

        if (!results.success) {
            return res.status(400).json({
                success: false,
                message: results.error || "Failed to analyze images"
            });
        }

        // Lưu phân tích cho từng ảnh
        const analysisRecords = [];
        for (const detail of results.summary.details) {
            const record = await ImageAnalysis.create({
                imageUrl: detail.url || imageUrls[results.summary.details.indexOf(detail)],
                roomId,
                uploadedBy: req.user._id,
                uploadedByRole: req.user.role,
                status: detail.status,
                confidence: detail.confidence,
                details: detail.details
            });
            analysisRecords.push(record);
        }

        res.json({
            success: true,
            summary: results.summary,
            analysisRecords
        });
    } catch (error) {
        console.error("Check room images error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * USER: Xem trạng thái ảnh của phòng
 */
export const getRoomImageStatus = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Tìm phòng
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        // Lấy phân tích ảnh của phòng này
        const analyses = await ImageAnalysis.find({ roomId })
            .sort({ createdAt: -1 })
            .lean();

        // Tính toán overview
        const overview = {
            totalImages: room.roomImages?.length || 0,
            analyzedImages: analyses.length,
            realImages: analyses.filter(a => a.status === 'real').length,
            suspiciousImages: analyses.filter(a => a.status === 'suspicious').length,
            fakeImages: analyses.filter(a => ['likely_fake', 'ai_generated'].includes(a.status)).length,
            overallTrust: calculateOverallTrust(analyses)
        };

        res.json({
            success: true,
            overview,
            analyses: analyses.map(a => ({
                imageUrl: a.imageUrl,
                status: a.status,
                confidence: a.confidence,
                details: a.details,
                verdict: getDetailedRecommendations(a.status, a.details),
                analyzedAt: a.createdAt
            }))
        });
    } catch (error) {
        console.error("Get room image status error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ADMIN: Xem tất cả ảnh nghi vấn
 */
export const getSuspiciousImages = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;

        const query = {};
        if (status) {
            query.status = status;
        } else {
            // Mặc định lấy ảnh nghi vấn và fake
            query.status = { $in: ['suspicious', 'likely_fake', 'ai_generated'] };
        }

        const skip = (page - 1) * limit;

        const [analyses, total] = await Promise.all([
            ImageAnalysis.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('roomId', 'roomType pricePerNight')
                .populate('uploadedBy', 'username email')
                .lean(),
            ImageAnalysis.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: analyses,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get suspicious images error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ADMIN: Xem chi tiết ảnh
 */
export const getImageAnalysisDetail = async (req, res) => {
    try {
        const { analysisId } = req.params;

        const analysis = await ImageAnalysis.findById(analysisId)
            .populate('roomId')
            .populate('uploadedBy', 'username email role');

        if (!analysis) {
            return res.status(404).json({ success: false, message: "Analysis not found" });
        }

        res.json({
            success: true,
            analysis: {
                ...analysis.toObject(),
                verdict: getDetailedRecommendations(analysis.status, analysis.details)
            }
        });
    } catch (error) {
        console.error("Get analysis detail error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ADMIN: Chấp nhận hoặc từ chối ảnh
 */
export const approveOrRejectImage = async (req, res) => {
    try {
        const { analysisId } = req.params;
        const { adminDecision, reason } = req.body;

        if (!['approved', 'rejected'].includes(adminDecision)) {
            return res.status(400).json({ success: false, message: "Invalid decision" });
        }

        const analysis = await ImageAnalysis.findByIdAndUpdate(
            analysisId,
            {
                adminDecision,
                adminReason: reason,
                reviewedAt: new Date(),
                reviewedBy: req.user._id
            },
            { new: true }
        );

        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        console.error("Approve/reject image error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Tính toán mức độ tin tưởng tổng thể
 */
function calculateOverallTrust(analyses) {
    if (analyses.length === 0) return 0;

    const trustScores = analyses.map(a => {
        if (a.status === 'real') return 100;
        if (a.status === 'suspicious') return 60 - (a.confidence * 40);
        if (['likely_fake', 'ai_generated'].includes(a.status)) return Math.max(0, 30 - (a.confidence * 30));
        return 50;
    });

    const average = trustScores.reduce((sum, score) => sum + score, 0) / trustScores.length;
    return Math.round(average);
}

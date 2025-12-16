import mongoose from "mongoose";

const imageAnalysisSchema = new mongoose.Schema({
    // Ảnh được phân tích
    imageUrl: {
        type: String,
        required: true
    },

    // Liên kết tới phòng (nếu có)
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        default: null
    },

    // Người upload
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Role của người upload (host, admin, user)
    uploadedByRole: {
        type: String,
        enum: ['user', 'hotelOwner', 'admin'],
        default: 'hotelOwner'
    },

    // Kết quả phân tích: 'real', 'suspicious', 'likely_fake', 'ai_generated', 'unchecked', 'error'
    status: {
        type: String,
        enum: ['real', 'suspicious', 'likely_fake', 'ai_generated', 'unchecked', 'error'],
        default: 'unchecked'
    },

    // Độ tin cậy của phân tích (0-1)
    confidence: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
    },

    // Chi tiết phân tích
    details: {
        aiGenerated: {
            score: { type: Number, default: 0 }, // 0-100
            risk: { type: String, enum: ['low', 'medium', 'high', 'unknown'], default: 'unknown' }
        },
        deepfake: {
            score: { type: Number, default: 0 }, // 0-100
            risk: { type: String, enum: ['low', 'medium', 'high', 'unknown'], default: 'unknown' }
        },
        tampered: {
            score: { type: Number, default: 0 }, // 0-100
            risk: { type: String, enum: ['low', 'medium', 'high', 'unknown'], default: 'unknown' }
        },
        qualityScore: { type: Number, default: 0 }, // 0-100
        recommendations: [String] // Gợi ý cải thiện
    },

    // Verdict chi tiết
    verdict: {
        title: String,
        color: String,
        icon: String,
        message: String,
        suggestions: [String]
    },

    // Quyết định của admin
    adminDecision: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    // Lý do từ chối (nếu có)
    adminReason: String,

    // Ai review
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    // Khi review
    reviewedAt: Date,

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index
imageAnalysisSchema.index({ roomId: 1, status: 1 });
imageAnalysisSchema.index({ uploadedBy: 1 });
imageAnalysisSchema.index({ status: 1 });
imageAnalysisSchema.index({ adminDecision: 1 });
imageAnalysisSchema.index({ createdAt: -1 });

export default mongoose.model("ImageAnalysis", imageAnalysisSchema);

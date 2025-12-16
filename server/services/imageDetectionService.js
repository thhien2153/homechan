import axios from 'axios';

/**
 * Image Detection Service
 * Phát hiện ảnh giả, ảnh chỉnh sửa, ảnh sinh ra bởi AI
 */

// Kết quả phân tích ảnh
export const analyzeImage = async (imageUrl) => {
    try {
        // Sử dụng Sightengine API để phát hiện AI-generated images, deepfakes, etc
        const apiKey = process.env.SIGHTENGINE_API_KEY;
        const userId = process.env.SIGHTENGINE_USER_ID;

        // Nếu không có API keys, dùng mock data cho development
        if (!apiKey || !userId) {
            console.warn("⚠️ Sightengine API keys not configured - Using mock data for development");
            return generateMockAnalysis(imageUrl);
        }

        // Call Sightengine API
        const response = await axios.get('https://api.sightengine.com/1.0/check.json', {
            params: {
                url: imageUrl,
                models: 'genai,deepfake,properties',
                api_user: userId,
                api_key: apiKey
            }
        });

        const data = response.data;

        // Parse results
        const genaiScore = data.genai?.score || 0; // 0-1, càng cao càng có khả năng AI-generated
        const deepfakeScore = data.deepfake?.score || 0; // 0-1, càng cao càng có khả năng deepfake
        const qualityScore = calculateQualityScore(data.properties || {});
        const tamperedScore = data.properties?.tampered || 0; // 0-1

        // Determine status
        let status = 'real'; // 'real', 'suspicious', 'likely_fake', 'ai_generated'
        let confidence = 0;
        let recommendations = [];

        // Check AI-generated
        if (genaiScore > 0.7) {
            status = 'ai_generated';
            confidence = genaiScore;
            recommendations.push("Ảnh có khả năng cao được sinh ra bởi AI");
        }
        // Check deepfake
        else if (deepfakeScore > 0.6) {
            status = 'likely_fake';
            confidence = deepfakeScore;
            recommendations.push("Ảnh nghi vấn là deepfake hoặc được chỉnh sửa mạnh");
        }
        // Check tampered
        else if (tamperedScore > 0.5 || qualityScore < 50) {
            status = 'suspicious';
            confidence = Math.max(tamperedScore, 1 - (qualityScore / 100));
            recommendations.push("Ảnh có dấu hiệu chỉnh sửa hoặc chất lượng thấp");
            recommendations.push("Gợi ý: Chụp lại ảnh thực tế hoặc giảm mức chỉnh sửa");
        }
        // Real image but with improvements possible
        else if (qualityScore < 70) {
            status = 'real';
            confidence = 0.8;
            recommendations.push("Ảnh thực tế nhưng có thể cải thiện chất lượng");
            recommendations.push("Gợi ý: Tăng độ sáng, chọn góc chụp tốt hơn");
        }
        // Good quality real image
        else {
            status = 'real';
            confidence = 0.95;
            recommendations.push("Ảnh chân thực, chất lượng tốt");
        }

        return {
            success: true,
            status,
            confidence,
            details: {
                aiGenerated: {
                    score: Math.round(genaiScore * 100),
                    risk: genaiScore > 0.7 ? 'high' : genaiScore > 0.4 ? 'medium' : 'low'
                },
                deepfake: {
                    score: Math.round(deepfakeScore * 100),
                    risk: deepfakeScore > 0.6 ? 'high' : deepfakeScore > 0.3 ? 'medium' : 'low'
                },
                tampered: {
                    score: Math.round(tamperedScore * 100),
                    risk: tamperedScore > 0.5 ? 'high' : tamperedScore > 0.3 ? 'medium' : 'low'
                },
                qualityScore: Math.round(qualityScore),
                recommendations
            }
        };
    } catch (error) {
        console.error("Image analysis error:", error);
        return {
            success: false,
            error: error.message,
            status: 'error'
        };
    }
};

/**
 * Tính điểm chất lượng ảnh dựa trên các thuộc tính
 */
function calculateQualityScore(properties) {
    let score = 100;

    // Kiểm tra blur
    if (properties.blur && properties.blur > 0.5) {
        score -= 20;
    }

    // Kiểm tra contrast
    if (properties.contrast && properties.contrast < 0.3) {
        score -= 15;
    }

    // Kiểm tra noise
    if (properties.noise && properties.noise > 0.5) {
        score -= 20;
    }

    // Kiểm tra compression
    if (properties.compression && properties.compression > 0.7) {
        score -= 10;
    }

    return Math.max(score, 0);
}

/**
 * Batch analysis cho nhiều ảnh
 */
export const analyzeMultipleImages = async (imageUrls) => {
    try {
        const results = await Promise.all(
            imageUrls.map(url => analyzeImage(url))
        );

        const summary = {
            totalAnalyzed: results.length,
            realImages: results.filter(r => r.status === 'real').length,
            suspiciousImages: results.filter(r => r.status === 'suspicious').length,
            likelyFake: results.filter(r => r.status === 'likely_fake').length,
            aiGenerated: results.filter(r => r.status === 'ai_generated').length,
            averageConfidence: (results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length).toFixed(2),
            details: results
        };

        return {
            success: true,
            summary
        };
    } catch (error) {
        console.error("Batch analysis error:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Lấy hướng dẫn chi tiết dựa trên status
 */
export const getDetailedRecommendations = (status, details) => {
    const recommendations = {
        real: {
            title: "✅ Ảnh Thật - Đã Kiểm Duyệt AI",
            color: "green",
            icon: "check-circle",
            message: "Ảnh chân thực và được chấp nhận",
            suggestions: [
                "Ảnh này được xác nhận là chụp thực tế",
                "Chất lượng ảnh tốt, thích hợp để đăng",
                "Người dùng sẽ thấy ảnh này đáng tin cậy"
            ]
        },
        suspicious: {
            title: "⚠️ Ảnh Nghi Vấn - Chỉnh Sửa Mạnh",
            color: "orange",
            icon: "alert-triangle",
            message: "Ảnh có dấu hiệu chỉnh sửa đáng kể",
            suggestions: [
                "Hạn chế sử dụng filter quá mạnh",
                "Tránh làm màu, tăng độ bão hòa quá mức",
                "Chụp lại ảnh với điều kiện ánh sáng tự nhiên",
                "Sử dụng các công cụ chỉnh sửa nhẹ nhàng"
            ]
        },
        likely_fake: {
            title: "❌ Ảnh Khả Năng Cao Là Giả",
            color: "red",
            icon: "x-circle",
            message: "Ảnh có khả năng cao là deepfake hoặc chỉnh sửa quá mức",
            suggestions: [
                "Thay thế bằng ảnh thực tế",
                "Không sử dụng các công cụ AI để tạo hoặc chỉnh sửa ảnh",
                "Chụp lại với camera/điện thoại thực tế",
                "Tránh sử dụng các ứng dụng làm ảnh thẩm mỹ"
            ]
        },
        ai_generated: {
            title: "🤖 Ảnh Được Sinh Ra Bởi AI",
            color: "red",
            icon: "alert-circle",
            message: "Ảnh này có khả năng cao được tạo bởi AI",
            suggestions: [
                "Sử dụng ảnh chụp thực tế từ khách sạn",
                "Không được sử dụng ảnh được sinh ra bởi các công cụ AI",
                "Chụp ảnh từ nhiều góc độ khác nhau",
                "Bao gồm cả ảnh góc rộng lẫn chi tiết gần"
            ]
        }
    };

    return recommendations[status] || recommendations.real;
};

/**
 * Mock data cho development (khi chưa có Sightengine API keys)
 * Tạo dữ liệu giả ngẫu nhiên để test
 */
function generateMockAnalysis(imageUrl) {
    // Ngẫu nhiên tạo các score khác nhau
    const random = Math.random();
    let status, confidence;

    // 70% ảnh thật, 15% nghi vấn, 10% giả, 5% AI-generated
    if (random < 0.7) {
        status = 'real';
        confidence = 0.85 + Math.random() * 0.15; // 85-100%
    } else if (random < 0.85) {
        status = 'suspicious';
        confidence = 0.55 + Math.random() * 0.25; // 55-80%
    } else if (random < 0.95) {
        status = 'likely_fake';
        confidence = 0.60 + Math.random() * 0.4; // 60-100%
    } else {
        status = 'ai_generated';
        confidence = 0.75 + Math.random() * 0.25; // 75-100%
    }

    const genaiScore = status === 'ai_generated' ? 0.7 + Math.random() * 0.3 : Math.random() * 0.3;
    const deepfakeScore = status === 'likely_fake' ? 0.5 + Math.random() * 0.5 : Math.random() * 0.4;
    const tamperedScore = status === 'suspicious' ? 0.4 + Math.random() * 0.4 : Math.random() * 0.3;
    const qualityScore = status === 'real' ? 75 + Math.random() * 25 : 40 + Math.random() * 40;

    const recommendations = [];
    if (status === 'real') {
        recommendations.push("✅ Ảnh chân thực, chất lượng tốt");
    } else if (status === 'suspicious') {
        recommendations.push("⚠️ Ảnh có dấu hiệu chỉnh sửa hoặc chất lượng thấp");
        recommendations.push("Gợi ý: Chụp lại ảnh thực tế");
    } else if (status === 'likely_fake') {
        recommendations.push("❌ Ảnh nghi vấn là deepfake hoặc được chỉnh sửa mạnh");
        recommendations.push("Gợi ý: Sử dụng ảnh chụp thực tế");
    } else {
        recommendations.push("🤖 Ảnh này có khả năng cao được tạo bởi AI");
        recommendations.push("Gợi ý: Thay thế bằng ảnh chụp thực tế");
    }

    return {
        success: true,
        status,
        confidence: Number(confidence.toFixed(2)),
        details: {
            aiGenerated: {
                score: Math.round(genaiScore * 100),
                risk: genaiScore > 0.7 ? 'high' : genaiScore > 0.4 ? 'medium' : 'low'
            },
            deepfake: {
                score: Math.round(deepfakeScore * 100),
                risk: deepfakeScore > 0.6 ? 'high' : deepfakeScore > 0.3 ? 'medium' : 'low'
            },
            tampered: {
                score: Math.round(tamperedScore * 100),
                risk: tamperedScore > 0.5 ? 'high' : tamperedScore > 0.3 ? 'medium' : 'low'
            },
            qualityScore: Math.round(qualityScore),
            recommendations
        },
        isMocked: true
    };
}

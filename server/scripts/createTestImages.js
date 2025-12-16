/**
 * Script để tạo test image analysis data
 * Chạy: node scripts/createTestImages.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env từ folder server
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import ImageAnalysis from '../models/ImageAnalysis.js';
import Room from '../models/Room.js';

async function createTestImages() {
    const mongoOptions = {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 15000,
        retryWrites: true,
        maxPoolSize: 10
    };

    try {
        console.log('🔄 Đang kết nối tới MongoDB...');

        // Kết nối trực tiếp
        await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
        console.log('✅ Database connected');

        // Lấy phòng đầu tiên (thêm timeout handling)
        console.log('📍 Tìm kiếm phòng...');
        const rooms = await Room.find({}).limit(5).maxTimeMS(20000).lean();

        if (rooms.length === 0) {
            console.log('❌ Không tìm thấy phòng nào. Vui lòng tạo phòng trước.');
            process.exit(1);
        }

        console.log(`📍 Tìm thấy ${rooms.length} phòng, tạo test data...`);

        // Tạo test image analyses cho mỗi phòng
        for (const room of rooms) {
            // Lấy hình ảnh thực của phòng
            const roomImages = room.roomImages || [];

            if (roomImages.length === 0) {
                console.log(`⏭️ Phòng ${room._id} không có hình ảnh, bỏ qua...`);
                continue;
            }

            // Tạo phân tích cho mỗi hình ảnh thực
            for (let i = 0; i < roomImages.length; i++) {
                const random = Math.random();
                let status, confidence;

                // 70% thật, 15% nghi vấn, 10% giả, 5% AI
                if (random < 0.7) {
                    status = 'real';
                    confidence = 0.85 + Math.random() * 0.15;
                } else if (random < 0.85) {
                    status = 'suspicious';
                    confidence = 0.55 + Math.random() * 0.25;
                } else if (random < 0.95) {
                    status = 'likely_fake';
                    confidence = 0.60 + Math.random() * 0.4;
                } else {
                    status = 'ai_generated';
                    confidence = 0.75 + Math.random() * 0.25;
                }

                const analysis = await ImageAnalysis.create({
                    imageUrl: roomImages[i],  // ✅ Dùng hình ảnh thực
                    roomId: room._id,
                    uploadedBy: room.owner,
                    uploadedByRole: 'hotelOwner',
                    status,
                    confidence: Number(confidence.toFixed(2)),
                    details: {
                        aiGenerated: {
                            score: Math.round(Math.random() * 100),
                            risk: Math.random() > 0.7 ? 'high' : 'low'
                        },
                        deepfake: {
                            score: Math.round(Math.random() * 100),
                            risk: Math.random() > 0.7 ? 'high' : 'low'
                        },
                        tampered: {
                            score: Math.round(Math.random() * 100),
                            risk: Math.random() > 0.7 ? 'high' : 'low'
                        },
                        qualityScore: 70 + Math.round(Math.random() * 30),
                        recommendations: [
                            `Ảnh ${i + 1} - ${status}`,
                            'Chất lượng tốt'
                        ]
                    },
                    adminDecision: 'pending'
                });

                console.log(`✅ Tạo phân tích ảnh: ${analysis._id} (${status})`);
            }
        }

        console.log('✅ Hoàn thành tạo test data!');
        console.log('\n🎯 Hãy vào trang RoomDetails để xem Component ImageTrustworthiness');
        console.log('📍 URL: http://localhost:5173/room/{ROOM_ID}');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error('\n🔍 Gợi ý khắc phục:');
        console.error('1. Kiểm tra MONGODB_URI trong .env');
        console.error('2. Kiểm tra MongoDB cluster có đang chạy không');
        console.error('3. Kiểm tra IP address có được whitelist trong MongoDB Atlas không');
        console.error('4. Kiểm tra internet connection');

        try {
            await mongoose.connection.close();
        } catch (e) {
            // Ignore close error
        }
        process.exit(1);
    }
}

createTestImages();

import bcrypt from 'bcryptjs';
import User from './models/User.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://thaolt21it:lethuthao123@cluster0.cwuhhhy.mongodb.net/hotel-booking';

const createAdmin = async () => {
    try {
        // Kết nối MongoDB với error handling
        console.log('🔌 Đang kết nối MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log(' Kết nối MongoDB thành công!');

        console.log('🔧 Đang tạo tài khoản admin...');

        // Xóa admin cũ (nếu có)
        const deletedAdmin = await User.deleteMany({ role: 'admin' });
        if (deletedAdmin.deletedCount > 0) {
            console.log('🗑️ Đã xóa', deletedAdmin.deletedCount, 'admin cũ');
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Tạo admin mới
        const admin = await User.create({
            username: 'admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            role: 'admin',
            recentSearchedCities: [],
            isActive: true // Thêm field này để đảm bảo admin được kích hoạt
        });

        console.log('');
        console.log('🎉 TẠO ADMIN THÀNH CÔNG!');
        console.log('═══════════════════════════');
        console.log('👤 Username: admin');
        console.log('📧 Email: admin@gmail.com');
        console.log('🔑 Password: admin123');
        console.log('🛡️ Role: admin');
        console.log('🆔 ID:', admin._id);
        console.log('');
        console.log('✨ Bạn có thể đăng nhập bằng:');
        console.log('- Username: admin');
        console.log('- Hoặc Email: admin@gmail.com');
        console.log('- Password: admin123');

    } catch (error) {
        console.error('');
        console.error(' LỖI TẠO ADMIN:');
        console.error('═══════════════════');
        if (error.name === 'MongooseError' || error.message.includes('connect')) {
            console.error('🔌 Lỗi kết nối MongoDB:', error.message);
        } else if (error.code === 11000) {
            console.error('📧 Email hoặc username đã tồn tại');
        } else {
            console.error('🐛 Lỗi khác:', error.message);
        }
    } finally {
        // Đảm bảo đóng kết nối
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('🔌 Đã đóng kết nối MongoDB');
        }
        console.log('🔚 Script hoàn tất');
        process.exit(0);
    }
};

createAdmin();
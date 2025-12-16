# 🏨 Hotel Booking Platform - Hoàn Chỉnh

## 📋 Tổng Quan

Nền tảng đặt khách sạn trực tuyến với các tính năng:

### ✨ Tính Năng Chính

#### 1. **System Discount & Pricing** ✅
- Hiển thị giảm giá theo phần trăm
- Tính giá cuối cùng (giảm giá + gốc)
- Thống kê tiết kiệm

#### 2. **AI Phát Hiện Ảnh Giả** ✅
- Detect AI-generated images
- Detect deepfakes
- Detect chỉnh sửa mạnh
- Đánh giá chất lượng ảnh
- **3 Roles:** Host, User, Admin

#### 3. **Profile Management** ✅
- Edit avatar & địa chỉ
- Read-only fields: username, email, tên, SĐT
- Lưu & cập nhật dễ dàng

---

## 🗂️ Cấu Trúc Dự Án

```
hotel_booking/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageTrustworthiness.jsx    # ✨ Component hiển thị độ tin tưởng
│   │   │   ├── ImageQualityChecker.jsx     # Host check ảnh
│   │   │   ├── HotelCard.jsx               # Thẻ khách sạn (với discount)
│   │   │   └── ... (các component khác)
│   │   ├── pages/
│   │   │   ├── RoomDetails.jsx             # ✨ Tích hợp ImageTrustworthiness
│   │   │   ├── BookingPage.jsx             # Tính giá với discount
│   │   │   ├── Profile.jsx                 # ✨ Edit avatar & address
│   │   │   ├── admin/
│   │   │   │   └── ImageReview.jsx         # Admin dashboard
│   │   │   └── ...
│   │   └── ...
│   └── ...
│
├── server/                          # Node.js Backend
│   ├── controllers/
│   │   ├── imageCheckController.js  # ✨ API endpoints (Host, User, Admin)
│   │   ├── roomController.js        # ✨ Room creation with error handling
│   │   ├── userController.js        # ✨ Profile update
│   │   └── ...
│   ├── services/
│   │   └── imageDetectionService.js # ✨ AI detection logic
│   ├── models/
│   │   ├── ImageAnalysis.js         # ✨ Schema cho phân tích ảnh
│   │   ├── Room.js
│   │   └── ...
│   ├── routes/
│   │   ├── imageRoutes.js           # ✨ 6 endpoints
│   │   ├── roomRoutes.js            # ✨ với error handling
│   │   └── ...
│   ├── scripts/
│   │   └── createTestImages.js      # ✨ Test data generator
│   └── ...
│
└── Documentation Files:
    ├── QUICK_START.md               # 🚀 Bắt đầu nhanh
    ├── HOÀN_THÀNH_AI_SYSTEM.md      # 📖 Hướng dẫn chi tiết
    ├── AI_IMAGE_DETECTION_GUIDE.md  # 📚 Technical guide
    ├── HƯỚNG_DẪN_COMPONENT_TỰ_CHÉ.md # 🎯 Component placement
    └── POSITION_VISUALIZATION.md    # 📍 Visual guide
```

---

## 🚀 Quick Start (3 Bước)

### 1. Tạo Test Data
```bash
cd server
node scripts/createTestImages.js
```

### 2. Chạy Servers
```bash
# Terminal 1 - Server
cd server && npm run server

# Terminal 2 - Client  
cd client && npm run dev
```

### 3. Xem Component Hoạt Động
```
http://localhost:5173/room/{ROOM_ID}
→ Cuộn xuống → Thấy 🛡️ Kiểm Tra Độ Tin Tưởng Ảnh
```

---

## 📊 API Endpoints

### Image Detection (6 endpoints)

| Method | Endpoint | Auth | Mục Đích |
|--------|----------|------|---------|
| POST | `/api/image/check-image` | ✓ | Host check ảnh đơn |
| POST | `/api/image/check-room-images/:roomId` | ✓ | Host check tất cả ảnh phòng |
| GET | `/api/image/room-status/:roomId` | ✗ | User xem độ tin tưởng |
| GET | `/api/image/suspicious` | ✓ | Admin xem ảnh nghi vấn |
| GET | `/api/image/analysis/:analysisId` | ✓ | Admin xem chi tiết |
| PUT | `/api/image/analyze/:analysisId/decision` | ✓ | Admin phê duyệt/từ chối |

### Room Management

| Method | Endpoint | Ghi Chú |
|--------|----------|--------|
| POST | `/api/rooms` | ✨ Sửa error handling |
| GET | `/api/rooms/:id` | Lấy chi tiết phòng |
| PUT | `/api/rooms/:id` | Cập nhật phòng |

### User Profile

| Method | Endpoint | Ghi Chú |
|--------|----------|--------|
| PUT | `/api/user/update-profile` | ✨ Thêm protect middleware |

---

## 🎨 Components

### Frontend Component - ImageTrustworthiness
**Vị trí:** `client/src/components/ImageTrustworthiness.jsx`  
**Hiển thị ở:** RoomDetails page (sau gallery)  

**Features:**
- 🛡️ Shield icon + mức độ tin tưởng (%)
- 📊 4 thống kê: Ảnh Thật, Nghi Vấn, Giả, Tổng
- 📋 Danh sách chi tiết từng ảnh
- ⚠️ Cảnh báo nếu phát hiện ảnh giả

---

## 💾 Database Schema

### ImageAnalysis Collection

```javascript
{
  imageUrl: String,           // URL ảnh
  roomId: ObjectId,           // Phòng liên kết
  uploadedBy: ObjectId,       // Người upload
  uploadedByRole: String,     // user/hotelOwner/admin
  status: String,             // real/suspicious/likely_fake/ai_generated
  confidence: Number,         // 0-1
  details: {
    aiGenerated: { score: 0-100, risk: 'low|medium|high' },
    deepfake: { score: 0-100, risk: 'low|medium|high' },
    tampered: { score: 0-100, risk: 'low|medium|high' },
    qualityScore: 0-100,
    recommendations: [String]
  },
  adminDecision: String,      // pending/approved/rejected
  adminReason: String,
  reviewedAt: Date,
  createdAt: Date
}
```

---

## 🔐 Authentication

- JWT Token based
- `protect` middleware cho endpoints cần auth
- User role: 'user', 'hotelOwner', 'admin'
- Public endpoint: `GET /api/image/room-status/:roomId`

---

## 🧪 Testing

### Cách 1: Automatic (Recommended)
```bash
node scripts/createTestImages.js
```
Tạo test data cho tất cả phòng hiện có

### Cách 2: Manual (Postman)
```
GET /api/image/room-status/67abc123def456...
```
Copy room ID từ URL và test bằng Postman

---

## ⚙️ Configuration

### .env Variables

```env
# Sightengine (Tùy chọn - Mock data nếu không có)
SIGHTENGINE_API_KEY=your_api_key
SIGHTENGINE_USER_ID=your_user_id

# Database
MONGODB_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_secret

# Cloudinary (Upload ảnh)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## 📚 Documentation Files

| File | Nội Dung |
|------|---------|
| `QUICK_START.md` | 🚀 Bắt đầu nhanh trong 3 bước |
| `HOÀN_THÀNH_AI_SYSTEM.md` | 📖 Hướng dẫn chi tiết AI system |
| `AI_IMAGE_DETECTION_GUIDE.md` | 📚 Technical API guide |
| `HƯỚNG_DẪN_COMPONENT_TỰ_CHÉ.md` | 🎯 Component placement guide |
| `POSITION_VISUALIZATION.md` | 📍 Visual sơ đồ vị trí |

---

## ✅ Checklist - Hoàn Thành

- ✅ AI Detect Images (real, suspicious, fake, ai-generated)
- ✅ ImageTrustworthiness Component (RoomDetails)
- ✅ ImageQualityChecker Component (Host)
- ✅ ImageReview Dashboard (Admin)
- ✅ 6 API Endpoints (3 roles)
- ✅ ImageAnalysis Model + Indexes
- ✅ Mock Data (không cần Postman)
- ✅ Error Handling (roomController)
- ✅ Profile Management (avatar + address)
- ✅ Discount Display (HotelCard, RoomDetails, BookingPage)
- ✅ Test Data Script

---

## 🐛 Troubleshooting

### Component không hiển thị?
```bash
node scripts/createTestImages.js
```

### API không gọi?
Check browser console (F12) → Network tab

### Mock data không hoạt động?
Kiểm tra `.env` có `SIGHTENGINE_API_KEY` không (nếu không → dùng mock)

---

## 📞 Support

Xem chi tiết từng phần:
- **Quick Start**: `QUICK_START.md`
- **AI System**: `HOÀN_THÀNH_AI_SYSTEM.md`
- **Components**: `HƯỚNG_DẪN_COMPONENT_TỰ_CHÉ.md`
- **API Details**: `AI_IMAGE_DETECTION_GUIDE.md`

---

## 🎉 Status

**✅ PRODUCTION READY**

Tất cả features đã hoàn thành và test thành công!

---

**Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Complete ✨

// frontend/src/ai/suggestPrice.js

export function suggestRoomPrice(room) {
  const {
    roomArea = 0,
    maxAdults = 0,
    maxChildren = 0,
    bedsDetails = {},
    bathroomsDetails = {},
    amenities = {},
    roomType = ""
  } = room;

  // 1️⃣ Giá base theo loại phòng
  let basePrice = 300000;
  if (roomType.includes("đơn")) basePrice = 250000;
  if (roomType.includes("đôi")) basePrice = 400000;
  if (roomType.includes("gia đình")) basePrice = 650000;
  if (roomType.includes("cao cấp")) basePrice = 900000;

  // 2️⃣ Diện tích
  const areaBonus = Number(roomArea) * 15000;

  // 3️⃣ Sức chứa
  const guestBonus = (Number(maxAdults) * 80000) + (Number(maxChildren) * 30000);

  // 4️⃣ Giường
  const bedCount = Object.values(bedsDetails).reduce((a, b) => a + b, 0);
  const bedBonus = bedCount * 120000;

  // 5️⃣ Phòng tắm
  const bathCount = Object.values(bathroomsDetails).reduce((a, b) => a + b, 0);
  const bathBonus = bathCount * 100000;

  // 6️⃣ Tiện nghi
  const amenityCount = Object.values(amenities).filter(v => v).length;
  const amenityBonus = amenityCount * 70000;

  // 7️⃣ Tổng giá
  let finalPrice =
    basePrice +
    areaBonus +
    guestBonus +
    bedBonus +
    bathBonus +
    amenityBonus;

  // 8️⃣ Thêm yếu tố ngẫu nhiên (±20%)
  const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  finalPrice = Math.round(finalPrice * randomFactor);

  // 9️⃣ Làm tròn đẹp
  finalPrice = Math.round(finalPrice / 10000) * 10000;

  // ✅ Giới hạn hợp lý
  if (finalPrice < 200000) finalPrice = 200000;
  if (finalPrice > 5000000) finalPrice = 5000000;

  return {
    price: finalPrice,
    reason: `
      Giá được tính dựa trên:
      • Loại phòng: ${roomType}
      • Diện tích: ${roomArea} m²
      • Sức chứa: ${maxAdults} NL – ${maxChildren} TE
      • Giường: ${bedCount}
      • Phòng tắm: ${bathCount}
      • Tiện nghi: ${amenityCount}
    `.trim()
  };
}

// 🏨 AI Gợi ý khách sạn hoàn chỉnh
export function suggestCompleteHotel(criteria = {}) {
  const {
    city = '',
    budget = 'medium', // low, medium, high
    guestCount = 2,
    roomCount = 1,
    amenities = [],
    style = 'modern' // modern, traditional, luxury, budget
  } = criteria;

  // 🎯 Danh sách tên khách sạn theo thành phố
  const hotelNames = {
    'Hà Nội': [
      'Hanoi Grand Plaza Hotel',
      'Capital View Hotel',
      'Old Quarter Heritage Hotel',
      'Thang Long Hotel',
      'Dragon Palace Hotel'
    ],
    'Đà Nẵng': [
      'Danang Beach Resort',
      'Marble Mountains Hotel',
      'Son Tra Peninsula Hotel',
      'My Khe Beach Hotel',
      'Hai Van Pass View Hotel'
    ],
    'Hồ Chí Minh': [
      'Saigon Central Hotel',
      'Ben Thanh Plaza Hotel',
      'War Remnants Hotel',
      'Cu Chi Tunnels Resort',
      'Mekong Delta View Hotel'
    ],
    'Hà Tĩnh': [
      'Nghe Tinh Beach Hotel',
      'Hong Linh Mountain Resort',
      'Thien Cam Cave Hotel',
      'Ky Anh Coastal Hotel',
      'Son La Valley Hotel'
    ]
  };

  // 📍 Địa chỉ mẫu theo thành phố
  const addresses = {
    'Hà Nội': [
      '123 Đường Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
      '456 Phố Hàng Bông, Hoàn Kiếm, Hà Nội',
      '789 Đường Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
      '321 Đường Nguyễn Du, Hai Bà Trưng, Hà Nội',
      '654 Đường Bà Triệu, Hai Bà Trưng, Hà Nội'
    ],
    'Đà Nẵng': [
      '123 Đường Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
      '456 Đường Phạm Văn Đồng, Hải Châu, Đà Nẵng',
      '789 Đường Nguyễn Tất Thành, Hải Châu, Đà Nẵng',
      '321 Đường Trần Phú, Hải Châu, Đà Nẵng',
      '654 Đường Hoàng Sa, Sơn Trà, Đà Nẵng'
    ],
    'Hồ Chí Minh': [
      '123 Đường Nguyễn Huệ, Quận 1, Hồ Chí Minh',
      '456 Đường Đồng Khởi, Quận 1, Hồ Chí Minh',
      '789 Đường Lê Lợi, Quận 1, Hồ Chí Minh',
      '321 Đường Phạm Ngũ Lão, Quận 1, Hồ Chí Minh',
      '654 Đường Bùi Viện, Quận 1, Hồ Chí Minh'
    ],
    'Hà Tĩnh': [
      '123 Đường Trần Phú, Thành phố Hà Tĩnh',
      '456 Đường Nguyễn Du, Huyện Kỳ Anh',
      '789 Đường Lê Lợi, Huyện Cẩm Xuyên',
      '321 Đường Hồ Chí Minh, Huyện Nghi Xuân',
      '654 Đường Bà Triệu, Huyện Lộc Hà'
    ]
  };

  // 📞 Số điện thoại mẫu
  const phoneNumbers = [
    '0987654321',
    '0978123456',
    '0965432187',
    '0956789123',
    '0943219876'
  ];

  // 📧 Email mẫu
  const emails = [
    'info@hotel.com',
    'reservation@hotel.com',
    'contact@hotel.com',
    'booking@hotel.com',
    'welcome@hotel.com'
  ];

  // 🏨 Chọn tên khách sạn ngẫu nhiên
  const cityHotels = hotelNames[city] || hotelNames['Hà Nội'];
  const selectedHotelName = cityHotels[Math.floor(Math.random() * cityHotels.length)];

  // 📍 Chọn địa chỉ ngẫu nhiên
  const cityAddresses = addresses[city] || addresses['Hà Nội'];
  const selectedAddress = cityAddresses[Math.floor(Math.random() * cityAddresses.length)];

  // 📞 Chọn liên hệ ngẫu nhiên
  const selectedPhone = phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
  const selectedEmail = emails[Math.floor(Math.random() * emails.length)];

  // 📝 Tạo mô tả khách sạn
  const descriptions = {
    'modern': `${selectedHotelName} là khách sạn hiện đại với thiết kế sang trọng, tiện nghi đầy đủ. Khách sạn nằm ở vị trí thuận tiện, dễ dàng di chuyển đến các điểm tham quan nổi tiếng.`,
    'traditional': `${selectedHotelName} mang đậm nét kiến trúc truyền thống Việt Nam kết hợp với tiện nghi hiện đại. Khách sạn tạo không gian yên bình, gần gũi với thiên nhiên.`,
    'luxury': `${selectedHotelName} là biểu tượng của sự sang trọng và đẳng cấp. Với dịch vụ 5 sao, spa cao cấp, nhà hàng fine dining, khách sạn mang đến trải nghiệm lưu trú đỉnh cao.`,
    'budget': `${selectedHotelName} cung cấp dịch vụ lưu trú chất lượng với giá cả phải chăng. Khách sạn sạch sẽ, an toàn, phù hợp cho du khách muốn tiết kiệm chi phí.`
  };

  const selectedDescription = descriptions[style] || descriptions['modern'];

  // 🏠 Tạo danh sách phòng mẫu
  const roomTypes = ['Giường đơn', 'Giường đôi', 'Phòng cao cấp', 'Phòng gia đình'];
  const rooms = [];

  for (let i = 0; i < roomCount; i++) {
    const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
    const roomNumber = `P${String(i + 1).padStart(2, '0')}`;

    // Tạo thông tin phòng ngẫu nhiên
    const roomArea = Math.floor(Math.random() * 50) + 20; // 20-70m²
    const maxAdults = Math.floor(Math.random() * 4) + 1; // 1-4 người lớn
    const maxChildren = Math.floor(Math.random() * 3); // 0-2 trẻ em

    // Giường ngẫu nhiên
    const bedsDetails = {
      'Giường đơn': Math.floor(Math.random() * 3),
      'Giường đôi nhỏ': Math.floor(Math.random() * 2),
      'Giường đôi lớn vừa': Math.floor(Math.random() * 2),
      'Giường cỡ lớn': Math.floor(Math.random() * 2),
      'Giường siêu lớn': Math.floor(Math.random() * 2)
    };

    // Phòng tắm ngẫu nhiên
    const bathroomsDetails = {
      'Tiêu chuẩn': Math.floor(Math.random() * 2) + 1,
      'Nâng cao': Math.floor(Math.random() * 2),
      'Cao cấp': Math.floor(Math.random() * 2),
      'Hạng sang': Math.floor(Math.random() * 2)
    };

    // Tiện nghi ngẫu nhiên
    const allAmenities = ['Free WiFi', 'Free Breakfast', 'Room Service', 'Mountain View', 'Pool Access'];
    const amenitiesObj = {};
    allAmenities.forEach(amenity => {
      amenitiesObj[amenity] = Math.random() > 0.5;
    });

    // Tính giá phòng
    const priceResult = suggestRoomPrice({
      roomArea,
      maxAdults,
      maxChildren,
      bedsDetails,
      bathroomsDetails,
      amenities: amenitiesObj,
      roomType
    });

    rooms.push({
      roomNumber,
      roomType,
      pricePerNight: priceResult.price,
      roomArea,
      maxAdults,
      maxChildren,
      bedsDetails,
      bathroomsDetails,
      amenities: Object.keys(amenitiesObj).filter(k => amenitiesObj[k]),
      roomImages: []
    });
  }

  return {
    hotelName: selectedHotelName,
    hotelDescription: selectedDescription,
    hotelAddress: selectedAddress,
    contact: `${selectedPhone} / ${selectedEmail}`,
    city,
    rooms,
    totalEstimatedPrice: rooms.reduce((sum, room) => sum + room.pricePerNight, 0),
    reason: `🤖 AI đã tạo gợi ý khách sạn hoàn chỉnh dựa trên:
• Thành phố: ${city}
• Phong cách: ${style}
• Số phòng: ${roomCount}
• Ướu tiên: ${budget} budget
• Sức chứa: ${guestCount} khách`
  };
}

import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

export const registerHotel = async (req, res) => {
  try {
    const { name, address, contact, city } = req.body;
    const owner = req.user._id;

    // Kiểm tra nếu đã đăng ký
    const existingHotel = await Hotel.findOne({ owner });
    if (existingHotel) {
      return res.json({ success: false, message: "Hotel already registered" });
    }

    // Tạo khách sạn
    await Hotel.create({ name, address, contact, city, owner });

    // Cập nhật vai trò user và lấy lại thông tin mới
    const updatedUser = await User.findByIdAndUpdate(
      owner,
      { role: "hotelOwner" },
      { new: true, select: "-password" } //
    );

    return res.json({
      success: true,
      message: "Hotel registered successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// API to get all hotels
export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy hotels.' });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id).populate('owner', 'name email');
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    res.json({ success: true, hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, contact, city, description } = req.body;

    // Tìm khách sạn theo ID
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khách sạn" });
    }

    // Kiểm tra xem user hiện tại có phải chủ sở hữu không
    if (String(hotel.owner) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: chỉ chủ khách sạn mới có quyền sửa",
      });
    }

    // Danh sách ảnh hiện có
    let currentImages = hotel.images || [];
    let newImages = [];

    //  Nếu có ảnh mới upload lên
    if (req.files && req.files.length > 0) {
      try {
        const uploads = req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "hotels",
            resource_type: "image",
            quality: "auto:good",
            fetch_format: "auto",
          })
        );

        const results = await Promise.all(uploads);
        newImages = results.map((r) => r.secure_url);
      } catch (err) {
        console.error("Upload hotel image error:", err);
      }
    }

    //  Nếu request body có ảnh dạng URL (trường hợp gửi lại link ảnh cũ)
    if (req.body.images) {
      let bodyImages = [];
      try {
        bodyImages = Array.isArray(req.body.images)
          ? req.body.images
          : JSON.parse(req.body.images);
      } catch (e) {
        bodyImages = [req.body.images];
      }

      // Giữ lại những ảnh còn tồn tại (sau khi xóa một số ảnh)
      currentImages = bodyImages;
    }

    //  Nối ảnh mới vào sau ảnh cũ
    const updatedImages = [...currentImages, ...newImages];

    // Cập nhật lại dữ liệu
    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      {
        name,
        address,
        contact,
        city,
        description,
        images: updatedImages,
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Cập nhật khách sạn thành công!",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("updateHotel error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

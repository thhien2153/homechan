import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaMapMarkerAlt, FaBed, FaCheck, FaUserFriends, FaBaby } from 'react-icons/fa'
import FavoriteButton from './FavoriteButton'
import Swal from 'sweetalert2'

const HotelCard = ({ room, index, showImage = true, listView = false }) => {
  const facilityLabels = {
    'Free WiFi': 'Wi-Fi miễn phí',
    'Free Breakfast': 'Bữa sáng miễn phí',
    'Room Service': 'Dịch vụ phòng',
    'Mountain View': 'Nhìn ra núi',
    'Pool Access': 'Hồ bơi',
    'Sea View': 'Hướng biển',
    'Parking': 'Bãi đỗ xe',
    'Air Conditioning': 'Điều hòa',
    'Television': 'Tivi',
  };

  if (!room) return null

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  // Hiển thị Hot dựa trên dữ liệu server (recentBookingsCount hoặc isHot)
  const HOT_THRESHOLD = 3; // giữ tham chiếu nếu cần hiển thị số
  const recentBookingsCount = (room && (room.recentBookingsCount ?? room.recentBookings ?? 0)) || 0;
  const isHot = room?.isHot === true || recentBookingsCount >= HOT_THRESHOLD;

  const images = Array.isArray(room.roomImages) && room.roomImages.length > 0
    ? room.roomImages
    : Array.isArray(room.hotel?.images)
      ? room.hotel.images
      : ['/fallback.jpg']

  const prevImage = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const nextImage = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  // Helper to format price
  const formatVND = (v) =>
    typeof v === 'number'
      ? v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
      : 'Liên hệ'

  // Helper to calculate final price
  const calcFinalPrice = (price, discountPercent) => {
    const p = Number(price) || 0
    const d = Number(discountPercent) || 0
    return Math.round(p * (1 - d / 100))
  }

  // Compute discount percent to display: prefer room-level discount, fallback to hotel's rooms max or hotel-level max
  const computeDiscountPercent = () => {
    // check several possible fields used by different APIs/versions
    const candidates = [
      room.discountPercent,
      room.discount,
      room.salePercent,
      room.promoPercent,
      room.promotion?.percent,
      room.promotionPercent,
      room.promotionPercentValue,
      room.sale?.percent,
      room.promotion?.discount,
    ]

    const rp = candidates.map((c) => Number(c) || 0).reduce((a, b) => Math.max(a, b), 0)
    if (rp > 0) return rp
    if (Array.isArray(room.hotel?.rooms) && room.hotel.rooms.length) {
      const max = Math.max(
        ...room.hotel.rooms.map((r) => Number(r.discountPercent) || Number(r.discount) || 0),
        0
      )
      if (max > 0) return max
    }
    if (room.hotel?.maxDiscount) return Number(room.hotel.maxDiscount)
    return 0
  }

  const discountPercent = computeDiscountPercent()
  const finalPrice = discountPercent > 0 ? calcFinalPrice(room.pricePerNight, discountPercent) : room.pricePerNight

  // LIST VIEW: horizontal item used in HotelDetail list of rooms
  if (listView) {
    const original = room.originalPrice || null
    const hasDiscount = original && room.pricePerNight && room.pricePerNight < original

    return (
      <Link
        to={`/rooms/${room._id || ''}`}
        onClick={() => scrollTo(0, 0)}
        className="w-full bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-200 flex gap-4 p-4 items-stretch"
      >
        {/* Left: image */}
        <div className="relative w-[260px] h-[180px] rounded-lg overflow-hidden flex-shrink-0 group">
          {/* Badge giảm giá (nếu có) */}
          {discountPercent > 0 && (
            <div className="absolute left-3 top-3 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full z-20 shadow-lg">
              -{discountPercent}% GIẢM
            </div>
          )}
          <img
            src={images[currentImageIndex]}
            alt={`room-${currentImageIndex}`}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedMedia(images[currentImageIndex]);
              setShowMediaModal(true);
            }}
          />

          {isHot && (
            <div className="absolute top-3 right-3 z-50 flex flex-col items-end">
              <div className="relative">
                <div className="hot-ring"></div>

                <div
                  className="px-4 py-1.5 bg-gradient-to-r from-red-700 to-orange-500 
        text-white text-sm font-bold shadow-2xl rounded-full animate-hot"
                >
                  🔥 HOT
                </div>
              </div>

              <span className="mt-1 text-[11px] bg-black/60 text-white px-2 py-0.5 rounded-full shadow-md">
                {recentBookingsCount} lượt đặt gần đây
              </span>
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-30 transition"
              >
                ‹
              </button>

              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-30 transition"
              >
                ›
              </button>

              <div className="absolute bottom-2 w-full flex justify-center gap-1 z-30">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-gray-400/70'
                      }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Middle: details and amenities */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{room.title || room.roomType || 'Phòng'}</h3>
            <p className="text-sm text-gray-600">
              Diện tích phòng: {room.roomArea ? `${room.roomArea} m²` : 'Chưa có thông tin'}
            </p>

            {/* Occupancy row */}
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <FaUserFriends className="text-gray-500" />
                <span>{(room.maxGuests !== undefined && room.maxGuests !== null) ? room.maxGuests : 1} người lớn</span>
              </div>
              {room.maxChildren != null && (
                <div className="flex items-center gap-2">
                  <FaBaby className="text-gray-500" />
                  <span>{room.maxChildren} trẻ em</span>
                </div>
              )}
              {room.beds != null && (
                <div className="flex items-center gap-2">
                  <FaBed className="text-orange-400" />
                  <span>{room.beds} giường</span>
                </div>
              )}
            </div>

            {/* Amenities list */}
            {Array.isArray(room.amenities) && room.amenities.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                {room.amenities.slice(0, 6).map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <FaCheck className="text-green-500" />
                    <span className="truncate">{facilityLabels[a] || a}</span>
                  </div>
                ))}
              </div>
            )}

            {/* fallback short features if no amenities array */}
            {!Array.isArray(room.amenities) && (
              <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                {room.wifi && (
                  <div className="flex items-center gap-2"><FaCheck className="text-green-500" /><span>Wifi miễn phí</span></div>
                )}
                {room.view && (
                  <div className="flex items-center gap-2"><FaCheck className="text-green-500" /><span>{room.view}</span></div>
                )}
                {room.nonSmoking && (
                  <div className="flex items-center gap-2"><FaCheck className="text-green-500" /><span>Không hút thuốc</span></div>
                )}
                {room.balcony && (
                  <div className="flex items-center gap-2"><FaCheck className="text-green-500" /><span>Ban công/sân hiên</span></div>
                )}
              </div>
            )}

            <div className="mt-3 text-sm">
              <span className="text-blue-600 hover:underline cursor-pointer">
                Xem chính sách hủy phòng
              </span>
            </div>
          </div>

          {/* small note */}
          <div className="mt-2 text-xs text-gray-500">Lưu ý: Giá phòng có thể thay đổi vào các dịp lễ, tết, cuối tuần...</div>
        </div>

        {/* Right: price and CTA */}
        <div className="w-[220px] flex flex-col items-end justify-between">
          <div className="self-end text-right">
            {/* Giá gốc (gạch ngang) nếu có giảm giá */}
            {discountPercent > 0 && (
              <div className="text-sm text-gray-400 line-through mb-1">
                {formatVND(room.pricePerNight)}
              </div>
            )}

            <div className="text-2xl font-extrabold text-orange-600 leading-tight">
              {formatVND(finalPrice)}
              <span className="text-sm text-gray-500 font-medium"> / đêm</span>
            </div>

            {discountPercent > 0 && (
              <div className="text-xs text-green-600 font-semibold mt-1">
                Tiết kiệm {formatVND(room.pricePerNight - finalPrice)}
              </div>
            )}
          </div>

          {/* Heart + Button */}
          <div className="w-full mt-4 flex items-center justify-end gap-3">
            <FavoriteButton
              roomId={room._id}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all"
            />
            <Link
              to="/RoomDetails"
              state={{ room }}
              className="inline-block flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition max-w-[160px]"
            >
              Xem Chi tiết
            </Link>

          </div>
        </div>
      </Link>
    )
  }

  // Default card (existing compact card)
  // Default card: hiển thị ngang
  return (
    <Link
      to={`/rooms/${room._id || ''}`}
      onClick={() => scrollTo(0, 0)}
      key={room._id}
      className="flex flex-col sm:flex-row w-full bg-white rounded-xl shadow hover:shadow-lg overflow-hidden transition-all duration-300"
    >
      {/* Ảnh bên trái */}
      {showImage && (
        <div className="relative sm:w-1/2 w-full h-[240px] overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={`room-${currentImageIndex}`}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />

          {/* Badge giảm giá nếu có */}
          {discountPercent > 0 && (
            <div className="absolute left-3 top-3 z-30 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
              -{discountPercent}% GIẢM
            </div>
          )}

          {isHot && (
            <div
              className="absolute top-3 right-3 z-20 px-4 py-1.5 bg-gradient-to-r from-red-600 to-orange-500 text-white 
               text-sm font-bold rounded-full shadow-xl animate-hot"
            >
              🔥 HOT
            </div>
          )}

          {/* Nút lướt ảnh */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full px-2 py-1 text-xl font-bold shadow"
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full px-2 py-1 text-xl font-bold shadow"
              >
                ›
              </button>
            </>
          )}

          {/* Chấm chỉ báo ảnh */}
          {images.length > 1 && (
            <div className="absolute bottom-2 w-full flex justify-center gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-gray-400/70'}`}
                />
              ))}
            </div>
          )}

          {/* Nút yêu thích */}
          <div className="absolute top-3 left-3 z-20">
            <FavoriteButton
              roomId={room._id}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition"
            />
          </div>
        </div>
      )}

      {/* Thông tin bên phải */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{room.hotel?.name || 'Không có tên khách sạn'}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
            <FaMapMarkerAlt className="text-red-500" />
            {room.hotel?.address || 'Chưa có địa chỉ'}
          </p>

          <p className="mt-3 text-gray-700 flex items-center gap-2">
            <FaBed className="text-orange-400" /> {room.roomType || 'Chưa có loại phòng'}
          </p>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            {room.maxGuests && <span>👤 {room.maxGuests} người lớn</span>}
            {room.maxChildren && <span>🧒 {room.maxChildren} trẻ em</span>}
            {room.beds && <span>🛏️ {room.beds} giường</span>}
            {room.roomArea && <span>📏 {room.roomArea} m²</span>}
          </div>
        </div>

        {/* Giá + nút đặt phòng */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            {discountPercent > 0 && (
              <p className="text-sm text-gray-400 line-through mb-1">
                {formatVND(room.pricePerNight)}
              </p>
            )}
            <p className="text-2xl font-bold text-orange-600">
              {formatVND(finalPrice)}
            </p>
            <span className="text-sm text-gray-500">/ đêm</span>
            {discountPercent > 0 && (
              <p className="text-xs text-green-600 font-semibold mt-1">
                Tiết kiệm {formatVND(room.pricePerNight - finalPrice)}
              </p>
            )}
          </div>

          <button
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-lg transition-all shadow"
          >
            Đặt phòng
          </button>
        </div>
      </div>
      {showMediaModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowMediaModal(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút chuyển trái */}
            {images.length > 1 && (
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  )
                }
                className="absolute left-4 text-white bg-black/50 rounded-full px-3 py-2 text-2xl hover:bg-black/70"
              >
                ‹
              </button>
            )}

            {/* Ảnh hoặc video */}
            {images[currentImageIndex].endsWith('.mp4') ? (
              <video
                src={images[currentImageIndex]}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] rounded-lg"
              />
            ) : (
              <img
                src={images[currentImageIndex]}
                alt="Preview"
                className="max-w-full max-h-[90vh] rounded-lg"
              />
            )}

            {/* Nút chuyển phải */}
            {images.length > 1 && (
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-4 text-white bg-black/50 rounded-full px-3 py-2 text-2xl hover:bg-black/70"
              >
                ›
              </button>
            )}

            {/* Nút đóng */}
            <button
              onClick={() => setShowMediaModal(false)}
              className="absolute top-3 right-3 text-white bg-black/50 rounded-full px-3 py-1 text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </Link>
  )
}

export default HotelCard


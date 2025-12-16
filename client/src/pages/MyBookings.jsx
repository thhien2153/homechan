import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import { useAppContext } from '../conext/AppContext';
import toast from 'react-hot-toast';

const MyBookings = () => {
  //Lấy axios, token và user từ AppContext 
  const { axios, getToken, user } = useAppContext();
  //Khởi tạo state bookings 
  const [bookings, setBookings] = useState([]);
  const [hotelRating, setHotelRating] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({
    text: "",
    rating: 0,
    media: [],
    isAnonymous: false,
  });

  const fetchUserBookings = async () => {
    try {
      // gọi api để hiện thị ra ds đặt phòng
      const { data } = await axios.get('/api/bookings/user', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchHotelRating = async (hotelId) => {
    try {
      const { data } = await axios.get(`/api/comments/hotel-rating/${hotelId}`);
      if (data.success) {
        setHotelRating(prev => ({
          ...prev,
          [hotelId]: data   // lưu theo từng hotelId
        }));
      }
    } catch (error) {
      console.log("Lỗi rating:", error);
    }
  };


  const handleSubmitReview = async () => {
    if (!reviewData.text || !reviewData.rating) {
      toast.error("Vui lòng nhập bình luận và chọn số sao!");
      return;
    }

    const formData = new FormData();
    formData.append("text", reviewData.text);
    formData.append("rating", reviewData.rating);
    reviewData.media.forEach((file) => formData.append("media", file));

    try {
      const { data } = await axios.post(
        `/api/comments/${showReviewModal.room._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (data.success) {
        toast.success("Đánh giá thành công!");
        setShowReviewModal(null);
        setReviewData({ text: "", rating: 0, media: [] });

        // Gọi lại API để cập nhật trạng thái chính xác từ DB
        fetchUserBookings();

      } else {
        toast.error(data.message || "Lỗi khi gửi đánh giá");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  return (
    <motion.div
      className="py-28 px-4 md:px-16 lg:px-24 xl:px-32 bg-[#f9fafb] min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Title
        title=" Lịch sử đặt phòng"
        subTitle="Theo dõi hành trình nghỉ dưỡng của bạn thật rõ ràng và sinh động."
        align="center"
      />

      <div className="grid gap-10 mt-16">
        {Array.isArray(bookings) && bookings.map((booking, index) => {
          const isPaid = booking?.isPaid;
          return (
            <motion.div
              key={booking?._id || index}
              className={`rounded-2xl overflow-hidden border transition relative ${isPaid
                ? "bg-white shadow-md border-gray-100"
                : "bg-red-50 border-red-300 shadow-md"
                }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="md:flex">

                <div className="md:w-1/3">
                  <img
                    src={
                      booking?.room?.roomImages?.[0] ||
                      booking?.room?.images?.[0] ||
                      "/no-image.jpg"
                    }
                    alt="hotel"
                    className="h-full w-full object-cover md:rounded-l-2xl"
                  />
                </div>

                <div className="md:w-2/3 p-6 flex flex-col justify-between relative">
                  <div className="absolute top-4 right-4">
                    {isPaid ? (
                      booking.hasReviewed ? (
                        <span className="text-xs px-3 py-1 rounded-full shadow font-medium text-white bg-gray-400">
                          Đã đánh giá
                        </span>
                      ) : (
                        <button
                          onClick={() => setShowReviewModal(booking)}
                          className="text-xs px-3 py-1 rounded-full shadow font-medium text-white bg-gradient-to-r from-green-400 to-teal-500 hover:brightness-105"
                        >
                          Đánh giá
                        </button>
                      )
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-full shadow font-medium text-white bg-gradient-to-r from-red-400 to-pink-500">
                        Chưa thanh toán
                      </span>
                    )}

                  </div>


                  <div>
                    <h2 className="text-xl md:text-2xl font-playfair font-bold text-gray-800">
                      {booking?.hotel?.name || "Khách sạn"}
                      {" - "}
                      {booking?.room?.roomType || "Phòng"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                      <img src={assets.locationIcon} alt="location" className="w-4 h-4 mr-1" />
                      {booking?.hotel?.address || "Không có địa chỉ"}
                    </p>
                  </div>

                  <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">👤 Thông tin khách hàng</h4>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Tên:</span>
                        <span className="font-medium text-blue-700">
                          {booking?.user?.username || "Không có"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">SĐT:</span>
                        <span className="font-medium text-blue-700">
                          {booking?.user?.phone || "Không có"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 text-sm text-gray-700">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-inner border">
                      <h4 className="text-gray-500 font-medium mb-1">Ngày nhận phòng</h4>
                      <p className="text-base font-bold text-blue-700">
                        {booking?.checkInDate ? new Date(booking.checkInDate).toLocaleDateString("vi-VN") : "__"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl shadow-inner border">
                      <h4 className="text-gray-500 font-medium mb-1">Ngày trả phòng</h4>
                      <p className="text-base font-bold text-pink-600">
                        {booking?.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString("vi-VN") : "__"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl shadow-inner border">
                      <h4 className="text-gray-500 font-medium mb-1">Tổng tiền</h4>
                      <p className="text-base font-bold text-orange-600">
                        {booking?.totalPrice
                          ? booking.totalPrice.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })
                          : "__"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                    <span>Khách: {booking?.guests || 0} người</span>
                    <span>Phòng: {booking?.room?.roomType || "Không rõ"}</span>
                    <span>Trạng thái: {booking?.status || "Không rõ"}</span>
                  </div>

                  {!isPaid && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="mt-6 ml-auto py-2 px-6 bg-gradient-to-r from-pink-500 to-red-400 text-white text-sm font-semibold rounded-full shadow-md hover:brightness-105"
                    >
                      Thanh toán ngay
                    </motion.button>
                  )}
                </div>
              </div>
              {showReviewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] md:w-[500px] relative">
                    <h3 className="text-xl font-semibold mb-4 text-center">Đánh giá phòng</h3>

                    {/* Chọn sao */}
                    <div className="flex justify-center mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                          className={`text-3xl mx-1 transition ${star <= reviewData.rating ? "text-yellow-400" : "text-gray-300"}`}
                          aria-label={`Đánh ${star} sao`}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    {/* Nhập bình luận */}
                    <textarea
                      value={reviewData.text}
                      onChange={(e) => setReviewData(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-400 mb-3 resize-none"
                      placeholder="Nhập bình luận của bạn..."
                      rows="4"
                    />

                    {/* Upload hình ảnh/video */}
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => setReviewData(prev => ({ ...prev, media: Array.from(e.target.files) }))}
                      className="w-full text-sm text-gray-700 mb-3"
                    />

                    {/* Toggle ẩn danh */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          id="anonToggle"
                          type="checkbox"
                          checked={!!reviewData.isAnonymous}
                          onChange={() => setReviewData(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
                          className="w-4 h-4"
                        />
                        <label htmlFor="anonToggle" className="text-sm text-gray-700 select-none">Đăng ẩn danh</label>
                      </div>
                      <div className="text-xs text-gray-400">Ẩn tên khi hiển thị</div>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowReviewModal(null)}
                        className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={async () => {
                          // ✅ Kiểm tra dữ liệu nhập
                          if (!reviewData.text || !reviewData.rating) {
                            toast.error("Vui lòng nhập bình luận và chọn số sao!");
                            return;
                          }

                          // ✅ Chuẩn bị dữ liệu gửi
                          const formData = new FormData();
                          formData.append("text", reviewData.text);
                          formData.append("rating", reviewData.rating);
                          formData.append("isAnonymous", reviewData.isAnonymous ? "true" : "false");
                          reviewData.media?.forEach((file) => formData.append("media", file));
                          formData.append("bookingId", showReviewModal._id);

                          try {
                            const token = await getToken();

                            // ✅ Lấy roomId chính xác và đảm bảo là string
                            let roomId = null;
                            if (showReviewModal?.room?._id) roomId = showReviewModal.room._id;
                            else if (typeof showReviewModal?.room === "string") roomId = showReviewModal.room;
                            else if (showReviewModal?.roomId) roomId = showReviewModal.roomId;
                            else if (booking?.room?._id) roomId = booking.room._id;

                            console.log("✅ DEBUG roomId:", roomId);
                            console.log("✅ DEBUG booking object:", showReviewModal);

                            // ✅ Kiểm tra hợp lệ
                            if (!roomId || typeof roomId !== "string") {
                              toast.error("Không tìm thấy ID phòng hợp lệ để đánh giá!");
                              return;
                            }

                            // ✅ Gửi đánh giá lên server
                            const { data } = await axios.post(`/api/comments/${roomId}`, formData, {
                              headers: {
                                "Content-Type": "multipart/form-data",
                                Authorization: `Bearer ${token}`,
                              },
                            });

                            if (data.success) {
                              toast.success("Đánh giá thành công!");
                              setShowReviewModal(null);
                              setReviewData({ text: "", rating: 0, media: [], isAnonymous: false });
                              fetchUserBookings(); // refresh lại danh sách booking
                            } else {
                              toast.error(data.message || "Lỗi khi gửi đánh giá");
                            }
                          } catch (err) {
                            console.error("❌ Lỗi khi gửi đánh giá:", err);
                            toast.error(err.message || "Lỗi khi gửi đánh giá");
                          }
                        }}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-red-400 text-white hover:brightness-105"
                      >
                        Gửi đánh giá
                      </button>

                    </div>
                  </div>
                </div>
              )
              }
            </motion.div>
          );
        })}

      </div >

      {
        bookings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có booking nào</h3>
            <p className="text-gray-500">Hãy đặt phòng đầu tiên của bạn!</p>
          </div>
        )
      }
    </motion.div >
  );
};

export default MyBookings;
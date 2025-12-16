// client/src/pages/HotelDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../conext/AppContext';
import HotelCard from '../components/HotelCard';
import RoomRecommendation from "../components/RoomRecommendation";

const HotelDetail = () => {
  const { id } = useParams();
  const { axios } = useAppContext();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Comments / rating / modal media
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [hotelRating, setHotelRating] = useState({ avgRating: 0, totalReviews: 0 });

  // Lấy hotel + rooms
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [{ data: hotelData }, { data: roomsData }] = await Promise.all([
          axios.get(`/api/hotels/${id}`),
          axios.get(`/api/rooms/hotel/${id}`)
        ]);

        if (hotelData?.success) setHotel(hotelData.hotel);
        else setHotel(hotelData);

        setRooms(roomsData?.rooms || roomsData || []);
      } catch (err) {
        console.error('Error fetching hotel detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [axios, id]);

  // Khởi tạo mainImage
  useEffect(() => {
    if (hotel?.images && hotel.images.length > 0) {
      setMainImage(hotel.images[0]);
    } else {
      setMainImage(null);
    }
  }, [hotel]);

  // Lấy comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const { data } = await axios.get(`/api/comments/hotel/${id}`);
        if (data?.success) setComments(data.comments || []);
      } catch (err) {
        console.error('Lỗi khi tải đánh giá khách sạn:', err);
      } finally {
        setLoadingComments(false);
      }
    };
    fetchComments();
  }, [axios, id]);

  // Lấy rating tổng hợp
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const { data } = await axios.get(`/api/comments/hotel-rating/${id}`);
        if (data?.success) {
          setHotelRating({
            avgRating: data.avgRating,
            totalReviews: data.totalReviews
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải rating khách sạn:", err);
      }
    };
    fetchRating();
  }, [axios, id]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!hotel) return <div className="p-6">Không tìm thấy khách sạn</div>;

  return (
    <div className="pt-28 p-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          {/* Image gallery */}
          {hotel.images && hotel.images.length > 0 && (
            <div className="mb-6">
              {hotel.images.length >= 3 ? (
                <div className="flex gap-2 h-[400px]">
                  <div className="w-[60%] relative">
                    <img
                      src={mainImage || hotel.images[0]}
                      alt="Main Hotel"
                      className="w-full h-full object-cover rounded-xl shadow-lg cursor-pointer"
                      onClick={() => setMainImage(hotel.images[0])}
                    />
                  </div>

                  <div className="w-[40%] flex flex-col gap-2">
                    <div className="h-[196px]">
                      <img
                        src={hotel.images[1]}
                        alt="Hotel View 1"
                        className="w-full h-full object-cover rounded-xl shadow-lg cursor-pointer"
                        onClick={() => setMainImage(hotel.images[1])}
                      />
                    </div>
                    <div className="h-[196px] relative">
                      <img
                        src={hotel.images[2]}
                        alt="Hotel View 2"
                        className="w-full h-full object-cover rounded-xl shadow-lg cursor-pointer"
                        onClick={() => setMainImage(hotel.images[2])}
                      />

                      {hotel.images.length > 3 && (
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center cursor-pointer hover:bg-black/40 transition"
                          onClick={() => setMainImage(hotel.images[3])}
                        >
                          <span className="text-white font-semibold text-lg">+{hotel.images.length - 3} ảnh</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : hotel.images.length === 2 ? (
                <div className="flex gap-2 h-[400px]">
                  <div className="flex-[2]">
                    <img
                      src={mainImage || hotel.images[0]}
                      alt="Main Hotel"
                      className="w-full h-full object-cover rounded-xl shadow-lg cursor-pointer"
                      onClick={() => setMainImage(hotel.images[0])}
                    />
                  </div>
                  <div className="flex-1">
                    <img
                      src={hotel.images[1]}
                      alt="Secondary Hotel"
                      className="w-full h-full object-cover rounded-xl shadow-lg cursor-pointer"
                      onClick={() => setMainImage(hotel.images[1])}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-[400px]">
                  <img
                    src={hotel.images[0]}
                    alt="Hotel"
                    className="w-full h-full object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}
            </div>
          )}

          <h2 className="text-3xl font-bold mb-2">{hotel.name}</h2>

          {/* Rating tổng hợp */}
          {hotelRating.totalReviews > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="text-lg font-semibold">{hotelRating.avgRating} / 5</span>
              <span className="text-gray-500 text-sm">({hotelRating.totalReviews} đánh giá)</span>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4">{hotel.city} • {hotel.address}</p>
          <p className="mb-6">{hotel.description}</p>

          {/* DANH SÁCH PHÒNG */}
          <h3 className="text-2xl font-semibold mb-3">Các phòng</h3>
          <div className="flex flex-col gap-4">
            {rooms.map(r => (
              <div key={r._id} className="mb-2">
                <HotelCard room={r} listView={true} />
              </div>
            ))}
          </div>

          {/* GỢI Ý PHÒNG/ KHÁCH SẠN */}
          {rooms.length > 0 && (
            <div className="mt-14 border-t pt-8">
              {/* pass roomId của phòng đầu làm base (hoặc bạn có thể chọn phòng đang view) */}
              <RoomRecommendation hotelId={hotel._id} />
            </div>
          )}

          {/* Đánh giá từ khách hàng */}
          <div className="mt-10 bg-gray-50 rounded-xl p-6">
            <h3 className="text-2xl font-semibold mb-6">Đánh giá từ khách hàng</h3>

            {loadingComments ? (
              <p className="text-gray-500">Đang tải đánh giá...</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-500">Chưa có đánh giá nào cho khách sạn này.</p>
            ) : (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-gray-800">
                        {c.room?.roomNumber ? `Phòng ${c.room.roomNumber}` : "Phòng"} - {c.room?.roomType || ""}
                      </p>
                      <div className="text-yellow-400 text-lg">
                        {"★".repeat(c.rating)}<span className="text-gray-300">{"★".repeat(5 - c.rating)}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">
                      <span className="font-medium">
                        {c.isAnonymous ? "Người dùng ẩn danh" : c.user?.username || "Người dùng"}:
                      </span>{" "}
                      {c.text}
                    </p>

                    {c.media && c.media.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {c.media.map((m, i) => (
                          m.endsWith('.mp4') ? (
                            <video
                              key={i}
                              src={m}
                              className="w-40 h-32 rounded-lg shadow object-cover cursor-pointer hover:opacity-80 transition"
                              onClick={() => setSelectedMedia(m)}
                            />
                          ) : (
                            <img
                              key={i}
                              src={m}
                              alt="media"
                              className="w-40 h-32 rounded-lg shadow object-cover cursor-pointer hover:opacity-80 transition"
                              onClick={() => setSelectedMedia(m)}
                            />
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal hiển thị media (ảnh/video) */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            {selectedMedia.endsWith('.mp4') ? (
              <video src={selectedMedia} controls autoPlay className="rounded-xl max-h-[90vh]" />
            ) : (
              <img src={selectedMedia} alt="media" className="rounded-xl max-h-[90vh]" />
            )}
            <button
              className="absolute top-3 right-3 bg-white/70 hover:bg-white text-black rounded-full px-3 py-1 text-sm font-semibold"
              onClick={() => setSelectedMedia(null)}
            >
              ✕ Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetail;

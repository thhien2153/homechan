import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../conext/AppContext";
import RoomRecommendation from "../components/RoomRecommendation";
import FavoriteButton from "../components/FavoriteButton";
import ImageTrustworthiness from "../components/ImageTrustworthiness";
import toast from "react-hot-toast";
import StarRating from "../components/StarRating";

const RoomDetail = () => {
  const { id } = useParams();
  const { axios } = useAppContext();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const calcFinalPrice = (price, discountPercent) => {
    const p = Number(price) || 0;
    const d = Number(discountPercent) || 0;
    return Math.round(p * (1 - d / 100));
  };

  const formatCurrency = (v) => {
    if (isNaN(v)) return "-";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  };

  // Fetch room detail
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/rooms/${id}`);

        if (data.success && data.room) {
          setRoom(data.room);

          const imgs =
            data.room.roomImages?.length > 0
              ? data.room.roomImages
              : data.room.hotel?.images || [];

          setMainImage(imgs[0] || "/fallback.jpg");
        } else {
          toast.error(data.message || "Không tìm thấy phòng");
        }
      } catch (err) {
        console.error("Fetch room error", err);
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoom();
  }, [axios, id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const { data } = await axios.get(`/api/comments/${id}`);

        if (data?.success) {
          setComments(data.comments);
        }
      } catch (err) {
        console.error("Lỗi load comment phòng:", err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [axios, id]);

  if (loading) return <div className="p-6">Đang tải chi tiết phòng...</div>;
  if (!room) return <div className="p-6">Không tìm thấy phòng.</div>;

  // helpers
  const images =
    room.roomImages?.length > 0
      ? room.roomImages
      : room.hotel?.images || ["/fallback.jpg"];

  const formatVND = (v) =>
    typeof v === "number"
      ? v.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })
      : "Liên hệ";

  return (
    <div className="pt-28 px-6 md:px-12 lg:px-20 w-full">
      {/* HOTEL NAME */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {room.hotel?.name || "Khách sạn"}
          </h1>
          <div className="text-sm text-gray-600">
            • {room.hotel?.city || "-"}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <StarRating />
          <div className="text-sm text-gray-500">
            ({room.hotel?.totalReviews || 0} đánh giá)
          </div>
        </div>
      </div>

      {/* GALLERY */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <img
            src={mainImage}
            alt="main"
            className="w-full h-[420px] object-cover rounded-xl shadow"
          />
        </div>
        <div className="flex flex-col gap-2">
          {images.slice(0, 4).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`thumb-${idx}`}
              className="w-full h-24 object-cover rounded-md cursor-pointer"
              onClick={() => setMainImage(img)}
            />
          ))}
        </div>
      </div>

      {/* 🛡️ IMAGE TRUSTWORTHINESS - MỨC ĐỘ TIN TƯỞNG ẢNH */}
      <div className="mb-8 border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
        <h3 className="text-lg font-bold text-blue-800 mb-4">🛡️ Kiểm Tra Độ Tin Tưởng Ảnh</h3>
        <ImageTrustworthiness roomId={id} />
      </div>

      {/* TITLE + PRICE */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">
            {room.roomType || "Phòng"}
          </h2>
          <div className="text-gray-600 text-sm">
            {room.roomArea ? `${room.roomArea} m²` : ""}
          </div>
        </div>

        <div className="text-right">
          {Number(room.discountPercent) > 0 ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-400 line-through">
                {formatCurrency(room.pricePerNight)}
              </div>
              <div className="text-3xl font-extrabold text-orange-600">
                {formatCurrency(calcFinalPrice(room.pricePerNight, room.discountPercent))}
                <span className="text-sm text-gray-500 font-medium"> / đêm</span>
              </div>
              <div className="text-sm text-green-600 font-semibold">
                Tiết kiệm {formatCurrency(room.pricePerNight - calcFinalPrice(room.pricePerNight, room.discountPercent))} ({room.discountPercent}%)
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-orange-600">
                {formatCurrency(room.pricePerNight)}
                <span className="text-sm text-gray-500 font-medium"> / đêm</span>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <FavoriteButton roomId={room._id} />
            <Link to="/booking" state={{ room }}>
              <button className="px-6 py-3 bg-orange-500 text-white rounded-lg">
                Đặt ngay
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* AMENITIES */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Tiện nghi</h3>
        <div className="flex flex-wrap gap-3">
          {room.amenities?.slice(0, 12).map((a, i) => (
            <div
              key={i}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {a}
            </div>
          ))}
        </div>
      </div>

      {/* DESCRIPTION */}
      {room.description && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Mô tả</h3>
          <p className="text-gray-700">{room.description}</p>
        </div>
      )}

      {/* COMMENTS */}
      <div className="mt-10 bg-gray-50 rounded-xl p-6">
        <h3 className="text-2xl font-semibold mb-6">
          Đánh giá của khách về phòng này
        </h3>

        {loadingComments ? (
          <p className="text-gray-500">Đang tải đánh giá...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500">Chưa có đánh giá nào.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div
                key={c._id}
                className="bg-white p-4 rounded-lg shadow-sm border"
              >
                <div className="flex justify-between mb-2">
                  <p className="font-semibold text-gray-800">
                    {c.user?.username || "Người dùng"}
                  </p>

                  <div className="text-yellow-400 text-lg">
                    {"★".repeat(c.rating)}
                    <span className="text-gray-300">
                      {"★".repeat(5 - c.rating)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{c.text}</p>

                {c.media?.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {c.media.map((m, i) =>
                      m.endsWith(".mp4") ? (
                        <video
                          key={i}
                          src={m}
                          className="w-40 h-32 rounded-lg shadow object-cover cursor-pointer"
                          onClick={() => setSelectedMedia(m)}
                        />
                      ) : (
                        <img
                          key={i}
                          src={m}
                          className="w-40 h-32 rounded-lg shadow object-cover cursor-pointer"
                          onClick={() => setSelectedMedia(m)}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECOMMENDATION */}
      <div className="mt-10">
        <RoomRecommendation
          roomId={room._id}
          hotelId={room.hotel?._id}
        />
      </div>

      {/* MEDIA PREVIEW */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            {selectedMedia.endsWith(".mp4") ? (
              <video
                src={selectedMedia}
                controls
                autoPlay
                className="rounded-xl max-h-[90vh]"
              />
            ) : (
              <img
                src={selectedMedia}
                className="rounded-xl max-h-[90vh]"
              />
            )}

            <button
              className="absolute top-3 right-3 bg-white/70 hover:bg-white text-black rounded-full px-3 py-1 text-sm font-semibold"
              onClick={() => setSelectedMedia(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetail;
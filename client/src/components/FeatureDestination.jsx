import React, { useState, useEffect } from "react";
import Title from "./Title";
import { useAppContext } from "../conext/AppContext";

const FeatureDestination = () => {
  const { axios, navigate } = useAppContext();
  const [visibleCount, setVisibleCount] = useState(8);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [roomCount, setRoomCount] = useState({});
  const [recentBooking, setRecentBooking] = useState({});
  const [maxDiscounts, setMaxDiscounts] = useState({});

  useEffect(() => {
    let mounted = true;

    const fetchHotels = async () => {
      try {
        const { data } = await axios.get("/api/hotels");
        if (mounted) setHotels(data || []);

        // ================================
        // 1️⃣ LẤY SỐ PHÒNG THEO KHÁCH SẠN
        // ================================
        const roomPromises = data.map((hotel) =>
          axios
            .get(`/api/rooms/hotel/${hotel._id}`)
            .then((res) => ({
              id: hotel._id,
              count: res.data.rooms?.length || 0,
              rooms: res.data.rooms || [],
            }))
            .catch(() => ({ id: hotel._id, count: 0, rooms: [] }))
        );

        const roomResults = await Promise.all(roomPromises);
        const roomMap = {};
        const discountMap = {};

        roomResults.forEach((r) => {
          roomMap[r.id] = r.count;
          // Find max discount from all rooms in this hotel
          const maxDiscount = Math.max(
            ...(r.rooms || []).map(room => Number(room.discountPercent) || 0),
            0
          );
          discountMap[r.id] = maxDiscount;
        });

        setRoomCount(roomMap);
        setMaxDiscounts(discountMap);

        // ================================
        // 2️⃣ LẤY RATING TỪ /comments
        // ================================
        const ratingPromises = data.map((hotel) =>
          axios
            .get(`/api/comments/hotel-rating/${hotel._id}`)
            .then((res) => ({
              id: hotel._id,
              avgRating: res.data.avgRating || 0,
              totalReviews: res.data.totalReviews || 0,
            }))
            .catch(() => ({
              id: hotel._id,
              avgRating: 0,
              totalReviews: 0,
            }))
        );

        const ratingResults = await Promise.all(ratingPromises);
        const ratingMap = {};
        ratingResults.forEach(
          (r) =>
          (ratingMap[r.id] = {
            avgRating: r.avgRating,
            totalReviews: r.totalReviews,
          })
        );
        setRatings(ratingMap);

        // ================================
        // 3️⃣ LẤY BOOKING TRONG 7 NGÀY GẦN ĐÂY
        // ================================
        const bookingPromises = data.map((hotel) =>
          axios
            .get(`/api/bookings/hotel/${hotel._id}/recent`)
            .then((res) => ({
              id: hotel._id,
              count: res.data.recentBookings || 0,
            }))
            .catch(() => ({ id: hotel._id, count: 0 }))
        );

        const bookingResults = await Promise.all(bookingPromises);
        const bookingMap = {};
        bookingResults.forEach((r) => (bookingMap[r.id] = r.count));
        setRecentBooking(bookingMap);
      } catch (err) {
        console.error("Lỗi lấy hotels:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchHotels();
    return () => {
      mounted = false;
    };
  }, [axios]);

  const showMore = () => setVisibleCount((prev) => prev + 4);
  const showLess = () => setVisibleCount(8);

  if (loading || hotels.length === 0) return null;

  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20">
      <Title
        title="Hãy khám phá các địa điểm nghỉ ngơi của chúng tôi"
        subTitle="Những lựa chọn được du khách săn đón nhất – cập nhật liên tục theo xu hướng đặt phòng mới nhất."
      />

      <div className="flex flex-wrap items-center justify-center gap-6 mt-20">
        {hotels.slice(0, visibleCount).map((h) => (
          <div
            key={h._id}
            onClick={() => {
              navigate(`/hotels/${h._id}`);
              scrollTo(0, 0);
            }}
            className="relative w-full sm:max-w-[48%] md:max-w-[30%] lg:max-w-[23%] bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 group cursor-pointer"
          >
            <div className="relative h-[200px] overflow-hidden">
              {maxDiscounts[h._id] > 0 && (
                <div className="absolute left-3 top-3 z-30 px-3 py-1.5 bg-gradient-to-r from-red-600 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                  Đang giảm giá
                </div>
              )}

              {recentBooking[h._id] >= 3 && (
                <div className="absolute top-3 right-3 z-30 px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg animate-hot border border-white/20">
                  🔥 HOT
                </div>
              )}

              <img
                src={h.images?.[0] || "/fallback.jpg"}
                alt={h.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent z-10" />
            </div>

            <div className="p-4 flex flex-col gap-2">
              <h3 className="text-base font-semibold text-gray-900">
                {h.name}
              </h3>
              <p className="text-sm text-gray-600">{h.city}</p>
              <p className="text-xs text-gray-500 truncate">{h.address}</p>

              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-yellow-400 text-lg">★</span>
                <span className="font-semibold text-gray-900">
                  {ratings[h._id]?.avgRating || 0} / 5
                </span>
                <span className="text-sm text-gray-500">
                  ({ratings[h._id]?.totalReviews || 0} đánh giá)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < hotels.length ? (
        <button
          onClick={showMore}
          className="mt-10 px-5 py-2.5 text-sm text-gray-700 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition-all shadow-sm"
        >
          Xem thêm
        </button>
      ) : (
        visibleCount > 8 && (
          <button
            onClick={showLess}
            className="mt-10 px-5 py-2.5 text-sm text-gray-700 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition-all shadow-sm"
          >
            Ẩn bớt
          </button>
        )
      )}

      <button
        onClick={() => {
          navigate("/hotels");
          scrollTo(0, 0);
        }}
        className="my-16 px-5 py-2.5 text-sm text-gray-700 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition-all shadow-sm"
      >
        Xem tất cả khách sạn
      </button>
    </div>
  );
};

export default FeatureDestination;

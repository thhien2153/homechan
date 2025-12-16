import React, { useEffect, useState } from "react";
import { useAppContext } from "../conext/AppContext";
import RoomRecommendation from "../components/RoomRecommendation";

const Recommendations = () => {
    const { axios } = useAppContext();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        setLoading(true);
        setErr(null);

        axios
            .get("/api/rooms/recommendations/list") // dựa vào baseURL trong AppContext
            .then((res) => {
                console.log("Recommendation response:", res); // <<--- debug: kiểm tra cấu trúc
                const recs = res?.data?.recommendations || [];
                setRooms(recs);
            })
            .catch((err) => {
                console.error("Recommendation error:", err);
                setErr(err);
            })
            .finally(() => setLoading(false));
    }, [axios]);

    if (loading) return <div className="p-4">Đang tải gợi ý...</div>;
    // if (err) return <div className="p-4 text-red-600">Lỗi khi tải gợi ý</div>;
    // if (!rooms || rooms.length === 0) return <div className="p-4">Không có phòng hot.</div>;

    // return (
    //     <div className="p-4">
    //         <h2 className="text-xl font-semibold mb-4">🔥 Phòng Hot (trong 3 ngày qua)</h2>

    //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //             {rooms.map((room, i) => (
    //                 <div key={room._id || i} className="border rounded p-3 relative shadow">

    //                     {/* 🔥 Badge Hot */}
    //                     <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
    //                         HOT ({room.bookingCount} lượt đặt)
    //                     </div>

    //                     <h3 className="font-semibold text-lg">
    //                         {room.roomType || room.title}
    //                     </h3>

    //                     <p className="text-sm text-gray-600">{room.hotel?.name}</p>

    //                     <p className="text-orange-600 font-bold mt-1">
    //                         {room.pricePerNight?.toLocaleString("vi-VN")} ₫/đêm
    //                     </p>

    //                     <p className="text-sm text-gray-500 mt-1">
    //                         Thành phố: {room.hotel?.city}
    //                     </p>
    //                 </div>
    //             ))}
    //         </div>
    //     </div>
    // );

};

export default Recommendations;

// client/src/components/RoomRecommendation.jsx
import React, { useEffect, useState } from "react";
import { useAppContext } from "../conext/AppContext";
import { Link } from "react-router-dom";

const RoomRecommendation = ({ roomId, hotelId, count = 6 }) => {
    const { axios } = useAppContext();

    const [loading, setLoading] = useState(false);
    const [sameHotelRooms, setSameHotelRooms] = useState([]);
    const [otherHotelRooms, setOtherHotelRooms] = useState([]);
    const [similarHotels, setSimilarHotels] = useState([]);

    useEffect(() => {
        if (!roomId && !hotelId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // ---- 1) Gợi ý PHÒNG ----
                if (roomId && roomId !== "undefined") {
                    const res = await axios.get(
                        `/api/rooms/recommend-rooms?roomId=${roomId}&top=${count}`
                    );
                    if (res.data.success) {
                        setSameHotelRooms(res.data.sameHotelRooms || []);
                        setOtherHotelRooms(res.data.otherHotelRooms || []);
                    }
                }

                // ---- 2) Gợi ý KHÁCH SẠN ----
                if (hotelId) {
                    const res2 = await axios.get(
                        `/api/rooms/recommend-hotels?hotelId=${hotelId}&top=${count}`
                    );

                    if (res2.data.success) {
                        setSimilarHotels(res2.data.recommendations || []);
                    }
                }

            } catch (err) {
                console.error("Recommendation fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roomId, hotelId]);


    if (loading) return <div>Đang tải gợi ý...</div>;


    // ---- RENDER ROOM CARD ----
    const RenderRoomCard = ({ entry }) => {
        const r = entry.room;

        if (!r || !r._id) return null;

        const img = r.roomImages?.[0] ||
            r.hotel?.images?.[0] ||
            "/fallback.jpg";

        return (
            <Link
                to={`/rooms/${r._id}`}
                className="p-3 bg-white rounded-lg shadow hover:shadow-md transition block"
            >
                <img
                    src={img}
                    className="w-full h-36 object-cover rounded-md mb-2"
                    alt={r.title || "room"}
                />

                <h4 className="font-semibold">{r.title || r.roomType}</h4>

                <p className="text-sm text-gray-600">
                    {r.hotel?.name}
                </p>

                <div className="text-orange-600 font-bold mt-1">
                    {r.pricePerNight?.toLocaleString("vi-VN")} ₫/đêm
                </div>
            </Link>
        );
    };


    // ---- RENDER HOTEL CARD ----
    const RenderHotelCard = ({ hotel }) => {

        const img = hotel.images?.[0] || "/fallback.jpg";

        return (
            <Link
                to={`/hotels/${hotel._id}`}
                className="p-3 bg-white rounded-lg shadow hover:shadow-md transition block"
            >
                <img
                    src={img}
                    className="w-full h-36 object-cover rounded-md mb-2"
                    alt={hotel.name}
                />

                <h4 className="font-semibold">{hotel.name}</h4>
                <p className="text-sm text-gray-600">{hotel.city}</p>
            </Link>
        );
    };


    // ---- Nếu không có gì thì khỏi render ----
    if (
        sameHotelRooms.length === 0 &&
        otherHotelRooms.length === 0 &&
        similarHotels.length === 0
    )
        return null;


    return (
        <div className="mt-10">

            {/* --- PHÒNG TRONG CÙNG KHÁCH SẠN --- */}
            {sameHotelRooms.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-xl font-semibold mb-4">
                        Phòng tương tự trong khách sạn
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {sameHotelRooms.map(item => (
                            <RenderRoomCard entry={item} key={item.room._id} />
                        ))}
                    </div>
                </div>
            )}

            {/* --- PHÒNG KHÁCH SẠN KHÁC --- */}
            {otherHotelRooms.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-xl font-semibold mb-4">
                        Phòng tương tự ở khách sạn khác
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {otherHotelRooms.map(item => (
                            <RenderRoomCard entry={item} key={item.room._id} />
                        ))}
                    </div>
                </div>
            )}

            {/* --- KHÁCH SẠN TƯƠNG TỰ --- */}
            {similarHotels.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">
                        Khách sạn tương tự
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {similarHotels.map(h => (
                            <RenderHotelCard hotel={h} key={h._id} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomRecommendation;

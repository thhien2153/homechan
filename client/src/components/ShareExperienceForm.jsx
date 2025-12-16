import React, { useState, useEffect } from 'react';
import { useAppContext } from '../conext/AppContext';
import StarInput from './StarInput';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ShareExperienceForm = ({ onSuccess }) => {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  const { user, getToken } = useAppContext();

  // Lấy danh sách hotels
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get('/api/hotels');
        setHotels(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy hotels:', err);
      }
    };
    fetchHotels();
  }, []);

  // Lấy rooms khi chọn hotel
  useEffect(() => {
    if (selectedHotel) {
      const fetchRooms = async () => {
        try {
          const res = await axios.get(`/api/rooms/hotel/${selectedHotel}`);
          setRooms(res.data);
          setSelectedRoom(''); // Reset room selection
        } catch (err) {
          console.error('Lỗi khi lấy rooms:', err);
        }
      };
      fetchRooms();
    }
  }, [selectedHotel]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      return toast.error('Bạn cần đăng nhập để gửi đánh giá');
    }

    if (!review || !selectedHotel || !selectedRoom || !checkInDate || !checkOutDate) {
      return toast.error('Vui lòng nhập đầy đủ thông tin');
    }

    // Lấy thông tin hotel để làm address
    const selectedHotelData = hotels.find(h => h._id === selectedHotel);
    const address = selectedHotelData ? selectedHotelData.city : '';

    const newData = {
      name: user.username,
      image: user.image || 'https://i.pravatar.cc/150?img=56',
      address, // Tự động lấy từ hotel
      review,
      rating,
      hotelId: selectedHotel,
      roomId: selectedRoom,
      checkInDate,
      checkOutDate
    };

    try {
      const token = await getToken();

      const res = await axios.post('/api/testimonials', newData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Gửi chia sẻ thành công!');
      if (onSuccess) onSuccess(res.data);
      setReview('');
      setRating(5);
      setSelectedHotel('');
      setSelectedRoom('');
      setCheckInDate('');
      setCheckOutDate('');
    } catch (err) {
      toast.error('Lỗi khi gửi đánh giá');
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="p-6">
        <h3 className="text-xl font-semibold font-playfair text-gray-800 mb-4 text-center">
          Đánh giá trải nghiệm của bạn
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={user.image || 'https://i.pravatar.cc/150?img=56'}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-gray-700 font-medium">{user.username}</span>
          </div>

          {/* Chọn khách sạn */}
          <div>
            <label className="text-gray-700 font-medium block mb-1">
              Chọn khách sạn đã ở:
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
            >
              <option value="">-- Chọn khách sạn --</option>
              {hotels.map((hotel) => (
                <option key={hotel._id} value={hotel._id}>
                  {hotel.name} - {hotel.city}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn loại phòng */}
          {selectedHotel && (
            <div>
              <label className="text-gray-700 font-medium block mb-1">
                Chọn loại phòng:
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                <option value="">-- Chọn loại phòng --</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.roomType} - ${room.pricePerNight}/đêm
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Ngày nhận và trả phòng - 2 cột */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-700 font-medium block mb-1">
                Ngày nhận phòng:
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-gray-700 font-medium block mb-1">
                Ngày trả phòng:
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>
          </div>

          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="Chia sẻ trải nghiệm của bạn..."
            rows={3}
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />

          <div>
            <label className="text-gray-700 font-medium block mb-1">
              Đánh giá của bạn:
            </label>
            <StarInput rating={rating} onChange={setRating} />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dull text-white font-semibold py-2.5 rounded-lg transition duration-200 mt-4"
          >
            🎉 Gửi đánh giá
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShareExperienceForm;
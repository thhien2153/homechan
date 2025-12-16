import React, { useEffect, useState } from 'react'
import HotelCard from './HotelCard'
import Title from './Title'
import { useAppContext } from '../conext/AppContext';

const RecommendedHotels = () => {
    const { rooms, searchedCities } = useAppContext();
    const [recommended, setRecommended] = useState([]);

    const filterHotels = () => {
        const filteredHotels = rooms
            .slice()
            .filter(room => room?.hotel?.city && searchedCities.includes(room.hotel.city));
        setRecommended(filteredHotels);
    };

    useEffect(() => {
        filterHotels();
    }, [rooms, searchedCities]);

    return (
        <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20'>
            <Title
                title='Gợi ý dành riêng cho bạn'
                subTitle='Khám phá những chỗ nghỉ hợp gu — từ góc nhỏ ấm cúng đến nơi nghỉ dưỡng sang xịn. Chọn lọc kỹ lưỡng, gợi ý thông minh, chill đúng chất bạn cần.'
            />

            {recommended.length > 0 ? (
                <div className='flex flex-wrap items-center justify-center gap-6 mt-20'>
                    {recommended.slice(0, 4).map((room, index) => (
                        <HotelCard key={room._id} room={room} index={index} />
                    ))}
                </div>
            ) : (
                <p className='mt-10 text-gray-500'>
                    Không tìm thấy khách sạn phù hợp
                </p>
            )}
        </div>
    );
};

export default RecommendedHotels;

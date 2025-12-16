import React from 'react';
import Title from './Title';
import { assets, exclusiveOffers } from '../assets/assets';

const ExclusiveOffers = () => {
  return (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32 pt-20 pb-30 font-vietnam'>
      <div className='flex flex-col md:flex-row items-center justify-between w-full'>
        <Title
          align='left'
          title='Ưu đãi độc quyền – Đẳng cấp thượng lưu'
          subTitle='Nâng tầm trải nghiệm với các gói nghỉ dưỡng riêng biệt, đến từ những điểm đến sang trọng bậc nhất thế giới. Vì hành trình của bạn xứng đáng với sự tuyệt vời.'
        />
        <button className='group flex items-center gap-2 font-medium cursor-pointer max-md:mt-12'>
          Xem tất cả ưu đãi
          <img src={assets.arrowIcon} alt="arrow-icon" className='group-hover:translate-x-1 transition-all' />
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 w-full'>
        {exclusiveOffers.map((item) => (
          <div
            key={item._id}
            className='group relative flex flex-col items-start justify-between gap-1 pt-12 md:pt-18 px-4 rounded-xl text-white bg-no-repeat bg-cover bg-center min-h-[280px]'
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <p className='px-3 py-1 absolute top-4 left-4 text-xs bg-white text-gray-800 font-medium rounded-full'>
              Giảm {item.priceOff}%
            </p>
            <div>
              <p className='text-xl font-semibold font-playfair'>{item.title}</p>
              <p className='text-sm mt-1'>{item.description}</p>
              <p className='text-xs text-white/70 mt-3'>Hạn sử dụng: {item.expiryDate}</p>
            </div>
            <button className='flex items-center gap-2 font-medium cursor-pointer mt-4 mb-5'>
              Xem ưu đãi
              <img
                className='invert group-hover:translate-x-1 transition-all'
                src={assets.arrowIcon}
                alt="arrow-icon"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExclusiveOffers;

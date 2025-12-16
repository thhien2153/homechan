import React from 'react'
import { assets } from '../assets/assets'
import Title from './Title'

const NewsLetter = () => {
  return (
    <div className="flex flex-col items-center max-w-5xl lg:w-full rounded-2xl px-4 py-12 md:py-16 mx-2 lg:mx-auto my-30 bg-gray-900 text-white">
      
      <Title 
        title="Luôn tràn đầy cảm hứng ✨" 
        subTitle="Đăng ký nhận bản tin để không bỏ lỡ điểm đến mới, ưu đãi độc quyền và ý tưởng du lịch tuyệt vời dành riêng cho bạn!" 
      />

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6">
        <input 
          type="text" 
          className="bg-white/10 px-4 py-2.5 border border-white/20 rounded outline-none max-w-66 w-full" 
          placeholder="Nhập email của bạn" 
        />
        <button className="flex items-center justify-center gap-2 group bg-black px-4 md:px-7 py-2.5 rounded active:scale-95 transition-all whitespace-nowrap">
          Đăng ký
          <img 
            src={assets.arrowIcon} 
            alt="arrow-icon" 
            className="w-3.5 invert group-hover:translate-x-1 transition-all" 
          />
        </button>
      </div>

      <p className="text-gray-500 mt-6 text-xs text-center">
        Bằng cách đăng ký, bạn đồng ý với <a href="#" className="underline">Chính sách bảo mật</a> của chúng tôi và chấp nhận nhận thông báo mới nhất qua email.
      </p>
    </div>
  )
}

export default NewsLetter

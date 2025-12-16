import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className="bg-[#F6F9FC] text-gray-600 px-6 md:px-12 lg:px-20 pt-12">
      <div className="flex flex-wrap gap-y-10 justify-between">
        {/* Logo + Mô tả + MXH */}
        <div className="w-full md:w-1/2 lg:w-1/4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">⭐ HOMECHAN</h2>
          </div>
          <p className="text-sm leading-relaxed">
            Đồng hành cùng bạn khám phá những điểm dừng chân lý tưởng từ khách sạn tinh tế đến biệt thự sang trọng và thiên đường nghỉ dưỡng riêng tư.
          </p>
          <div className="flex gap-4 mt-5">
            <img src={assets.instagramIcon} alt="Instagram" className="w-5 hover:opacity-70" />
            <img src={assets.facebookIcon} alt="Facebook" className="w-5 hover:opacity-70" />
            <img src={assets.twitterIcon} alt="Twitter" className="w-5 hover:opacity-70" />
            <img src={assets.linkendinIcon} alt="LinkedIn" className="w-5 hover:opacity-70" />
          </div>
        </div>

        {/* Về chúng tôi */}
        <div>
          <p className="text-lg font-semibold text-gray-800 mb-4 font-playfair">VỀ CHÚNG TÔI</p>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-black">Giới thiệu</a></li>
            <li><a href="#" className="hover:text-black">Tuyển dụng</a></li>
            <li><a href="#" className="hover:text-black">Truyền thông</a></li>
            <li><a href="#" className="hover:text-black">Blog</a></li>
            <li><a href="#" className="hover:text-black">Đối tác</a></li>
          </ul>
        </div>

        {/* Hỗ trợ */}
        <div>
          <p className="text-lg font-semibold text-gray-800 mb-4 font-playfair">HỖ TRỢ</p>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-black">Trung tâm trợ giúp</a></li>
            <li><a href="#" className="hover:text-black">Thông tin an toàn</a></li>
            <li><a href="#" className="hover:text-black">Chính sách hủy</a></li>
            <li><a href="#" className="hover:text-black">Liên hệ</a></li>
            <li><a href="#" className="hover:text-black">Trợ năng</a></li>
          </ul>
        </div>

        {/* Đăng ký nhận tin */}
        <div className="w-full sm:max-w-xs">
          <p className="text-lg font-semibold text-gray-800 mb-4 font-playfair">ĐĂNG KÝ NHẬN TIN</p>
          <p className="text-sm mb-4">Đăng ký để nhận cảm hứng du lịch và ưu đãi độc quyền mỗi tuần.</p>
          <form className="flex items-center">
            <input
              type="email"
              placeholder="Email của bạn"
              className="flex-1 h-10 px-4 text-sm bg-white border border-gray-300 rounded-l-full outline-none"
            />
            <button className="bg-black text-white h-10 w-10 flex items-center justify-center rounded-r-full hover:bg-gray-800 transition">
              <img src={assets.arrowIcon} alt="Submit" className="w-3.5 invert" />
            </button>
          </form>
        </div>
      </div>

      {/* Đường kẻ */}
      <hr className="my-8 border-gray-300" />

      {/* Copyright + liên kết cuối */}
      <div className="flex flex-col md:flex-row justify-between items-center text-sm pb-6 gap-3">
        <p>© {new Date().getFullYear()} Thanh Hiền & Minh Trâm. Mọi quyền được bảo lưu.</p>
        <ul className="flex gap-4">
          <li><a href="#" className="hover:text-black">Chính sách riêng tư</a></li>
          <li><a href="#" className="hover:text-black">Điều khoản</a></li>
          <li><a href="#" className="hover:text-black">Sơ đồ website</a></li>
        </ul>
      </div>
    </footer>
  )
}

export default Footer
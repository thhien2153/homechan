import React from 'react'
import { motion } from 'framer-motion'

const aboutItems = [
  {
    icon: '🌱',
    title: 'Sứ mệnh',
    description: 'Mang đến trải nghiệm lưu trú hoàn hảo, cá nhân hóa dịch vụ và đồng hành cùng bạn trên mọi hành trình.'
  },
  {
    icon: '🚀',
    title: 'Tầm nhìn',
    description: 'Trở thành nền tảng đặt phòng khách sạn được yêu thích nhất tại Việt Nam và khu vực Đông Nam Á.'
  },
  {
    icon: '🧑‍💼',
    title: 'Đội ngũ',
    description: 'Gồm những người trẻ sáng tạo, giàu nhiệt huyết trong công nghệ, thiết kế và dịch vụ khách hàng.'
  },
  {
    icon: '💡',
    title: 'Cam kết',
    description: 'Hệ thống minh bạch, dễ sử dụng, hỗ trợ nhanh chóng 24/7 và luôn lắng nghe người dùng.'
  }
]

const About = () => {
  return (
    <div className="relative px-6 md:px-16 lg:px-24 py-24 overflow-hidden bg-white">

      {/* Background hình du lịch mờ */}
      <div className="absolute inset-0 bg-[url('https://source.unsplash.com/1600x900/?resort,beach')] bg-cover bg-center opacity-10 blur-sm z-0" />

      {/* Nội dung */}
      <div className="relative z-10 text-gray-800">
        <h2 className="text-3xl font-bold text-center font-playfair mb-4">Về HOMECHAN</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          HOMECHAN là nền tảng đặt phòng khách sạn mang đến trải nghiệm du lịch dễ dàng, đáng tin cậy và đầy cảm xúc.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          {aboutItems.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg hover:shadow-xl transition duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <h3 className="text-xl font-semibold mb-2">{item.icon} {item.title}</h3>
              <p className="text-gray-700">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default About
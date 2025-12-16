import React from 'react'
import { motion } from 'framer-motion'
import Title from './Title'

const WhyChooseUs = () => {
    const features = [
        {
            icon: "💰",
            title: "Giá cạnh tranh",
            description: "So sánh giá từ hàng nghìn khách sạn để đảm bảo bạn luôn có được mức giá tốt nhất cho chuyến đi của mình."
        },
        {
            icon: "🔒",
            title: "Đặt phòng an toàn",
            description: "Hệ thống thanh toán được mã hóa SSL và bảo mật thông tin cá nhân 100% để bạn yên tâm đặt phòng."
        },
        {
            icon: "⚡",
            title: "Trải nghiệm mượt mà",
            description: "Giao diện thân thiện, quy trình đặt phòng nhanh chóng chỉ trong vài bước đơn giản và thuận tiện."
        }
    ]

    return (
        <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 py-20 bg-white'>
            <Title
                title='Tại sao chọn HOMECHAN?'
                subTitle='Chúng tôi cam kết mang đến trải nghiệm đặt phòng tốt nhất với giá cả hợp lý, bảo mật cao và dịch vụ chuyên nghiệp.'
            />

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-6xl'>
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        className='bg-slate-50 p-8 rounded-2xl text-center hover:shadow-lg transition-all duration-300 group'
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5, scale: 1.02 }}
                    >
                        <div className='text-5xl mb-4 group-hover:scale-110 transition-transform duration-300'>
                            {feature.icon}
                        </div>
                        <h3 className='text-xl font-semibold text-gray-800 mb-4 font-playfair'>
                            {feature.title}
                        </h3>
                        <p className='text-gray-600 text-sm leading-relaxed'>
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default WhyChooseUs
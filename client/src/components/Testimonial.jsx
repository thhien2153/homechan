import React, { useState, useEffect } from 'react'
import Title from './Title'
import StarRating from './StarRating'
import ShareExperienceForm from './ShareExperienceForm'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Testimonial = () => {
  const [testimonialList, setTestimonialList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get('/api/testimonials')
        setTestimonialList(res.data)
      } catch (err) {
        console.error('Lỗi khi lấy testimonials:', err)
      }
    }
    fetchTestimonials()
  }, [])

  const handleAddTestimonial = (newItem) => {
    setTestimonialList((prev) => [newItem, ...prev])
    setShowForm(false)
  }

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const displayedTestimonials = showAll
    ? testimonialList
    : testimonialList.slice(0, 3)

  return (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 pt-20 pb-30'>
      <Title
        title="Khách du lịch nói gì về chúng tôi"
        subTitle="Chúng tôi không chỉ giúp bạn đặt phòng – chúng tôi mang đến những trải nghiệm. Cùng nghe chia sẻ từ người dùng thật nhé!"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-20 w-full">
        <AnimatePresence>
          {displayedTestimonials.map((testimonial) => (
            <motion.div
              key={testimonial._id}
              className="bg-white p-6 rounded-xl shadow flex flex-col justify-between min-h-[280px] w-full cursor-pointer hover:shadow-lg transition-shadow"
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate('/trai-nghiem')}
            >
              {/* Header với thông tin khách sạn */}
              <div className="border-b pb-4 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🏨</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-800">
                      {testimonial.hotelId?.name || 'Khách sạn'}
                    </h4>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {testimonial.roomId?.roomType || 'Phòng'}
                      </span>
                      <span>•</span>
                      <span>📍 {testimonial.hotelId?.city || testimonial.address}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      📅 Lưu trú: {formatDate(testimonial.checkInDate)} - {formatDate(testimonial.checkOutDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông tin người đánh giá */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  src={testimonial.image || 'https://i.pravatar.cc/150?img=56'}
                  alt={testimonial.name}
                />
                <div>
                  <p className="font-playfair text-lg font-semibold">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">Đánh giá ngày {formatDate(testimonial.createdAt)}</p>
                </div>
              </div>

              {/* Đánh giá sao */}
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={testimonial.rating} />
                <span className="text-sm text-gray-600 font-medium">
                  {testimonial.rating === 5 ? 'Tuyệt vời' :
                    testimonial.rating >= 4 ? 'Rất tốt' :
                      testimonial.rating >= 3 ? 'Tốt' : 'Bình thường'}
                </span>
              </div>

              {/* Đánh giá */}
              <p className="text-gray-700 italic">"{testimonial.review}"</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Nút xem thêm / ẩn bớt */}
      {testimonialList.length > 3 && (
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="mt-6 px-5 py-2 border border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-full text-base shadow-sm transition duration-300"
        >
          {showAll ? 'Ẩn bớt' : 'Xem thêm đánh giá'}
        </button>
      )}

      {/* Nút mở modal */}
      <button
        onClick={() => setShowForm(true)}
        className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-lg font-semibold shadow-md transition duration-300 flex items-center gap-2"
      >
        <span>✍️</span>
        <span>Chia sẻ trải nghiệm</span>
      </button>

      {/* Modal chia sẻ */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-xl mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ShareExperienceForm onSuccess={handleAddTestimonial} />
              <button
                onClick={() => setShowForm(false)}
                className="absolute -top-4 -right-4 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full text-xl font-bold shadow-lg"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>

          
        )}
      </AnimatePresence>
    </div>
  )
}

export default Testimonial
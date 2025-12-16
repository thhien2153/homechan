import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Title from '../components/Title'
import StarRating from '../components/StarRating'
import ShareExperienceForm from './ShareExperienceForm'
import { AnimatePresence, motion } from 'framer-motion'

const Experience = () => {
  const [experiences, setExperiences] = useState([])
  const [filtered, setFiltered] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')

  const itemsPerPage = 3
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/testimonials')
        setExperiences(res.data)
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    let data = [...experiences]
    if (filter === '4+') data = data.filter((item) => item.rating >= 4)
    if (filter === '5') data = data.filter((item) => item.rating === 5)
    setFiltered(data)
    setCurrentPage(1)
  }, [experiences, filter])

  const handleAdd = (newExp) => {
    setExperiences((prev) => [newExp, ...prev])
    setShowForm(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const currentData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="px-6 md:px-16 lg:px-24 py-20 bg-white">
      <Title
        title="Trải nghiệm của khách du lịch"
        subTitle="Chúng tôi không chỉ giúp bạn đặt phòng – chúng tôi mang đến những trải nghiệm. Cùng nghe chia sẻ từ người dùng thật nhé!"
      />

      {/* Bộ lọc sao */}
      <div className="flex justify-center mt-6 gap-3 flex-wrap">
        {['all', '4+', '5'].map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 rounded-full border ${filter === value
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-600'
              } transition`}
          >
            {value === 'all' ? 'Tất cả' : `${value} sao`}
          </button>
        ))}
      </div>

      {/* Danh sách trải nghiệm */}
      <div className="space-y-8 mt-12">
        <AnimatePresence>
          {currentData.map((exp) => (
            <motion.div
              key={exp._id}
              className="bg-slate-50 rounded-3xl p-8 shadow-md hover:shadow-lg transition"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Header với thông tin khách sạn */}
              <div className="border-b pb-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏨</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-2xl text-gray-800 font-playfair">
                      {exp.hotelId?.name || 'Khách sạn'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {exp.roomId?.roomType || 'Phòng'}
                      </span>
                      <span>•</span>
                      <span>📍 {exp.hotelId?.city || exp.address}</span>
                    </div>
                    <p className="text-gray-500 mt-2">
                      📅 Lưu trú: {formatDate(exp.checkInDate)} - {formatDate(exp.checkOutDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={exp.image || 'https://i.pravatar.cc/150?img=56'}
                  alt={exp.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
                />
                <div className="flex-1">
                  <div className="flex justify-between flex-wrap">
                    <div>
                      <h4 className="text-xl font-semibold font-playfair">{exp.name}</h4>
                      <p className="text-gray-500">Đánh giá ngày {formatDate(exp.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={exp.rating} />
                      <span className="text-sm text-gray-600 font-medium">
                        {exp.rating === 5 ? 'Tuyệt vời' :
                          exp.rating >= 4 ? 'Rất tốt' :
                            exp.rating >= 3 ? 'Tốt' : 'Bình thường'}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700 text-justify leading-relaxed text-base">
                    "{exp.review}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            «
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-9 h-9 rounded-full ${currentPage === i + 1
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-gray-100'
                }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            »
          </button>
        </div>
      )}

      {/* Nút chia sẻ trải nghiệm */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full text-lg font-semibold transition"
        >
          ✍️ Chia sẻ trải nghiệm
        </button>
      </div>

      {/* Modal form */}
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
              <ShareExperienceForm onSuccess={handleAdd} />
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

export default Experience
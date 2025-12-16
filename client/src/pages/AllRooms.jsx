import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../conext/AppContext'
import { motion } from 'framer-motion'

const AllRooms = () => {
  const [searchParams] = useSearchParams()
  const { axios, navigate } = useAppContext()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)

  // 👉 Lấy query — xử lý null, undefined
  const destination = searchParams.get('destination') || ''
  const checkInRaw = searchParams.get('checkIn')
  const checkOutRaw = searchParams.get('checkOut')
  const roomsRaw = searchParams.get('rooms')
  const adultsRaw = searchParams.get('adults')
  const childrenRaw = searchParams.get('children')

  // 👉 CHUYỂN "null" → ""
  const checkIn = checkInRaw === 'null' ? '' : checkInRaw
  const checkOut = checkOutRaw === 'null' ? '' : checkOutRaw
  const rooms = roomsRaw === 'null' ? '' : roomsRaw
  const adults = adultsRaw === 'null' ? '' : adultsRaw
  const children = childrenRaw === 'null' ? '' : childrenRaw

  useEffect(() => {
    const fetch = async () => {
      try {
        // 👉 Tạo URL động, không gửi param rỗng xuống backend
        const params = new URLSearchParams()
        if (destination) params.append('keyword', destination)
        if (checkIn) params.append('checkIn', checkIn)
        if (checkOut) params.append('checkOut', checkOut)
        if (rooms) params.append('rooms', rooms)
        if (adults) params.append('adults', adults)
        if (children) params.append('children', children)

        const { data } = await axios.get(`/api/hotels/search?${params.toString()}`)

        setHotels(data || [])
      } catch (err) {
        console.error('Lỗi lấy danh sách khách sạn', err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [axios, destination, checkIn, checkOut, rooms, adults, children])

  if (loading) return <div className="p-6">Đang tải...</div>

  return (
    <div className="pt-28 px-4 md:px-16 lg:px-24 xl:px-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <h1 className="font-playfair text-[32px] md:text-[40px] font-semibold">Danh sách khách sạn</h1>
        <p className="text-sm md:text-base text-gray-500 mt-2 max-w-[700px]">
          Chọn khách sạn để xem chi tiết và các phòng.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((h) => (
          <div
            key={h._id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg cursor-pointer"
            onClick={() => navigate(`/hotels/${h._id}`)}
          >
            <div className="h-44 w-full overflow-hidden rounded mb-3">
              <img
                src={h.images?.[0] || '/fallback.jpg'}
                alt={h.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold">{h.name}</h3>
            <p className="text-sm text-gray-500">{h.city}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AllRooms
import React, { useEffect, useState } from 'react'
import { useAppContext } from '../conext/AppContext'
import { Link } from 'react-router-dom'

const HotelsList = () => {
  const { axios } = useAppContext()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get('/api/hotels')
        setHotels(data || [])
      } catch (err) {
        console.error('Error fetching hotels', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [axios])

  if (loading) return <div className="p-6">Đang tải...</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Danh sách khách sạn</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map(h => (
          <Link key={h._id} to={`/hotels/${h._id}`} className="block bg-white rounded shadow p-4 hover:shadow-lg">
            <div className="h-44 w-full overflow-hidden rounded mb-3">
              <img src={h.images?.[0] || '/fallback.jpg'} alt={h.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-semibold">{h.name}</h3>
            <p className="text-sm text-gray-500">{h.city}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HotelsList

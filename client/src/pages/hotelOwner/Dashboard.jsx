import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/Title'
import { useAppContext } from '../../conext/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BookingStats from './BookingStats'

const Dashboard = () => {
  const { user, getToken, toast, axios } = useAppContext()
  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    totalBookings: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showBookingStats, setShowBookingStats] = useState(false)

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/bookings/hotel', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data.success) {
        //  ĐẢM BẢO CÓ GIÁ TRỊ MẶC ĐỊNH
        setDashboardData({
          bookings: data.dashboardData?.bookings || [],
          totalBookings: data.dashboardData?.totalBookings || 0,
          totalRevenue: data.dashboardData?.totalRevenue || 0,
        })
      } else {
        toast.error(data.message)
        //  VẪN SET GIÁ TRỊ MẶC ĐỊNH KHI LỖI
        setDashboardData({
          bookings: [],
          totalBookings: 0,
          totalRevenue: 0,
        })
      }
    } catch (error) {
      console.error('Dashboard error:', error)
      toast.error('Lỗi khi tải dữ liệu dashboard')
      //  SET GIÁ TRỊ MẶC ĐỊNH KHI CATCH ERROR
      setDashboardData({
        bookings: [],
        totalBookings: 0,
        totalRevenue: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchDashboardData()
  }, [user])

  //  SỬA STATS VỚI SAFE NAVIGATION
  const stats = [
    {
      title: 'Lượt đặt phòng',
      icon: assets.totalBookingIcon,
      value: dashboardData?.totalBookings || 0,
      color: 'border-blue-500 text-blue-800',
    },
    {
      title: 'Doanh thu',
      icon: assets.totalRevenueIcon,
      value: (dashboardData?.totalRevenue || 0).toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }),
      color: 'border-green-500 text-green-800',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-12 px-6 md:px-14 bg-gradient-to-b from-blue-50 to-white min-h-screen pb-32"
    >
      <Title
        align="left"
        font="outfit"
        title="📊 Dashboard Quản Lý"
        subTitle="Tổng quan hoạt động khách sạn và thống kê chi tiết"
      />

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 my-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.2 }}
            className={`bg-white shadow-xl rounded-2xl p-6 border-t-4 hover:scale-[1.02] transition-transform cursor-pointer ${stat.color}`}
            onClick={() => stat.title === 'Lượt đặt phòng' && setShowBookingStats(!showBookingStats)}
          >
            <div className="flex items-center gap-4">
              <img src={stat.icon} alt="icon" className="h-12" />
              <div>
                <p className="text-lg font-semibold">{stat.title}</p>
                <p className="text-gray-600 text-2xl font-bold">{loading ? '...' : stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}


        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-6 shadow-xl text-white hover:scale-[1.02] transition-transform"
        >
          <p className="text-xl font-bold mb-2">Chào, {user?.username || 'bạn'} 👋</p>
          <p className="text-sm">Chúc bạn có một ngày làm việc hiệu quả!</p>
        </motion.div>
      </div>

      {/* Booking Stats */}
      {showBookingStats && <BookingStats />}

    </motion.div>
  )
}

export default Dashboard
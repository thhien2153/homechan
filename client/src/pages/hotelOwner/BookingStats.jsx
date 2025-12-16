import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../conext/AppContext'
import Title from '../../components/Title'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const BookingStats = () => {
  const { user, getToken, toast, axios } = useAppContext()
  const [stats, setStats] = useState([])
  const [revenueStats, setRevenueStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month') // 'day' or 'month'
  const [chartMode, setChartMode] = useState('booking') // 'booking' or 'revenue'

  const fetchStats = async (selectedPeriod) => {
    try {
      setLoading(true)
      const [bookingData, revenueData] = await Promise.all([
        axios.get(`/api/bookings/stats?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }),
        axios.get(`/api/bookings/revenue-stats?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${await getToken()}` },
        })
      ])

      if (bookingData.data.success) {
        setStats(bookingData.data.stats)
      } else {
        toast.error(bookingData.data.message)
        setStats([])
      }

      if (revenueData.data.success) {
        setRevenueStats(revenueData.data.stats)
      } else {
        setRevenueStats([])
      }
    } catch (error) {
      console.error('Stats error:', error)
      toast.error('Lỗi khi tải dữ liệu thống kê')
      setStats([])
      setRevenueStats([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchStats(period)
  }, [user, period])

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-6 md:px-14"
    >
      <Title
        align="left"
        font="outfit"
        title="📊 Thống Kê Đặt Phòng"
        subTitle="Xem xu hướng đặt phòng theo ngày và tháng"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng lượt đặt phòng</p>
              <p className="text-2xl font-bold text-blue-600">
                {loading ? '...' : stats.reduce((sum, item) => sum + item.bookings, 0)}
              </p>
            </div>
            <div className="text-blue-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div
          className={`bg-white shadow-lg rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl ${
            chartMode === 'revenue' ? 'ring-2 ring-green-500' : ''
          }`}
          onClick={() => setChartMode(chartMode === 'booking' ? 'revenue' : 'booking')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-green-600">
                {loading ? '...' : `${revenueStats.reduce((sum, item) => sum + item.revenue, 0).toLocaleString('vi-VN')} VND`}
              </p>
            </div>
            <div className="text-green-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-4 my-8">
        <button
          onClick={() => handlePeriodChange('day')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            period === 'day'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Theo Ngày (7 ngày gần nhất)
        </button>
        <button
          onClick={() => handlePeriodChange('month')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            period === 'month'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Theo Tháng (12 tháng gần nhất)
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">
          Xu Hướng {chartMode === 'booking' ? 'Đặt Phòng' : 'Doanh Thu'} {period === 'day' ? 'Theo Ngày' : 'Theo Tháng'}
        </h3>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        ) : (chartMode === 'booking' ? stats : revenueStats).length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Không có dữ liệu</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartMode === 'booking' ? stats : revenueStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                angle={period === 'month' ? -45 : 0}
                textAnchor={period === 'month' ? 'end' : 'middle'}
                height={period === 'month' ? 80 : 60}
              />
              <YAxis domain={chartMode === 'revenue' ? [0, 'dataMax * 5'] : [0, 'dataMax']} tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value) => [
                  chartMode === 'booking' ? value : `${value.toLocaleString('vi-VN')} VND`,
                  chartMode === 'booking' ? 'Số lượt đặt' : 'Doanh thu'
                ]}
                labelFormatter={(label) => `Thời gian: ${label}`}
              />
              <Bar
                dataKey={chartMode === 'booking' ? 'bookings' : 'revenue'}
                fill={chartMode === 'booking' ? '#3b82f6' : '#10b981'}
                barSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  )
}

export default BookingStats

import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/Title'
import { useAppContext } from '../../conext/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import HotelBookingChart from './HotelBookingChart'

const Dashboard = () => {
    const { user } = useAppContext()
    const navigate = useNavigate()
    const [showHotelChart, setShowHotelChart] = useState(false)

    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        totalHotels: 0,
        totalBookings: 0,
        totalRevenue: 0,
    })
    const [loading, setLoading] = useState(true)


    const fetchDashboardData = async () => {
        try {
            setLoading(true)


            const token = sessionStorage.getItem('token') || localStorage.getItem('token');

            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await fetch('/api/admin/dashboard', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setDashboardData(result.data);
            } else {
                console.error('Error fetching dashboard data:', await response.json());

                setDashboardData({
                    totalUsers: 0,
                    totalHotels: 0,
                    totalBookings: 0,
                    totalRevenue: 0,
                });
            }
        } catch (error) {
            console.error('Error fetching admin dashboard:', error)

            setDashboardData({
                totalUsers: 0,
                totalHotels: 0,
                totalBookings: 0,
                totalRevenue: 0,
            });
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) fetchDashboardData()
    }, [user])

    const stats = [
        {
            title: 'Người dùng',
            icon: '👥',
            value: dashboardData.totalUsers,
            color: 'border-blue-500 text-blue-800',
        },
        {
            title: 'Khách sạn',
            icon: '🏨',
            value: dashboardData.totalHotels,
            color: 'border-purple-500 text-purple-800',
        },
        {
            title: 'Lượt đặt phòng',
            icon: '📊',
            value: dashboardData.totalBookings,
            color: 'border-orange-500 text-orange-800',
        }
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
                title="📊 Bảng thống kê khách sạn"
                subTitle="Xem nhanh số lượng đặt phòng, doanh thu và hoạt động gần đây của ban."
            />

            {/* Stats cards - chỉ còn 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 my-12">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className={`bg-white shadow-xl rounded-2xl p-6 border-t-4 hover:scale-[1.02] transition-transform ${stat.color} ${stat.title === 'Khách sạn' ? 'cursor-pointer' : ''}`}
                        onClick={stat.title === 'Khách sạn' ? () => setShowHotelChart(true) : undefined}
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">{stat.icon}</div>
                            <div>
                                <p className="text-lg font-semibold">{stat.title}</p>
                                <p className="text-gray-600 text-2xl font-bold">{loading ? '...' : stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Greeting box */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-6 shadow-xl text-white hover:scale-[1.02] transition-transform"
                >
                    <p className="text-xl font-bold mb-2">Chào, {user?.username || 'Admin'} 👋</p>
                    <p className="text-sm">Chúc bạn có một ngày làm việc hiệu quả!</p>
                </motion.div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="bg-white rounded-2xl p-6 shadow-xl border-l-4 border-blue-500 hover:scale-[1.02] transition-transform cursor-pointer"
                    onClick={() => navigate('/admin/bookings')}
                >
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">📅</div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Quản lý Đặt Phòng</h3>
                            <p className="text-gray-600 text-sm">Xem và quản lý tất cả đặt phòng</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    className="bg-white rounded-2xl p-6 shadow-xl border-l-4 border-green-500 hover:scale-[1.02] transition-transform cursor-pointer"
                    onClick={() => navigate('/admin/manage-users')}
                >
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">👥</div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Quản lý User</h3>
                            <p className="text-gray-600 text-sm">Quản lý người dùng hệ thống</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    className="bg-white rounded-2xl p-6 shadow-xl border-l-4 border-purple-500 hover:scale-[1.02] transition-transform cursor-pointer"
                    onClick={() => navigate('/admin/manage-hotels')}
                >
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">🏨</div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Quản lý Hotel</h3>
                            <p className="text-gray-600 text-sm">Quản lý khách sạn trong hệ thống</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Chart Modal */}
            <HotelBookingChart
                isOpen={showHotelChart}
                onClose={() => setShowHotelChart(false)}
            />
        </motion.div>
    )
}

export default Dashboard
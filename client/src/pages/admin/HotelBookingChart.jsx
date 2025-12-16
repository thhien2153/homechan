import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HotelBookingChart = ({ isOpen, onClose }) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchHotelStats = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');

            const response = await fetch('/api/admin/hotel-booking-stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setChartData(result.data);
            }
        } catch (error) {
            console.error('Error fetching hotel stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHotelStats();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const maxBookings = Math.max(...chartData.map(item => item.totalBookings), 1);
    const totalBookings = chartData.reduce((sum, item) => sum + item.totalBookings, 0);


    const pieData = chartData.map((hotel, index) => {
        const percentage = ((hotel.totalBookings / totalBookings) * 100).toFixed(1);
        const colors = [
            '#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
        ];
        return {
            ...hotel,
            percentage: parseFloat(percentage),
            color: colors[index % colors.length]
        };
    });


    const createPieChart = () => {
        let cumulativePercentage = 0;

        return pieData.map((segment, index) => {
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + segment.percentage) / 100) * 360;
            cumulativePercentage += segment.percentage;

            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
            const endAngleRad = (endAngle - 90) * (Math.PI / 180);

            const largeArcFlag = segment.percentage > 50 ? 1 : 0;

            const x1 = 100 + 80 * Math.cos(startAngleRad);
            const y1 = 100 + 80 * Math.sin(startAngleRad);
            const x2 = 100 + 80 * Math.cos(endAngleRad);
            const y2 = 100 + 80 * Math.sin(endAngleRad);

            const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');

            return (
                <motion.path
                    key={index}
                    d={pathData}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                />
            );
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-2xl w-[90%] max-w-6xl max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            📊 Thống kê booking theo khách sạn
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📋</div>
                            <p className="text-gray-600">Chưa có dữ liệu booking</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Thống kê tổng quan */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-blue-800">Tổng khách sạn có booking</h3>
                                    <p className="text-2xl font-bold text-blue-600">{chartData.length}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-green-800">Tổng số booking</h3>
                                    <p className="text-2xl font-bold text-green-600">{totalBookings}</p>
                                </div>
                            </div>

                            {/* Biểu đồ tròn + Danh sách */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Biểu đồ tròn */}
                                <div className="flex flex-col items-center">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Tỷ lệ booking theo khách sạn</h3>
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className="relative"
                                    >
                                        <svg width="200" height="200" className="drop-shadow-lg">
                                            {createPieChart()}
                                        </svg>

                                        {/* Legend */}
                                        <div className="mt-4 space-y-2">
                                            {pieData.slice(0, 5).map((segment, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: segment.color }}
                                                    ></div>
                                                    <span className="text-gray-600">
                                                        {segment.hotelName.length > 15
                                                            ? segment.hotelName.substring(0, 15) + '...'
                                                            : segment.hotelName
                                                        } ({segment.percentage}%)
                                                    </span>
                                                </div>
                                            ))}
                                            {pieData.length > 5 && (
                                                <div className="text-xs text-gray-500">
                                                    +{pieData.length - 5} khách sạn khác
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Danh sách chi tiết */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Chi tiết theo khách sạn</h3>
                                    <div className="max-h-96 overflow-y-auto space-y-3">
                                        {chartData.map((hotel, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-gray-50 p-4 rounded-lg"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: pieData[index]?.color }}
                                                        ></div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">{hotel.hotelName}</h4>
                                                            <p className="text-sm text-gray-600">📍 {hotel.hotelAddress}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-blue-600">{hotel.totalBookings} booking</p>
                                                        <p className="text-sm text-gray-600">
                                                            {hotel.totalRevenue?.toLocaleString('vi-VN')} ₫
                                                        </p>
                                                        <p className="text-xs text-purple-600 font-medium">
                                                            {pieData[index]?.percentage}% tổng booking
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Thanh progress */}
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(hotel.totalBookings / maxBookings) * 100}%` }}
                                                        transition={{ duration: 0.8, delay: index * 0.1 }}
                                                        className="h-2 rounded-full"
                                                        style={{ backgroundColor: pieData[index]?.color }}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default HotelBookingChart;
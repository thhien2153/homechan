// pages/admin/AllBookings.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Title from '../../components/Title';
import Swal from 'sweetalert2';

const AllBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Fetch bookings từ API
    const fetchBookings = async (page = 1, searchTerm = '', status = 'all') => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');

            if (!token) {
                console.error('No token found');
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi xác thực',
                    text: 'Vui lòng đăng nhập lại!'
                });
                return;
            }

            const response = await fetch(`/api/bookings/admin?page=${page}&search=${searchTerm}&status=${status}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBookings(data.bookings);
                setCurrentPage(data.currentPage);
                setTotalPages(data.totalPages);
                setTotal(data.total);
            } else {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi tải dữ liệu',
                    text: errorData.message
                });
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi kết nối',
                text: 'Không thể kết nối đến server!'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings(currentPage, search, statusFilter);
    }, [currentPage, search, statusFilter]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (e) => {
        const value = e.target.value;
        setStatusFilter(value);
        setCurrentPage(1);
    };

    // Pagination
    const goToPage = (page) => {
        setCurrentPage(page);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Get status display
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'confirmed':
                return { text: 'Hoàn thành', class: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' };
            case 'pending':
                return { text: 'Đang xử lý', class: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' };
            case 'cancelled':
                return { text: 'Đã hủy', class: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800' };
            default:
                return { text: 'Khác', class: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800' };
        }
    };

    // Loading state
    if (loading && currentPage === 1) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center min-h-64"
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
            </motion.div>
        );
    };

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
                title="Quản lý Đặt Phòng"
                subTitle="Quản lý tất cả đặt phòng trong hệ thống, theo dõi và cập nhật trạng thái."
            />

            {/* Search & Filter Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white shadow-xl rounded-2xl p-6 mb-8"
            >
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên user hoặc khách sạn..."
                                value={search}
                                onChange={handleSearch}
                                className="pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-gray-700"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            value={statusFilter}
                            onChange={handleStatusFilter}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Đang xử lý</option>
                            <option value="confirmed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                        Tổng: <span className="font-bold text-blue-600">{total}</span> booking
                    </div>
                </div>
            </motion.div>

            {/* Bookings Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white shadow-xl rounded-2xl overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    Người dùng
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    Khách sạn
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    Phòng
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    Check-in/out
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    Tổng tiền
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    Thanh toán
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-28 bg-gray-200 animate-pulse rounded"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mx-auto"></div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full mx-auto"></div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full mx-auto"></div>
                                        </td>
                                    </tr>
                                ))
                                : bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-gray-500">
                                            Không có booking nào trong hệ thống
                                        </td>
                                    </tr>
                                ) : bookings.map((booking, index) => {
                                    const statusDisplay = getStatusDisplay(booking.status);
                                    return (
                                        <motion.tr
                                            key={booking._id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="hover:bg-blue-50/50 transition-all duration-200"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {booking.customerName || booking.user?.username || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {booking.customerEmail || booking.user?.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {booking.hotel?.name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {booking.hotel?.address || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {booking.room?.roomType || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {booking.guests || 1} khách
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <div> {formatDate(booking.checkInDate)}</div>
                                                    <div> {formatDate(booking.checkOutDate)}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <div className="text-sm font-bold text-green-600">
                                                    {booking.totalPrice?.toLocaleString('vi-VN')}₫
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusDisplay.class}`}>
                                                    {statusDisplay.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${booking.isPaid
                                                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                                                    : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                                                    }`}>
                                                    {booking.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-6 py-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Trang {currentPage} của {totalPages}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default AllBookings;
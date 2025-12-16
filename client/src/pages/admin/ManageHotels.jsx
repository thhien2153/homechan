
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Title from '../../components/Title';
import Swal from 'sweetalert2';

const ManageHotels = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');

    const fetchHotels = async (page = 1, searchTerm = '') => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');

            const response = await fetch(`/api/admin/hotels?page=${page}&search=${searchTerm}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setHotels(data.hotels);
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
            console.error('Error fetching hotels:', error);
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
        fetchHotels(currentPage, search);
    }, [currentPage, search]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        setCurrentPage(1);
    };

    // Function toggle trạng thái hotel
    const toggleHotelStatus = async (hotelId, currentStatus) => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await fetch(`/api/admin/hotels/${hotelId}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                fetchHotels(currentPage, search); // Refresh danh sách
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: data.message,
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                const error = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: error.message || 'Có lỗi xảy ra'
                });
            }
        } catch (error) {
            console.error('Error toggling hotel status:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể kết nối đến server'
            });
        }
    };

    const deleteHotel = async (hotelId, hotelName) => {
        const result = await Swal.fire({
            title: 'Xóa khách sạn?',
            text: `Bạn có chắc muốn xóa khách sạn "${hotelName}"? Hành động này không thể hoàn tác!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                const response = await fetch(`/api/admin/hotels/${hotelId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    fetchHotels(currentPage, search);
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã xóa!',
                        text: data.message,
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    const error = await response.json();
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi!',
                        text: error.message || 'Có lỗi xảy ra'
                    });
                }
            } catch (error) {
                console.error('Error deleting hotel:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể kết nối đến server'
                });
            }
        }
    };

    const goToPage = (page) => {
        setCurrentPage(page);
    };

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
    }

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
                title="🏨 Quản lý khách sạn"
                subTitle="Quản lý tất cả khách sạn trong hệ thống, theo dõi trạng thái hoạt động."
            />

            {/* Search Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white shadow-xl rounded-2xl p-6 mb-8"
            >
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên khách sạn..."
                                value={search}
                                onChange={handleSearch}
                                className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-gray-700"
                            />
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                        Tổng: <span className="font-bold text-blue-600">{total}</span> khách sạn
                    </div>
                </div>
            </motion.div>

            {/* Hotels Table */}
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
                                    Chủ khách sạn
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    Tên khách sạn
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    Địa chỉ
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    Trạng thái hoạt động
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    Hành động
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
                                            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-48 bg-gray-200 animate-pulse rounded"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                                        </td>
                                    </tr>
                                ))
                                : hotels.map((hotel, index) => (
                                    <motion.tr
                                        key={hotel._id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="hover:bg-blue-50/50 transition-all duration-200"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {hotel.owner?.username || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {hotel.owner?.email || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {hotel.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                📞 {hotel.contact}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700 max-w-xs">
                                                📍 {hotel.address}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                🏙️ {hotel.city}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${hotel.isActive
                                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                                                : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                                                }`}>
                                                {hotel.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* Toggle Switch */}
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={hotel.isActive}
                                                    onChange={() => toggleHotelStatus(hotel._id, hotel.isActive)}
                                                    className="sr-only peer"
                                                />
                                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                <span className="ml-3 text-sm font-medium text-gray-700">
                                                    {hotel.isActive ? 'Bật' : 'Tắt'}
                                                </span>
                                            </label>
                                        </td>
                                    </motion.tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between"
                    >
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Hiển thị <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> đến{' '}
                                    <span className="font-medium">{Math.min(currentPage * 10, total)}</span> trong{' '}
                                    <span className="font-medium">{total}</span> kết quả
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        «
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        »
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ManageHotels;
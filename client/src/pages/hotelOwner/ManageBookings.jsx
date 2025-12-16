import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Title from '../../components/Title';
import { useAppContext } from '../../conext/AppContext';
import toast from 'react-hot-toast';

const ManageBookings = () => {
    const { axios, getToken } = useAppContext();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { user } = useAppContext();
    const [hotels, setHotels] = useState([])
    const [selectedHotel, setSelectedHotel] = useState(null)
    const [loadingHotels, setLoadingHotels] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBookingReviews, setSelectedBookingReviews] = useState([]);
    const [replyTexts, setReplyTexts] = useState({});
    const [replyingTo, setReplyingTo] = useState(null);

    const fetchBookings = async (page = 1, searchTerm = '', status = 'all') => {
        if (!selectedHotel) return;
        try {
            setLoading(true);
            const { data } = await axios.get(
                `/api/bookings/hotel/${selectedHotel._id}?page=${page}&search=${searchTerm}&status=${status}&limit=10`,
                {
                    headers: {
                        'Authorization': `Bearer ${await getToken()}`
                    }
                }
            );


            if (data.success) {
                setBookings(data.bookings);
                setCurrentPage(data.currentPage);
                setTotalPages(data.totalPages);
                setTotal(data.total);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Không thể kết nối đến server!');
        } finally {
            setLoading(false);
        }
    };

    //hàm chọn khách sạn
    const handleSelectHotel = (hotel) => {
        setSelectedHotel(hotel);
    };

    const fetchHotels = async () => {
        setLoadingHotels(true)
        try {
            const { data } = await axios.get('/api/hotels')
            const hotelsData = Array.isArray(data) ? data : data.hotels || []
            const ownerId = user?.id || user?._id || user?.userId
            const ownerHotels = hotelsData.filter(h => {
                const owner = h?.owner?._id || h?.owner
                return String(owner) === String(ownerId)
            })
            setHotels(ownerHotels)
        } catch (err) {
            console.error('Error fetching hotels:', err)
            toast.error('Lỗi khi tải danh sách khách sạn')
        } finally {
            setLoadingHotels(false)
        }
    }

    useEffect(() => {
        fetchHotels();
    }, []);

    useEffect(() => {
        if (selectedHotel) {
            fetchBookings(currentPage, search, statusFilter);
        }
    }, [selectedHotel, currentPage, search, statusFilter]);


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


    const updateBookingStatus = async (bookingId, status, isPaid) => {
        try {
            const { data } = await axios.patch(`/api/bookings/owner/${bookingId}/status`,
                { status, isPaid },
                {
                    headers: {
                        'Authorization': `Bearer ${await getToken()}`
                    }
                }
            );

            if (data.success) {
                fetchBookings(currentPage, search, statusFilter);
                toast.success('Trạng thái booking đã được cập nhật.');
            } else {
                toast.error(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            toast.error('Không thể kết nối đến server');
        }
    };

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const fetchReviewsForBooking = async (bookingId) => {
        try {
            const { data } = await axios.get(`/api/comments/booking/${bookingId}`, {
                headers: {
                    'Authorization': `Bearer ${await getToken()}`
                }
            });
            if (data.success) {
                setSelectedBookingReviews(data.comments || []);
                setShowReviewModal(true);
            } else {
                toast.error('Không thể tải đánh giá');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Lỗi khi tải đánh giá');
        }
    };

    const handleReplyTextChange = (commentId, text) => {
        setReplyTexts(prev => ({
            ...prev,
            [commentId]: text
        }));
    };

    const handleReplyToComment = async (commentId) => {
        const replyText = replyTexts[commentId]?.trim();
        if (!replyText) {
            toast.error('Vui lòng nhập nội dung trả lời');
            return;
        }

        try {
            const { data } = await axios.post(`/api/comments/${commentId}/reply`, {
                replyText
            }, {
                headers: {
                    'Authorization': `Bearer ${await getToken()}`
                }
            });

            if (data.success) {
                // Update the review in the state
                setSelectedBookingReviews(prev =>
                    prev.map(review =>
                        review._id === commentId ? data.comment : review
                    )
                );
                setReplyTexts(prev => ({
                    ...prev,
                    [commentId]: ''
                }));
                setReplyingTo(null);
                toast.success('Trả lời đánh giá thành công');
            } else {
                toast.error(data.message || 'Không thể trả lời đánh giá');
            }
        } catch (error) {
            console.error('Error replying to comment:', error);
            toast.error('Lỗi khi trả lời đánh giá');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

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

    if (loadingHotels && !selectedHotel) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center min-h-64"
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải danh sách khách sạn...</span>
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
                title="Quản lý Đặt phòng"
                subTitle="Quản lý tất cả đặt phòng của khách sạn bạn, theo dõi và cập nhật trạng thái."
            />


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
                                placeholder="Tìm kiếm theo tên khách hàng..."
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

            {!selectedHotel ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white shadow-xl rounded-2xl p-6 mb-8"
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Danh sách khách sạn của bạn
                    </h2>

                    {loadingHotels ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Đang tải danh sách khách sạn...</span>
                        </div>
                    ) : hotels.length === 0 ? (
                        <p className="text-gray-600 py-8 text-center">Bạn chưa có khách sạn nào.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hotels.map((hotel) => (
                                <div
                                    key={hotel._id}
                                    onClick={() => handleSelectHotel(hotel)}
                                    className="cursor-pointer bg-gradient-to-br from-blue-50 to-white border border-gray-200 rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
                                >
                                    <img
                                        src={hotel.images?.[0] || '/placeholder-hotel.jpg'}
                                        alt={hotel.name}
                                        className="w-full h-40 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold text-gray-800">{hotel.name}</h3>
                                        <p className="text-sm text-gray-500">{hotel.address || 'Địa chỉ không xác định'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Danh sách Đặt phòng của khách sạn: {selectedHotel.name}
                        </h2>
                        <button
                            onClick={() => setSelectedHotel(null)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                        >
                            ← Quay lại danh sách khách sạn
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Đang tải danh sách booking...</span>
                        </div>
                    ) : bookings.length === 0 ? (
                        <p className="text-gray-600 py-8 text-center">Không có booking nào trong hệ thống.</p>
                    ) : (
                        <div className="overflow-x-auto bg-white shadow-xl rounded-2xl">
                            {/* Bảng booking vẫn giữ nguyên */}
                        </div>
                    )}
                </motion.div>
            )}

            {selectedHotel && (
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
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">
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
                                            <td className="px-6 py-4 text-center">
                                                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mx-auto"></div>
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
                                                        {booking.customerPhone || booking.user?.phoneNumber || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {booking.room?.roomType || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {booking.guests || 1} khách
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
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
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <div className="flex justify-center space-x-2">
                                                        {booking.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateBookingStatus(booking._id, 'confirmed', true)}
                                                                    className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                                                                >
                                                                    Xác nhận
                                                                </button>
                                                                <button
                                                                    onClick={() => updateBookingStatus(booking._id, 'cancelled', false)}
                                                                    className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                                                                >
                                                                    Hủy
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => fetchReviewsForBooking(booking._id)}
                                                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                                                        >
                                                            Xem đánh giá
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>


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
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Đánh giá của khách hàng</h3>
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {selectedBookingReviews.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">Chưa có đánh giá nào cho booking này.</p>
                        ) : (
                            <div className="space-y-4">
                                {selectedBookingReviews.map((review, index) => (
                                    <div key={review._id || index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {review.user?.username?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-semibold text-gray-800">
                                                        {review.user?.username || 'Người dùng ẩn danh'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(review.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={`text-lg ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-700 mb-3">{review.text || 'Không có nội dung đánh giá'}</p>

                                        {/* Reply Section */}
                                        {review.reply && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                                <div className="flex items-center mb-2">
                                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                        H
                                                    </div>
                                                    <div className="ml-2">
                                                        <p className="font-semibold text-blue-800 text-sm">Host Reply</p>
                                                        <p className="text-xs text-blue-600">
                                                            {formatDate(review.reply.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-blue-700 text-sm">{review.reply.text}</p>
                                            </div>
                                        )}

                                        {!review.reply && (
                                            <div className="mt-3">
                                                {replyingTo === review._id ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            value={replyTexts[review._id] || ''}
                                                            onChange={(e) => handleReplyTextChange(review._id, e.target.value)}
                                                            placeholder="Nhập nội dung trả lời..."
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                            rows="3"
                                                        />
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleReplyToComment(review._id)}
                                                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                                            >
                                                                Gửi trả lời
                                                            </button>
                                                            <button
                                                                onClick={() => setReplyingTo(null)}
                                                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                                                            >
                                                                Hủy
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setReplyingTo(review._id)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        Trả lời đánh giá
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default ManageBookings;
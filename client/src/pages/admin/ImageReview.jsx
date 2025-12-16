import React, { useEffect, useState } from 'react';
import { useAppContext } from '../conext/AppContext';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaRobot, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminImageReview = () => {
    const { axios } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        fetchSuspiciousImages();
    }, [page, selectedStatus]);

    const fetchSuspiciousImages = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 12
            };
            if (selectedStatus) {
                params.status = selectedStatus;
            }

            const res = await axios.get('/api/image/suspicious', { params });
            if (res.data.success) {
                setImages(res.data.data);
                setPagination(res.data.pagination);
            }
        } catch (error) {
            console.error('Fetch suspicious images error:', error);
            toast.error('Lỗi tải ảnh nghi vấn');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (analysisId) => {
        try {
            setReviewLoading(true);
            const res = await axios.put(`/api/image/analyze/${analysisId}/decision`, {
                adminDecision: 'approved',
                reason: 'Phê duyệt bởi admin'
            });

            if (res.data.success) {
                toast.success('Đã phê duyệt ảnh');
                fetchSuspiciousImages();
                setSelectedImage(null);
            }
        } catch (error) {
            console.error('Approve error:', error);
            toast.error('Lỗi phê duyệt');
        } finally {
            setReviewLoading(false);
        }
    };

    const handleReject = async (analysisId) => {
        const reason = prompt('Nhập lý do từ chối:');
        if (!reason) return;

        try {
            setReviewLoading(true);
            const res = await axios.put(`/api/image/analyze/${analysisId}/decision`, {
                adminDecision: 'rejected',
                reason
            });

            if (res.data.success) {
                toast.success('Đã từ chối ảnh');
                fetchSuspiciousImages();
                setSelectedImage(null);
            }
        } catch (error) {
            console.error('Reject error:', error);
            toast.error('Lỗi từ chối');
        } finally {
            setReviewLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'real':
                return <FaCheckCircle className="text-green-500" />;
            case 'suspicious':
                return <FaExclamationTriangle className="text-yellow-500" />;
            case 'likely_fake':
                return <FaTimesCircle className="text-red-500" />;
            case 'ai_generated':
                return <FaRobot className="text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            real: 'Ảnh Thật',
            suspicious: 'Ảnh Nghi Vấn',
            likely_fake: 'Ảnh Giả',
            ai_generated: 'AI-Generated'
        };
        return labels[status] || status;
    };

    if (loading && page === 1) {
        return <div className="text-center py-8">Đang tải...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">🔍 Quản Lý Ảnh Nghi Vấn</h1>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => { setSelectedStatus(''); setPage(1); }}
                    className={`px-4 py-2 rounded ${!selectedStatus ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Tất cả
                </button>
                <button
                    onClick={() => { setSelectedStatus('suspicious'); setPage(1); }}
                    className={`px-4 py-2 rounded flex items-center gap-2 ${selectedStatus === 'suspicious' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
                >
                    <FaExclamationTriangle /> Nghi Vấn
                </button>
                <button
                    onClick={() => { setSelectedStatus('likely_fake'); setPage(1); }}
                    className={`px-4 py-2 rounded flex items-center gap-2 ${selectedStatus === 'likely_fake' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                >
                    <FaTimesCircle /> Ảnh Giả
                </button>
                <button
                    onClick={() => { setSelectedStatus('ai_generated'); setPage(1); }}
                    className={`px-4 py-2 rounded flex items-center gap-2 ${selectedStatus === 'ai_generated' ? 'bg-red-700 text-white' : 'bg-gray-200'}`}
                >
                    <FaRobot /> AI-Generated
                </button>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                    <div
                        key={image._id}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                    >
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                            <img
                                src={image.imageUrl}
                                alt="Analysis"
                                className="w-full h-full object-cover hover:scale-105 transition"
                            />
                            <div className="absolute top-2 right-2 bg-white/90 rounded-full p-2">
                                {getStatusIcon(image.status)}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(image.status)}
                                <span className="font-semibold text-sm">{getStatusLabel(image.status)}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                                Độ tin cậy: {Math.round(image.confidence * 100)}%
                            </p>
                            {image.roomId && (
                                <p className="text-xs text-gray-700">
                                    Phòng: {image.roomId.roomType}
                                </p>
                            )}
                            <p className="text-xs text-gray-600 mt-2">
                                Người upload: {image.uploadedBy?.username}
                            </p>
                            <p className="text-xs text-gray-600">
                                {new Date(image.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {images.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                    Không có ảnh nghi vấn nào
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
                    >
                        <FaChevronLeft />
                    </button>
                    <span className="text-sm">
                        Trang {pagination.page} / {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                        disabled={page === pagination.pages}
                        className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                {getStatusIcon(selectedImage.status)}
                                {getStatusLabel(selectedImage.status)}
                            </h2>

                            <img
                                src={selectedImage.imageUrl}
                                alt="Full"
                                className="w-full rounded-lg mb-4 max-h-96 object-contain"
                            />

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-blue-50 rounded p-3">
                                    <p className="text-xs text-gray-600">AI-Generated</p>
                                    <p className="text-2xl font-bold">{selectedImage.details?.aiGenerated?.score}%</p>
                                </div>
                                <div className="bg-yellow-50 rounded p-3">
                                    <p className="text-xs text-gray-600">Chỉnh Sửa</p>
                                    <p className="text-2xl font-bold">{selectedImage.details?.deepfake?.score}%</p>
                                </div>
                                <div className="bg-green-50 rounded p-3">
                                    <p className="text-xs text-gray-600">Chất Lượng</p>
                                    <p className="text-2xl font-bold">{selectedImage.details?.qualityScore}%</p>
                                </div>
                            </div>

                            {selectedImage.details?.recommendations && (
                                <div className="bg-gray-50 rounded p-3 mb-4">
                                    <p className="font-semibold text-sm mb-2">Gợi ý:</p>
                                    <ul className="space-y-1">
                                        {selectedImage.details.recommendations.map((rec, idx) => (
                                            <li key={idx} className="text-sm text-gray-700">• {rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <p>Người upload: <span className="font-semibold">{selectedImage.uploadedBy?.username}</span></p>
                                <p>Email: <span className="font-semibold">{selectedImage.uploadedBy?.email}</span></p>
                                <p>Ngày upload: <span className="font-semibold">{new Date(selectedImage.createdAt).toLocaleDateString('vi-VN')}</span></p>
                            </div>

                            {selectedImage.adminDecision === 'pending' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprove(selectedImage._id)}
                                        disabled={reviewLoading}
                                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                    >
                                        ✅ Phê duyệt
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedImage._id)}
                                        disabled={reviewLoading}
                                        className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
                                    >
                                        ❌ Từ chối
                                    </button>
                                </div>
                            )}

                            {selectedImage.adminDecision !== 'pending' && (
                                <div className={`p-3 rounded text-center font-semibold ${
                                    selectedImage.adminDecision === 'approved'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-red-50 text-red-700'
                                }`}>
                                    {selectedImage.adminDecision === 'approved' ? '✅ Đã phê duyệt' : '❌ Đã từ chối'}
                                    {selectedImage.adminReason && <p className="text-sm mt-1">{selectedImage.adminReason}</p>}
                                </div>
                            )}

                            <button
                                onClick={() => setSelectedImage(null)}
                                className="w-full mt-4 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminImageReview;

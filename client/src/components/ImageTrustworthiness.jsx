import React, { useEffect, useState } from 'react';
import { useAppContext } from '../conext/AppContext';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaRobot, FaLock } from 'react-icons/fa';

const RoomImageTrustworthiness = ({ roomId }) => {
    const { axios } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [analyses, setAnalyses] = useState([]);

    useEffect(() => {
        if (roomId) {
            fetchImageStatus();
        }
    }, [roomId]);

    const fetchImageStatus = async () => {
        try {
            const res = await axios.get(`/api/image/room-status/${roomId}`);
            if (res.data.success) {
                setOverview(res.data.overview);
                setAnalyses(res.data.analyses);
            }
        } catch (error) {
            console.error('Fetch image status error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Đang tải thông tin...</div>;
    }

    if (!overview || overview.analyzedImages === 0) {
        return (
            <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
                Chưa có phân tích ảnh cho phòng này
            </div>
        );
    }

    const getTrustColor = (trust) => {
        if (trust >= 80) return 'text-green-600';
        if (trust >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getTrustLevel = (trust) => {
        if (trust >= 80) return '✅ Uy Tín Cao';
        if (trust >= 60) return '⚠️ Uy Tín Trung Bình';
        return '❌ Uy Tín Thấp';
    };

    return (
        <div className="space-y-4">
            {/* Trust Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">🛡️ Mức độ tin tưởng ảnh</p>
                        <p className={`text-3xl font-bold ${getTrustColor(overview.overallTrust)}`}>
                            {overview.overallTrust}%
                        </p>
                        <p className={`text-sm font-semibold ${getTrustColor(overview.overallTrust)}`}>
                            {getTrustLevel(overview.overallTrust)}
                        </p>
                    </div>
                    <FaLock className={`text-5xl ${getTrustColor(overview.overallTrust)}`} />
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-green-50 rounded p-3 border border-green-200">
                    <p className="text-xs text-gray-600">Ảnh Thật</p>
                    <p className="text-2xl font-bold text-green-600">{overview.realImages}</p>
                </div>
                <div className="bg-yellow-50 rounded p-3 border border-yellow-200">
                    <p className="text-xs text-gray-600">Ảnh Nghi Vấn</p>
                    <p className="text-2xl font-bold text-yellow-600">{overview.suspiciousImages}</p>
                </div>
                <div className="bg-red-50 rounded p-3 border border-red-200">
                    <p className="text-xs text-gray-600">Ảnh Giả</p>
                    <p className="text-2xl font-bold text-red-600">{overview.fakeImages}</p>
                </div>
                <div className="bg-blue-50 rounded p-3 border border-blue-200">
                    <p className="text-xs text-gray-600">Tổng Phân Tích</p>
                    <p className="text-2xl font-bold text-blue-600">{overview.analyzedImages}</p>
                </div>
            </div>

            {/* Image Details */}
            {analyses.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Chi tiết từng ảnh:</p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {analyses.map((analysis, idx) => (
                            <div key={idx} className="bg-white rounded border p-3 hover:shadow-md transition">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-1">Ảnh {idx + 1}</p>
                                        <div className="flex items-center gap-2">
                                            {analysis.status === 'real' && (
                                                <><FaCheckCircle className="text-green-500" /><span className="text-sm font-semibold text-green-600">Ảnh Thật</span></>
                                            )}
                                            {analysis.status === 'suspicious' && (
                                                <><FaExclamationTriangle className="text-yellow-500" /><span className="text-sm font-semibold text-yellow-600">Ảnh Nghi Vấn</span></>
                                            )}
                                            {analysis.status === 'likely_fake' && (
                                                <><FaTimesCircle className="text-red-500" /><span className="text-sm font-semibold text-red-600">Ảnh Giả</span></>
                                            )}
                                            {analysis.status === 'ai_generated' && (
                                                <><FaRobot className="text-red-600" /><span className="text-sm font-semibold text-red-600">AI-Generated</span></>
                                            )}
                                            <span className="text-xs text-gray-500">({Math.round(analysis.confidence * 100)}%)</span>
                                        </div>
                                        {analysis.details?.qualityScore !== undefined && (
                                            <p className="text-xs text-gray-600 mt-1">Chất lượng: {analysis.details.qualityScore}%</p>
                                        )}
                                    </div>
                                    <img
                                        src={analysis.imageUrl}
                                        alt={`Room ${idx + 1}`}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {overview.fakeImages > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-700">
                        ⚠️ Phòng này có {overview.fakeImages} ảnh nghi vấn. Khách sạn nên thay thế bằng ảnh thực tế để tăng độ tin tưởng.
                    </p>
                </div>
            )}
        </div>
    );
};

export default RoomImageTrustworthiness;

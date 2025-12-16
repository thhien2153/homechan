import React, { useState } from 'react';
import { useAppContext } from '../conext/AppContext';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaRobot, FaSpinner } from 'react-icons/fa';

const ImageQualityChecker = ({ onAnalysisComplete }) => {
    const { axios } = useAppContext();
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    const statusConfig = {
        real: {
            icon: <FaCheckCircle className="text-4xl text-green-500" />,
            title: '✅ Ảnh Thật - Đã Kiểm Duyệt AI',
            color: 'border-green-500 bg-green-50',
            textColor: 'text-green-700'
        },
        suspicious: {
            icon: <FaExclamationTriangle className="text-4xl text-yellow-500" />,
            title: '⚠️ Ảnh Nghi Vấn - Chỉnh Sửa Mạnh',
            color: 'border-yellow-500 bg-yellow-50',
            textColor: 'text-yellow-700'
        },
        likely_fake: {
            icon: <FaTimesCircle className="text-4xl text-red-500" />,
            title: '❌ Ảnh Khả Năng Cao Là Giả',
            color: 'border-red-500 bg-red-50',
            textColor: 'text-red-700'
        },
        ai_generated: {
            icon: <FaRobot className="text-4xl text-red-600" />,
            title: '🤖 Ảnh Được Sinh Ra Bởi AI',
            color: 'border-red-600 bg-red-50',
            textColor: 'text-red-700'
        }
    };

    const handleCheckImage = async (e) => {
        e.preventDefault();

        if (!imageUrl.trim()) {
            toast.error('Vui lòng nhập URL ảnh');
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post('/api/image/check-image', {
                imageUrl: imageUrl.trim()
            });

            if (res.data.success) {
                setAnalysis(res.data.analysis);
                toast.success('Phân tích ảnh thành công!');
                if (onAnalysisComplete) {
                    onAnalysisComplete(res.data.analysis);
                }
            } else {
                toast.error(res.data.message || 'Lỗi phân tích ảnh');
            }
        } catch (error) {
            console.error('Check image error:', error);
            toast.error(error.response?.data?.message || 'Lỗi phân tích ảnh');
        } finally {
            setLoading(false);
        }
    };

    if (!analysis) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">🔍 Kiểm Tra Chất Lượng Ảnh</h2>
                <p className="text-gray-600 mb-4">
                    Hệ thống AI sẽ kiểm tra ảnh của bạn để đảm bảo chất lượng và tính xác thực
                </p>

                <form onSubmit={handleCheckImage} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            URL Ảnh
                        </label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Đang phân tích...
                            </>
                        ) : (
                            'Kiểm tra ảnh'
                        )}
                    </button>
                </form>
            </div>
        );
    }

    const config = statusConfig[analysis.status];

    return (
        <div className={`border-4 rounded-lg p-6 max-w-2xl mx-auto ${config.color}`}>
            <div className="flex items-center gap-4 mb-4">
                {config.icon}
                <div>
                    <h3 className={`text-xl font-bold ${config.textColor}`}>
                        {config.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                        Độ tin cậy: {Math.round(analysis.confidence * 100)}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/80 rounded p-3 text-center">
                    <p className="text-xs text-gray-600">AI-Generated</p>
                    <p className="text-lg font-bold text-gray-800">{analysis.details.aiGenerated.score}%</p>
                    <p className={`text-xs font-semibold ${analysis.details.aiGenerated.risk === 'high' ? 'text-red-600' :
                            analysis.details.aiGenerated.risk === 'medium' ? 'text-yellow-600' :
                                'text-green-600'
                        }`}>
                        {analysis.details.aiGenerated.risk.toUpperCase()}
                    </p>
                </div>

                <div className="bg-white/80 rounded p-3 text-center">
                    <p className="text-xs text-gray-600">Chỉnh Sửa</p>
                    <p className="text-lg font-bold text-gray-800">{analysis.details.deepfake.score}%</p>
                    <p className={`text-xs font-semibold ${analysis.details.deepfake.risk === 'high' ? 'text-red-600' :
                            analysis.details.deepfake.risk === 'medium' ? 'text-yellow-600' :
                                'text-green-600'
                        }`}>
                        {analysis.details.deepfake.risk.toUpperCase()}
                    </p>
                </div>

                <div className="bg-white/80 rounded p-3 text-center">
                    <p className="text-xs text-gray-600">Chất Lượng</p>
                    <p className="text-lg font-bold text-gray-800">{analysis.details.qualityScore}%</p>
                    <p className={`text-xs font-semibold ${analysis.details.qualityScore >= 70 ? 'text-green-600' :
                            analysis.details.qualityScore >= 50 ? 'text-yellow-600' :
                                'text-red-600'
                        }`}>
                        {analysis.details.qualityScore >= 70 ? 'TỐT' : analysis.details.qualityScore >= 50 ? 'TRUNG BÌNH' : 'YẾU'}
                    </p>
                </div>
            </div>

            {analysis.details.recommendations && analysis.details.recommendations.length > 0 && (
                <div className="bg-white/80 rounded p-4 mb-4">
                    <p className="font-semibold text-gray-800 mb-2">💡 Gợi ý cải thiện:</p>
                    <ul className="space-y-1">
                        {analysis.details.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-orange-500 mt-1">•</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                onClick={() => {
                    setAnalysis(null);
                    setImageUrl('');
                }}
                className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
            >
                Kiểm tra ảnh khác
            </button>
        </div>
    );
};

export default ImageQualityChecker;

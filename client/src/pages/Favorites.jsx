import React, { useState, useEffect } from 'react'
import { useAppContext } from '../conext/AppContext'
import { useNavigate } from 'react-router-dom'
import FavoriteButton from '../components/FavoriteButton'
import toast from 'react-hot-toast'

const Favorites = () => {
    const { user, getToken, axios } = useAppContext()
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)
    const [authChecked, setAuthChecked] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const checkAuthentication = () => {
            const token = sessionStorage.getItem("token")
            const storedUser = sessionStorage.getItem("user")
            if (token && storedUser) {
                setTimeout(() => setAuthChecked(true), 200)
            } else {
                setAuthChecked(true)
            }
        }
        checkAuthentication()
    }, [])

    useEffect(() => {
        if (authChecked) {
            if (user) fetchFavorites()
            else navigate('/login')
        }
    }, [user, authChecked, navigate])

    const fetchFavorites = async () => {
        try {
            const token = await getToken()
            if (!token) {
                navigate('/login')
                return
            }
            const { data } = await axios.get('/api/favorites', {
                headers: { Authorization: `Bearer ${token}` }
            })
            // API trả về mảng rooms (populated room docs)
            setFavorites(Array.isArray(data.favorites) ? data.favorites : [])
        } catch (error) {
            console.error('Lỗi khi tải danh sách yêu thích:', error)
            if (error.response?.status === 401) {
                sessionStorage.removeItem("token")
                sessionStorage.removeItem("user")
                toast.error('Phiên đăng nhập đã hết hạn')
                navigate('/login')
            } else {
                toast.error('Lỗi khi tải danh sách yêu thích')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveFavorite = (roomId) => {
        setFavorites(prev => prev.filter(r => r._id !== roomId))
    }

    // Hàm lấy ảnh an toàn
    const getRoomImage = (room) => {
        if (!room) return '/fallback.jpg'
        // ưu tiên phòng: roomImages, sau đó room.images (nếu có), hotelImages, hotel.images
        const candidates = [
            room.roomImages,
            room.images,
            room.hotelImages,
            room.hotel?.images
        ]
        for (const arr of candidates) {
            if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') {
                return arr[0]
            }
        }
        return '/fallback.jpg'
    }

    if (loading || !authChecked) {
        return (
            <div className="py-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto text-center">
                <div>Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="py-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Mục yêu thích</h1>
                <p className="text-gray-600">Danh sách các phòng bạn đã lưu</p>
            </div>

            {favorites.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4"></div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Chưa có phòng yêu thích nào</h2>
                    <p className="text-gray-600 mb-6">Hãy khám phá và lưu những phòng bạn thích nhé!</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Khám phá ngay
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((room) => (
                        <div
                            key={room._id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                            onClick={() => room._id && navigate(`/rooms/${room._id}`)}
                        >
                            <div className="relative">
                                <img
                                    src={getRoomImage(room)}
                                    alt={room.roomType || room.roomName || 'Phòng'}
                                    className="w-full h-48 object-cover"
                                />
                                <div
                                    className="absolute top-3 right-3"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <FavoriteButton
                                        roomId={room._id}
                                        className="bg-white rounded-full p-2 shadow-lg"
                                        onRemove={() => handleRemoveFavorite(room._id)}
                                    />
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">
                                    {room.hotel?.name || room.hotelName || 'Khách sạn'} - {room.roomType || 'Phòng'}
                                </h3>
                                <p className="text-gray-600 text-sm mb-2">📍 {room.hotel?.address || room.hotelAddress || 'Không có địa chỉ'}</p>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1">
                                        <span className="text-orange-600 font-bold text-lg">
                                            {room.pricePerNight ? room.pricePerNight.toLocaleString('vi-VN') : 'Liên hệ'} ₫
                                        </span>
                                        <span className="text-gray-500 text-sm">/ngày</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Favorites
import React, { useState, useEffect } from 'react'
import { useAppContext } from '../conext/AppContext'
import toast from 'react-hot-toast'

const FavoriteButton = ({ roomId, className = "" }) => {
    const { user, getToken, axios } = useAppContext()
    const [isFavorite, setIsFavorite] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user && roomId) {
            checkFavoriteStatus()
        }
    }, [user, roomId])
    // 1. Kiểm tra trạng thái yêu thích
    const checkFavoriteStatus = async () => {
        try {
            const { data } = await axios.get('/api/favorites/check/' + roomId, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            setIsFavorite(data.isFavorite)
        } catch (error) {
            console.error('Error checking favorite status:', error)
        }
    }

    const toggleFavorite = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            toast.error('Bạn cần đăng nhập để sử dụng chức năng này')
            return
        }

        setLoading(true)
        try {
            if (isFavorite) {
                // thêm vào yêu thích
                await axios.delete(`/api/favorites/${roomId}`, {
                    headers: { Authorization: `Bearer ${await getToken()}` }
                })
                setIsFavorite(false)
                toast.success('Đã xóa khỏi yêu thích')
            } else {
                // xóa khỏi yêu thích
                await axios.post('/api/favorites', { roomId }, {
                    headers: { Authorization: `Bearer ${await getToken()}` }
                })
                setIsFavorite(true)
                toast.success('Đã thêm vào yêu thích')
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`${className} ${loading ? 'opacity-50' : ''} transition-all duration-200`}
        >
            {isFavorite ? (
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            ) : (
                <svg className="w-6 h-6 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )}
        </button>
    )
}

export default FavoriteButton
import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { assets, cities } from '../assets/assets'
import { useAppContext } from '../conext/AppContext'

const Hero = () => {
  const { navigate, getToken, axios, setSearchedCities } = useAppContext()
  const [destination, setDestination] = useState("")
  const [suggestions, setSuggestions] = useState([])

  const handleInputChange = async (e) => {
    const value = e.target.value
    setDestination(value)
    if (value.length > 2) {
      try {
        const res = await axios.get(`/api/hotels/search?keyword=${value}`)
        setSuggestions(res.data)
      } catch (err) {
        console.error("Lỗi khi tìm kiếm khách sạn:", err)
        setSuggestions([])
      }
    } else {
      setSuggestions([])
    }
  }

  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  const [rooms, setRooms] = useState(1)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [childAges, setChildAges] = useState([])
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const guestRef = useRef(null)

  const onSearch = async (e) => {
    e.preventDefault()
    navigate(
      `/rooms?destination=${destination}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&adults=${adults}&children=${children}`
    )
    await axios.post(
      '/api/user/store-recent-search',
      { recentSearchedCity: destination },
      { headers: { Authorization: `Bearer ${await getToken()}` } }
    )

    setSearchedCities((prev) => {
      const updated = [...prev, destination]
      if (updated.length > 3) updated.shift()
      return updated
    })
  }

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (guestRef.current && !guestRef.current.contains(e.target)) {
        setShowGuestDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cập nhật danh sách độ tuổi trẻ em khi thay đổi số lượng
  useEffect(() => {
    if (children > childAges.length) {
      setChildAges([...childAges, ...Array(children - childAges.length).fill(1)])
    } else if (children < childAges.length) {
      setChildAges(childAges.slice(0, children))
    }
  }, [children])

  const handleAgeChange = (index, value) => {
    const newAges = [...childAges]
    newAges[index] = parseInt(value)
    setChildAges(newAges)
  }

  return (
    <div className="relative h-screen text-white">
      <div className='absolute inset-0 bg-[url("/src/assets/heroImage.png")] bg-cover bg-center z-0' />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-10" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-20 h-full flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32"
      >
        <p className='bg-white/20 text-sm font-medium px-4 py-1.5 rounded-full backdrop-blur-md shadow text-white'>
          ✨ Bắt đầu hành trình đáng nhớ của bạn
        </p>

        <h1 className="mt-4 text-[40px] md:text-[60px] font-extrabold font-playfair leading-tight drop-shadow-lg">
          Ở đúng chỗ – chill đúng độ!
        </h1>

        <p className="mt-3 max-w-2xl text-white/90 text-sm md:text-base leading-relaxed">
          Không chỉ là nơi lưu trú, mà là nơi lưu giữ cảm xúc. Tìm kiếm khách sạn, homestay “chuẩn gu” dễ dàng và nhanh chóng cùng chúng tôi.
        </p>

        <form
          onSubmit={onSearch}
          className="mt-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-5 gap-4 bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg"
        >
          <div className="flex flex-col text-sm">
            <label className="text-white mb-1 font-semibold">🌆 Chọn điểm đến</label>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={handleInputChange}
                placeholder="Nhập tên khách sạn hoặc địa điểm..."
                required
                className="px-4 py-2.5 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition w-full"
              />

              {suggestions.length > 0 && (
                <ul className="absolute z-50 bg-white text-gray-800 rounded-lg shadow-lg mt-1 w-full max-h-48 overflow-y-auto">
                  {suggestions.map((hotel, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setDestination(hotel.name || hotel)
                        setSuggestions([])
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {hotel.name || hotel}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <datalist id="destinations">
              {cities.map((city, i) => <option key={i} value={city} />)}
            </datalist>
          </div>

          <div className="flex flex-col text-sm">
            <label className="text-white mb-1 font-semibold">📅 Ngày nhận phòng</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
              className="px-4 py-2.5 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            />
          </div>

          <div className="flex flex-col text-sm">
            <label className="text-white mb-1 font-semibold">📤 Ngày trả phòng</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              className="px-4 py-2.5 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            />
          </div>

          {/* 👥 Khách */}
          <div className="relative flex flex-col text-sm" ref={guestRef}>
            <label className="text-white mb-1 font-semibold">👥 Số phòng và Khách</label>
            <button
              type="button"
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
              className="px-4 py-2.5 w-full text-left rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            >
              {`${rooms} phòng, ${adults + children} khách`}
            </button>

            {showGuestDropdown && (
              <div className="absolute right-0 mt-[65px] w-full bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-200 p-4 z-50">

                {[
                  { label: "Phòng", value: rooms, set: setRooms, min: 1 },
                  { label: "Người lớn", value: adults, set: setAdults, min: 1 },
                  { label: "Trẻ em", value: children, set: setChildren, min: 0 },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="font-medium">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => item.set(Math.max(item.value - 1, item.min))}
                        className="w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100 text-lg"
                      >
                        −
                      </button>
                      <span>{item.value}</span>
                      <button
                        type="button"
                        onClick={() => item.set(item.value + 1)}
                        className="w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100 text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                {children > 0 && (
                  <div className="mt-3">
                    <label className="block font-medium mb-2">Độ tuổi trẻ em</label>
                    {childAges.map((age, idx) => (
                      <div key={idx} className="mb-2">
                        <select
                          value={age}
                          onChange={(e) => handleAgeChange(idx, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        >
                          {Array.from({ length: 17 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-black to-zinc-800 text-white font-semibold rounded-lg hover:from-zinc-900 hover:to-black transition-all duration-300 shadow-lg"
          >
            <img src={assets.searchIcon} alt="search" className="w-5 h-5" />
            <span className="text-sm">Tìm kiếm</span>
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default Hero

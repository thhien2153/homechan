import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../conext/AppContext'
import Title from '../../components/Title'
import toast from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { FaList, FaTh, FaSortAmountDownAlt, FaEdit, FaTrash, FaTimes, FaWifi, FaCoffee, FaConciergeBell, FaMountain, FaSwimmingPool } from 'react-icons/fa'
import facilityLabels from '../facilityLabels'
import { suggestRoomPrice } from '../../ai/suggestPrice'

const amenityIcons = {
  'Free WiFi': <FaWifi />,
  'Free Breakfast': <FaCoffee />,
  'Room Service': <FaConciergeBell />,
  'Mountain View': <FaMountain />,
  'Pool Access': <FaSwimmingPool />
}

const ITEMS_PER_PAGE = 6

const RoomCard = ({ room, index, editRoom, removeRoomFromList, facilityLabels }) => {
  const [currentImage, setCurrentImage] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Normalize bedsDetails to object
  const normalizedBedsDetails = (() => {
    if (Array.isArray(room.bedsDetails)) {
      const obj = {};
      room.bedsDetails.forEach(b => {
        if (b.type) obj[b.type] = b.count || 0;
      });
      return obj;
    } else if (room.bedsDetails && typeof room.bedsDetails === "object") {
      return room.bedsDetails;
    }
    return {};
  })();

  // Normalize bathroomsDetails to object
  const normalizedBathroomsDetails = (() => {
    if (Array.isArray(room.bathroomsDetails)) {
      const obj = {};
      room.bathroomsDetails.forEach(b => {
        if (b.type) obj[b.type] = b.count || 0;
      });
      return obj;
    } else if (room.bathroomsDetails && typeof room.bathroomsDetails === "object") {
      return room.bathroomsDetails;
    }
    return {};
  })();

  const images = (() => {
    // ưu tiên các field có mảng URL
    const src =
      room.roomImages?.length ? room.roomImages
        : room.images?.length ? room.images
          : room.imageUrls?.length ? room.imageUrls
            : room.imageNames?.length ? room.imageNames
              : room.photos?.length ? room.photos
                : room.image ? [room.image]
                  : [];

    // map file -> url (đối với File khi upload, tạo objectURL)
    return src.map(img => (img instanceof File ? URL.createObjectURL(img) : img));
  })();

  console.log("Room images loaded:", images);

  const nextImg = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (images.length === 0) return
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImg = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (images.length === 0) return
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="relative flex flex-col sm:flex-row bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl overflow-hidden transition-all duration-300">
      {/* Ảnh bên trái */}
      <div className="relative w-full sm:w-[360px] h-[240px] overflow-hidden flex-shrink-0">
        {images.length > 0 ? (
          <img
            src={images[currentImage]}
            alt="room"
            className="w-full h-full object-cover transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            Không có ảnh
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full px-2 py-1 text-lg shadow transition"
            >
              ‹
            </button>
            <button
              onClick={nextImg}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full px-2 py-1 text-lg shadow transition"
            >
              ›
            </button>
          </>
        )}

        {/* Giảm giá badge */}
        {room.discount > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
              -{room.discount}%
            </span>
          </div>
        )}

        {/* Nút sửa / xóa */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <button
            onClick={() => editRoom(index)}
            type="button"
            title="Chỉnh sửa phòng"
            className="p-2.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white shadow-md transition-all"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            type="button"
            title="Xóa phòng"
            className="p-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md transition-all"
          >
            <FaTrash size={16} />
          </button>
        </div>
      </div>

      {/* Nội dung bên phải */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <h5 className="text-xl font-bold text-purple-700 mb-2">
            {room.roomType || 'Phòng không tên'}
          </h5>

          <div className="space-y-1 text-sm text-gray-700 leading-relaxed">
            <p><span className="font-medium">Số phòng:</span> {room.roomNumber}</p>
            <p><span className="font-medium">Giá:</span> {room.pricePerNight} VND / đêm {room.discount > 0 && <span className="text-red-500">(-{room.discount}%)</span>}</p>
            <p><span className="font-medium">Khách tối đa:</span> {room.maxAdults} người lớn – {room.maxChildren} trẻ em</p>
          </div>



          {room.amenities?.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold text-gray-800 flex items-center gap-2">✨ Tiện nghi</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {room.amenities.map((a, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-indigo-50 text-indigo-600 font-medium px-3 py-1.5 rounded-full border border-indigo-100"
                  >
                    {facilityLabels[a] || a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-400 italic">
          Cập nhật: {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Hộp xác nhận xóa */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center max-w-sm">
            <p className="text-gray-800 font-semibold mb-4">
              Bạn có chắc chắn muốn xóa phòng này không?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  removeRoomFromList(index)
                  setConfirmDelete(false)
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                🗑 Xóa
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition"
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const Listroom = () => {
  const { axios, user, navigate, setShowHotelReg } = useAppContext()
  const [hotels, setHotels] = useState([])
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [sortOption, setSortOption] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchHotels = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/hotels')

      // server returns array of hotels (see server/controllers/hotelController.js)
      const hotelsData = Array.isArray(data) ? data : (data.hotels || [])

      if (!user) {
        setHotels([])
        return
      }

      const ownerId = user?.id || user?._id || user?.userId

      if (!ownerId) {
        console.warn('Owner id not found on user object, skipping hotel filter', user)
        setHotels([])
        return
      }

      const ownerHotels = hotelsData.filter(h => {
        const owner = h?.owner?._id || h?.owner
        if (!owner) return false
        try {
          return String(owner) === String(ownerId)
        } catch (e) {
          return false
        }
      })

      setHotels(ownerHotels)
    } catch (err) {
      console.error('Error fetching hotels:', err)
      toast.error('Lỗi khi tải danh sách khách sạn')
      setHotels([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchHotels()
  }, [user])

  let sorted = [...hotels]
  if (sortOption === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortOption === 'city') sorted.sort((a, b) => (a.city || '').localeCompare(b.city || ''))

  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const maxPage = Math.max(1, Math.ceil(hotels.length / ITEMS_PER_PAGE))

  const CardHotel = ({ hotel }) => (
    <div className="rounded-xl shadow-lg bg-white overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-44 overflow-hidden">
        <img
          src={hotel.images?.[0] || '/placeholder-hotel.jpg'}
          alt={hotel.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${hotel.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {hotel.isActive ? 'Hoạt động' : 'Tạm dừng'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{hotel.name}</h3>
        <p className="text-sm text-gray-600 mb-2">📍 {hotel.address} • {hotel.city}</p>

        <p className="text-sm text-gray-700 mb-4">Liên hệ: <span className="font-medium">{hotel.contact}</span></p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => openEditModal(hotel)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Chỉnh sửa"
            >
              <FaEdit size={14} />
            </button>
            <button
              onClick={() => openDeleteModal(hotel)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Xóa"
            >
              <FaTrash size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3">


            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hotel.isActive}
                onChange={() => toggleHotelStatus(hotel._id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const CardHotelList = ({ hotel }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="flex">
        <div className="w-36 h-36 flex-shrink-0">
          <img
            src={hotel.images?.[0] || '/placeholder-hotel.jpg'}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{hotel.name}</h3>
              <p className="text-sm text-gray-600 mb-2">📍 {hotel.address} • {hotel.city}</p>
              <p className="text-sm text-gray-700 mb-2">Liên hệ: <span className="font-medium">{hotel.contact}</span></p>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${hotel.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {hotel.isActive ? 'Hoạt động' : 'Tạm dừng'}
              </span>
            </div>

            <div className="flex flex-col items-end gap-3 ml-4">
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(hotel)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Chỉnh sửa"
                >
                  <FaEdit size={14} />
                </button>
                <button
                  onClick={() => openDeleteModal(hotel)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Xóa"
                >
                  <FaTrash size={14} />
                </button>
              </div>



              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hotel.isActive}
                  onChange={() => toggleHotelStatus(hotel._id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Edit / Delete modal states and handlers
  const [editModal, setEditModal] = useState(false)
  const [currentHotel, setCurrentHotel] = useState(null)
  const [editInputs, setEditInputs] = useState({ name: '', address: '', contact: '', city: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [hotelRooms, setHotelRooms] = useState([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  // Room edit modal and form states
  const [editRoomModal, setEditRoomModal] = useState(false)
  const [currentRoomEdit, setCurrentRoomEdit] = useState(null)
  const [roomEditInputs, setRoomEditInputs] = useState({ roomNumber: '', name: '', type: '', price: '', guests: 1 })
  const [roomBedCounts, setRoomBedCounts] = useState({})
  const [roomBathroomCounts, setRoomBathroomCounts] = useState({})
  const [roomAmenities, setRoomAmenities] = useState([])
  const [roomEditImages, setRoomEditImages] = useState([])
  const [roomExistingImages, setRoomExistingImages] = useState([])
  const [roomEditLoading, setRoomEditLoading] = useState(false)

  // Add room modal state
  const [addRoomModal, setAddRoomModal] = useState(false)
  const [addRoomInputs, setAddRoomInputs] = useState({
    roomNumber: '',
    roomType: '',
    roomArea: '',
    maxAdults: '',
    maxChildren: '',
    pricePerNight: '',
    discount: '',
    amenities: {
      'Free WiFi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Mountain View': false,
      'Pool Access': false
    },
    roomImages: []
  })
  const [addRoomLoading, setAddRoomLoading] = useState(false)

  // Inline edit room form state
  const [editRoomInputs, setEditRoomInputs] = useState({
    roomNumber: '',
    roomType: '',
    roomArea: '',
    maxAdults: '',
    maxChildren: '',
    pricePerNight: '',
    discount: '',
    bedsDetails: {
      'Giường đơn': 0,
      'Giường đôi nhỏ': 0,
      'Giường đôi lớn vừa': 0,
      'Giường cỡ lớn': 0,
      'Giường siêu lớn': 0
    },
    bathroomsDetails: {
      'Tiêu chuẩn': 0,
      'Nâng cao': 0,
      'Cao cấp': 0,
      'Hạng sang': 0
    },
    amenities: {
      'Free WiFi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Mountain View': false,
      'Pool Access': false
    },
    roomImages: []
  })

  // Auto-suggest price for add room modal
  useEffect(() => {
    if (addRoomInputs.roomType) {
      try {
        const result = suggestRoomPrice(addRoomInputs);
        setAddRoomInputs(prev => ({
          ...prev,
          pricePerNight: result.price
        }));
        toast.success(`🤖 AI đề xuất: ${result.price.toLocaleString()}₫/đêm`);
      } catch (error) {
        console.error('Error in AI price suggestion:', error);
        toast.error('Lỗi khi gợi ý giá AI');
      }
    }
  }, [addRoomInputs.roomType])

  // Handlers for room images in add room modal
  const handleAddRoomImageDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    setAddRoomInputs(prev => ({ ...prev, roomImages: [...(prev.roomImages || []), ...files] }))
  }

  const handleAddRoomImageChange = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
    setAddRoomInputs(prev => ({ ...prev, roomImages: [...(prev.roomImages || []), ...files] }))
  }

  const removeAddRoomImage = (index) => {
    setAddRoomInputs(prev => ({
      ...prev,
      roomImages: prev.roomImages.filter((_, i) => i !== index)
    }))
  }

  // Handlers for room images in edit room modal
  const handleEditRoomImageDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    setEditRoomInputs(prev => ({ ...prev, roomImages: [...(prev.roomImages || []), ...files] }))
  }

  const handleEditRoomImageChange = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
    setEditRoomInputs(prev => ({ ...prev, roomImages: [...(prev.roomImages || []), ...files] }))
  }

  const removeEditRoomImage = (index) => {
    setEditRoomInputs(prev => ({
      ...prev,
      roomImages: prev.roomImages.filter((_, i) => i !== index)
    }))
  }

  // Handle add room submit
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault()
    if (!addRoomInputs.roomNumber || !addRoomInputs.roomType || !addRoomInputs.pricePerNight) {
      toast.error('Vui lòng nhập đầy đủ thông tin phòng!')
      return
    }
    setAddRoomLoading(true)
    try {
      const payload = addRoomInputs
      const mappedAmenities = Object.keys(payload.amenities).filter(k => payload.amenities[k])
      const send = {
        roomNumber: payload.roomNumber,
        roomType: payload.roomType,
        pricePerNight: payload.pricePerNight,
        roomArea: Number(payload.roomArea) || 0,
        maxAdults: Number(payload.maxAdults) || 0,
        maxChildren: Number(payload.maxChildren) || 0,
        discount: Number(payload.discount) || 0,
        bedsDetails: payload.bedsDetails,
        bathroomsDetails: payload.bathroomsDetails,
        amenities: mappedAmenities,
        hotelId: currentHotel._id
      }

      let res
      if (payload.roomImages && payload.roomImages.length > 0) {
        const form = new FormData()
        Object.entries(send).forEach(([k, v]) => form.append(k, typeof v === 'string' ? v : JSON.stringify(v)))
        payload.roomImages.forEach(f => form.append('images', f))
        res = await axios.post('/api/rooms', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        res = await axios.post('/api/rooms', send)
      }

      if (res?.data?.success || res?.status === 201) {
        toast.success(res.data?.message || 'Thêm phòng thành công')
        setAddRoomModal(false)
        if (currentHotel?._id) {
          await fetchHotelRooms(currentHotel._id)
        }
        // Reset form
        setAddRoomInputs({
          roomNumber: '',
          roomType: '',
          roomArea: '',
          maxAdults: '',
          maxChildren: '',
          pricePerNight: '',
          bedsDetails: {
            'Giường đơn': 0,
            'Giường đôi nhỏ': 0,
            'Giường đôi lớn vừa': 0,
            'Giường cỡ lớn': 0,
            'Giường siêu lớn': 0
          },
          bathroomsDetails: {
            'Tiêu chuẩn': 0,
            'Nâng cao': 0,
            'Cao cấp': 0,
            'Hạng sang': 0
          },
          amenities: {
            'Free WiFi': false,
            'Free Breakfast': false,
            'Room Service': false,
            'Mountain View': false,
            'Pool Access': false
          },
          roomImages: []
        })
      } else {
        toast.error(res?.data?.message || 'Không thể thêm phòng')
      }
    } catch (err) {
      console.error('Add room error:', err)
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi thêm phòng')
    } finally {
      setAddRoomLoading(false)
    }
  }

  const [deleteModal, setDeleteModal] = useState(false)
  const [hotelToDelete, setHotelToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const openEditModal = (hotel) => {
    setCurrentHotel(hotel)
    setEditInputs({
      name: hotel.name || '', address: hotel.address || '', contact: hotel.contact || '', city: hotel.city || '', description: hotel.description || '',
      images: hotel.images || [],
    })
    setEditModal(true)
    fetchHotelRooms(hotel._id)
  }

  const closeEditModal = () => {
    setEditModal(false)
    setCurrentHotel(null)
    setEditInputs({ name: '', address: '', contact: '', city: '' })
  }

  const openDeleteModal = (hotel) => {
    setHotelToDelete(hotel)
    setDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setDeleteModal(false)
    setHotelToDelete(null)
  }

  const handleDeleteHotel = async () => {
    if (!hotelToDelete) return
    setDeleteLoading(true)
    try {
      // Try owner-delete endpoint first (not implemented on server), fallback to admin route
      let res
      try {
        res = await axios.delete(`/api/hotels/${hotelToDelete._id}`)
      } catch (e) {
        res = await axios.delete(`/api/admin/hotels/${hotelToDelete._id}`)
      }
      if (res?.data?.success || res?.status === 200) {
        toast.success(res.data?.message || 'Xóa khách sạn thành công')
        closeDeleteModal()
        fetchHotels()
      } else {
        toast.error(res.data?.message || 'Không thể xóa khách sạn')
      }
    } catch (err) {
      console.error('Delete hotel error:', err)
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi xóa khách sạn')
    } finally {
      setDeleteLoading(false)
    }
  }
  const [isSaving, setIsSaving] = useState(false);

  const onEditSubmitHandler = async (e) => {
    e.preventDefault();
    if (!currentHotel) return;
    setEditLoading(true);

    try {
      let res;

      // 🔹 Tạo FormData để gửi lên (chỉ upload File mới, giữ URL cũ)
      const form = new FormData();
      form.append("name", editInputs.name || "");
      form.append("address", editInputs.address || "");
      form.append("contact", editInputs.contact || "");
      form.append("city", editInputs.city || "");
      form.append("description", editInputs.description || "");

      // 🖼️ Lọc ảnh mới và ảnh cũ
      const existingUrls = []; // ảnh cũ (string URL)
      const newFiles = []; // ảnh mới (File object)

      if (Array.isArray(editInputs.images)) {
        editInputs.images.forEach((img) => {
          if (img instanceof File) {
            newFiles.push(img);
          } else if (typeof img === "string") {
            existingUrls.push(img);
          }
        });
      }

      // Gửi URL ảnh cũ (để backend giữ lại)
      form.append("images", JSON.stringify(existingUrls));

      // Gửi ảnh mới (nếu có)
      newFiles.forEach((file) => {
        form.append("images", file);
      });

      // 🔁 Gửi request: ưu tiên /api/hotels/, fallback /api/admin/
      try {
        res = await axios.put(`/api/hotels/${currentHotel._id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (e) {
        res = await axios.put(`/api/admin/hotels/${currentHotel._id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      //  Kết quả
      if (res?.data?.success || res?.status === 200) {
        toast.success(res.data?.message || "Cập nhật khách sạn thành công!");
        closeEditModal();
        fetchHotels(); // refresh lại danh sách
      } else {
        toast.error(res.data?.message || "Không thể cập nhật khách sạn");
      }
    } catch (err) {
      console.error("Edit hotel error:", err);
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Lỗi khi cập nhật khách sạn"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const fetchHotelRooms = async (hotelId) => {
    try {
      const { data } = await axios.get(`/api/rooms/hotel/${hotelId}`);
      console.log("Rooms fetched from API:", data);

      // Xử lý cả hai dạng trả về: mảng trực tiếp hoặc object { success, rooms }
      const roomsData = Array.isArray(data)
        ? data
        : Array.isArray(data.rooms)
          ? data.rooms
          : [];

      console.log(" roomsData parsed:", roomsData);
      setHotelRooms(roomsData);
    } catch (error) {
      console.error("❌ Error fetching rooms:", error);
      setHotelRooms([]); // đảm bảo không undefined
    }
  };

  const toggleRoomAvailability = async (roomId) => {
    try {
      const { data } = await axios.post('/api/rooms/toggle-availability', { roomId })
      if (data.success) {
        toast.success(data.message)
        if (currentHotel) fetchHotelRooms(currentHotel._id)
      } else toast.error(data.message)
    } catch (err) {
      console.error('Toggle room availability error:', err)
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi cập nhật trạng thái phòng')
    }
  }

  const handleDeleteRoom = async (room) => {
    if (!room) return
    try {
      const { data } = await axios.delete(`/api/rooms/${room._id}`)
      if (data.success) {
        toast.success(data.message)
        if (currentHotel) fetchHotelRooms(currentHotel._id)
      } else toast.error(data.message)
    } catch (err) {
      console.error('Delete room error:', err)
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi xóa phòng')
    }
  }

  const openRoomEditModal = (room) => {
    if (!room) return;
    setCurrentRoomEdit(room);

    // ===== CHUYỂN bedsDetails (array) → object =====
    const bedObj = {};
    if (Array.isArray(room.bedsDetails)) {
      room.bedsDetails.forEach(b => {
        if (b.type) bedObj[b.type] = b.count || 0;
      });
    } else if (room.bedsDetails && typeof room.bedsDetails === "object") {
      Object.keys(room.bedsDetails).forEach(k => bedObj[k] = room.bedsDetails[k] || 0);
    }

    // ===== CHUYỂN bathroomsDetails (array) → object =====
    const bathObj = {};
    if (Array.isArray(room.bathroomsDetails)) {
      room.bathroomsDetails.forEach(b => {
        if (b.type) bathObj[b.type] = b.count || 0;
      });
    } else if (room.bathroomsDetails && typeof room.bathroomsDetails === "object") {
      Object.keys(room.bathroomsDetails).forEach(k => bathObj[k] = room.bathroomsDetails[k] || 0);
    }

    // ===== Build amenities object =====
    const amenitiesObj = {};
    Object.keys(editRoomInputs.amenities).forEach(key => {
      amenitiesObj[key] = (Array.isArray(room.amenities)
        ? room.amenities
        : typeof room.amenities === "string"
          ? room.amenities.split(",").map(a => a.trim())
          : []
      ).includes(key);
    });

    // ===== Thiết lập form =====
    setEditRoomInputs({
      roomNumber: room.roomNumber || "",
      roomType: room.roomType || "",
      roomArea: room.roomArea || "",
      maxAdults: room.maxAdults || "",
      maxChildren: room.maxChildren || "",
      pricePerNight: room.pricePerNight || "",
      bedsDetails: bedObj,
      bathroomsDetails: bathObj,
      amenities: amenitiesObj,
      roomImages: room.roomImages || []
    });

    setEditRoomModal(true);
  };

  const closeRoomEditModal = () => {
    setEditRoomModal(false)
    setCurrentRoomEdit(null)
    setRoomEditInputs({ roomNumber: '', name: '', type: '', price: '', guests: 1 })
    setRoomBedCounts({})
    setRoomBathroomCounts({})
    setRoomAmenities([])
    setRoomEditImages([])
    setRoomExistingImages([])
    setRoomEditLoading(false)
  }

  const handleRoomImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    setRoomEditImages(prev => [...prev, ...files])
  }

  const removeRoomImage = (index) => {
    setRoomEditImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingRoomImage = (idx) => {
    setRoomExistingImages(prev => prev.filter((_, i) => i !== idx))
  }

  const changeBedCount = (key, delta) => {
    setRoomBedCounts(prev => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) + delta) }))
  }

  const changeBathCount = (key, delta) => {
    setRoomBathroomCounts(prev => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) + delta) }))
  }

  const toggleRoomAmenity = (amen) => {
    setRoomAmenities(prev => prev.includes(amen) ? prev.filter(a => a !== amen) : [...prev, amen])
  }

  const handleRoomEditSubmit = async (e) => {
    e.preventDefault()
    if (!currentRoomEdit) return
    setRoomEditLoading(true)
    try {
      const payload = {
        roomNumber: roomEditInputs.roomNumber,
        name: roomEditInputs.name,
        type: roomEditInputs.type,
        price: roomEditInputs.price,
        guests: roomEditInputs.guests,
        bedsDetails: Object.entries(roomBedCounts).map(([k, v]) => ({ type: k, count: v })),
        bathroomDetails: Object.entries(roomBathroomCounts).map(([k, v]) => ({ type: k, count: v })),
        amenities: roomAmenities,
        existingImages: roomExistingImages
      }

      let res
      if (roomEditImages.length > 0) {
        const form = new FormData()
        Object.entries(payload).forEach(([k, v]) => form.append(k, typeof v === 'string' ? v : JSON.stringify(v)))
        roomEditImages.forEach(file => form.append('images', file))
        res = await axios.put(`/api/rooms/${currentRoomEdit._id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        res = await axios.put(`/api/rooms/${currentRoomEdit._id}`, payload)
      }

      if (res?.data?.success || res?.status === 200) {
        toast.success(res.data?.message || 'Cập nhật phòng thành công')
        closeRoomEditModal()
        if (currentHotel) fetchHotelRooms(currentHotel._id)
      } else {
        toast.error(res?.data?.message || 'Không thể cập nhật phòng')
      }
    } catch (err) {
      console.error('Edit room error:', err)
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi cập nhật phòng')
    } finally {
      setRoomEditLoading(false)
    }
  }

  const toggleHotelStatus = async (hotelId) => {
    try {
      // admin route exists for toggling status
      const { data } = await axios.patch(`/api/admin/hotels/${hotelId}/toggle-status`)
      if (data.success) {
        toast.success(data.message)
        fetchHotels()
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      console.error('Toggle hotel status error:', err)
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi cập nhật trạng thái')
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-white min-h-screen">
      <Title
        title="🏨 Quản lý phòng"
        subTitle="Thêm khách sạn mới hoặc quản lý các phòng thuộc khách sạn của bạn."
        align="left"
      />

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 mt-4">

        <div className="flex items-center gap-2">
          <FaSortAmountDownAlt className="text-gray-500" />
          <span className="text-sm font-medium">Sắp xếp:</span>
          <select
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm"
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
          >
            <option value="">-- Chọn --</option>
            <option value="name">Tên A-Z</option>
            <option value="city">Theo thành phố</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/owner/add-room')}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
          >
            ➕ Thêm khách sạn
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-colors ${viewMode === 'list' ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}
              title="Dạng danh sách"
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}
              title="Dạng lưới"
            >
              <FaTh />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-r-transparent rounded-full mb-4"></div>
          <p className="text-gray-500">Đang tải danh sách khách sạn...</p>
        </div>
      ) : hotels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Chưa có khách sạn nào được đăng ký</p>
          <button
            onClick={() => setShowHotelReg(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Đăng ký khách sạn
          </button>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key={`grid-${page}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {paginated.map((hotel, index) => (
                  <motion.div
                    key={hotel._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    <CardHotel hotel={hotel} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`list-${page}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {paginated.map((hotel, index) => (
                  <motion.div
                    key={hotel._id || index}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    <CardHotelList hotel={hotel} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-sm disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
              >
                ←
              </button>

              {Array.from({ length: maxPage }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`px-3 py-1 rounded text-sm border ${p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-sm disabled:opacity-50"
                disabled={page === maxPage}
                onClick={() => setPage(p => Math.min(p + 1, maxPage))}
              >
                →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Chỉnh sửa khách sạn</h3>
                <button onClick={closeEditModal} className="p-2 text-gray-500 hover:text-gray-700"><FaTimes /></button>
              </div>

              <form onSubmit={onEditSubmitHandler} className="space-y-6">
                {/* Upload ảnh khách sạn */}
                <div className="border-2 border-dashed border-indigo-300 rounded-md p-4 text-center hover:bg-indigo-50 transition cursor-pointer">
                  <p className="text-sm text-gray-500">Kéo thả ảnh hoặc chọn ảnh khách sạn</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="editHotelImages"
                    className="hidden"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      setEditInputs((prev) => ({
                        ...prev,
                        images: [...(prev.images || []), ...newFiles], // 👈 nối ảnh mới vào sau ảnh cũ
                      }));
                    }}

                  />
                  <label
                    htmlFor="editHotelImages"
                    className="text-indigo-600 font-medium cursor-pointer block mt-2"
                  >
                    Chọn ảnh
                  </label>
                </div>

                {/* Hiển thị preview ảnh */}
                {Array.isArray(editInputs.images) && editInputs.images.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-2">
                    {editInputs.images.map((file, i) => (
                      <div key={i} className="relative w-24 h-24 rounded overflow-hidden shadow">
                        <img
                          src={file instanceof File ? URL.createObjectURL(file) : file}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditInputs({
                              ...editInputs,
                              images: editInputs.images.filter((_, idx) => idx !== i),
                            })
                          }
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
                        >
                          <FaTimes className="text-red-500 text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}


                {/* Thông tin khách sạn */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm text-gray-600">Tên khách sạn</label>
                    <input
                      value={editInputs.name}
                      onChange={(e) =>
                        setEditInputs({ ...editInputs, name: e.target.value })
                      }
                      className="mt-1 w-full border rounded p-2"
                      placeholder="Nhập tên khách sạn"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Thành phố</label>
                    <select
                      value={editInputs.city}
                      onChange={(e) =>
                        setEditInputs({ ...editInputs, city: e.target.value })
                      }
                      className="mt-1 w-full border rounded p-2"
                    >
                      <option value="">-- Chọn --</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                      <option value="Hà Tĩnh">Hà Tĩnh</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Địa chỉ</label>
                  <input
                    value={editInputs.address}
                    onChange={(e) =>
                      setEditInputs({ ...editInputs, address: e.target.value })
                    }
                    className="mt-1 w-full border rounded p-2"
                    placeholder="Nhập địa chỉ chi tiết"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Liên hệ</label>
                  <input
                    value={editInputs.contact}
                    onChange={(e) =>
                      setEditInputs({ ...editInputs, contact: e.target.value })
                    }
                    className="mt-1 w-full border rounded p-2"
                    placeholder="Số điện thoại hoặc email"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Mô tả</label>
                  <textarea
                    value={editInputs.description || ''}
                    onChange={(e) =>
                      setEditInputs({ ...editInputs, description: e.target.value })
                    }
                    className="mt-1 w-full border rounded p-2 min-h-[80px]"
                    placeholder="Mô tả chi tiết khách sạn"
                  />
                </div>

                {/* Danh sách phòng đã thêm */}
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-semibold text-gray-800">🛏️ Danh sách phòng đã thêm</h4>
                    <button
                      type="button"
                      onClick={() => setAddRoomModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      ➕ Thêm phòng
                    </button>
                  </div>

                  {roomsLoading ? (
                    <p className="text-gray-500 italic">Đang tải phòng...</p>
                  ) : hotelRooms.length === 0 ? (
                    <p className="text-gray-500 italic">Chưa có phòng nào</p>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {hotelRooms.map((room, index) => (
                        <RoomCard
                          key={room._id || index}
                          room={room}
                          index={index}
                          editRoom={() => openRoomEditModal(room)} // dùng hàm đã có sẵn trong ListRoom.jsx
                          removeRoomFromList={() => handleDeleteRoom(room)} // cũng có sẵn
                          facilityLabels={{
                            'Free WiFi': 'Wi-Fi miễn phí',
                            'Free Breakfast': 'Bữa sáng miễn phí',
                            'Room Service': 'Dịch vụ phòng',
                            'Mountain View': 'Nhìn ra núi',
                            'Pool Access': 'Hồ bơi'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>


                {/* Nút lưu / hủy */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                  >
                    {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}

                  </button>
                </div>
              </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2">Xác nhận xóa khách sạn</h3>
                <p className="text-gray-600 mb-4">Bạn có chắc chắn muốn xóa "{hotelToDelete?.name}"? Hành động này không thể hoàn tác.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={closeDeleteModal} disabled={deleteLoading} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Không</button>
                <button onClick={handleDeleteHotel} disabled={deleteLoading} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700">{deleteLoading ? 'Đang xóa...' : 'Xóa'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Edit Modal */}
      <AnimatePresence>
        {editRoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Chỉnh sửa phòng</h3>
                <button onClick={closeRoomEditModal} className="p-2 text-gray-500 hover:text-gray-700"><FaTimes /></button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault()
                if (!currentRoomEdit) return
                setRoomEditLoading(true)
                try {
                  const payload = editRoomInputs
                  const mappedAmenities = Object.keys(payload.amenities).filter(k => payload.amenities[k])

                  // Separate existing images (strings) and new images (Files)
                  const existingImages = [];
                  const newImages = [];
                  if (Array.isArray(payload.roomImages)) {
                    payload.roomImages.forEach(img => {
                      if (typeof img === 'string') {
                        existingImages.push(img);
                      } else if (img instanceof File) {
                        newImages.push(img);
                      }
                    });
                  }

                  const send = {
                    roomNumber: payload.roomNumber,
                    roomType: payload.roomType,
                    pricePerNight: payload.pricePerNight,
                    roomArea: Number(payload.roomArea) || 0,
                    maxAdults: Number(payload.maxAdults) || 0,
                    maxChildren: Number(payload.maxChildren) || 0,
                    discount: Number(payload.discount) || 0,
                    bedsDetails: payload.bedsDetails,
                    bathroomsDetails: payload.bathroomsDetails,
                    amenities: mappedAmenities,
                    existingImages: existingImages,
                    hotelId: currentHotel._id
                  }

                  let res
                  if (newImages.length > 0) {
                    const form = new FormData()
                    Object.entries(send).forEach(([k, v]) => form.append(k, typeof v === 'string' ? v : JSON.stringify(v)))
                    newImages.forEach(f => form.append('images', f))
                    res = await axios.put(`/api/rooms/${currentRoomEdit._id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
                  } else {
                    res = await axios.put(`/api/rooms/${currentRoomEdit._id}`, send)
                  }

                  if (res?.data?.success || res?.status === 200) {
                    toast.success(res.data?.message || 'Cập nhật phòng thành công')
                    closeRoomEditModal()
                    if (currentHotel) fetchHotelRooms(currentHotel._id)
                  } else {
                    toast.error(res?.data?.message || 'Không thể cập nhật phòng')
                  }
                } catch (err) {
                  console.error('Edit room error:', err)
                  toast.error(err.response?.data?.message || err.message || 'Lỗi khi cập nhật phòng')
                } finally {
                  setRoomEditLoading(false)
                }
              }} className="space-y-6">
                {/* Trường nhập phòng */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <input
                    type="text"
                    placeholder="Số phòng"
                    value={editRoomInputs.roomNumber}
                    onChange={(e) => setEditRoomInputs({ ...editRoomInputs, roomNumber: e.target.value })}
                    className="border p-2 rounded"
                  />
                  <select
                    value={editRoomInputs.roomType}
                    onChange={(e) => setEditRoomInputs({ ...editRoomInputs, roomType: e.target.value })}
                    className="border p-2 rounded"
                  >
                    <option value="">-- Loại phòng --</option>
                    <option value="Giường đơn">Giường đơn</option>
                    <option value="Giường đôi">Giường đôi</option>
                    <option value="Phòng cao cấp">Phòng cao cấp</option>
                    <option value="Phòng gia đình">Phòng gia đình</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Giá / đêm"
                    value={editRoomInputs.pricePerNight}
                    onChange={(e) => setEditRoomInputs({ ...editRoomInputs, pricePerNight: e.target.value })}
                    className="border p-2 rounded"
                  />
                </div>

                {/* Diện tích & số lượng khách tối đa */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Diện tích phòng (m²)"
                    value={editRoomInputs.roomArea || ''}
                    onChange={(e) => setEditRoomInputs({ ...editRoomInputs, roomArea: e.target.value })}
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Người lớn (max)"
                    value={editRoomInputs.maxAdults}
                    onChange={(e) => setEditRoomInputs({ ...editRoomInputs, maxAdults: e.target.value })}
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Trẻ em (max)"
                    value={editRoomInputs.maxChildren}
                    onChange={(e) => setEditRoomInputs({ ...editRoomInputs, maxChildren: e.target.value })}
                    className="border p-2 rounded"
                  />
                </div>

                {/* Giảm giá */}
                <div className="mt-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Giảm giá (%)"
                    value={editRoomInputs.discount}
                    onChange={(e) => setEditRoomInputs({ ...editRoomInputs, discount: e.target.value })}
                    className="border p-2 rounded w-full"
                  />
                </div>



                {/* Tiện nghi */}
                <p className="mt-6 mb-2 font-semibold text-gray-700">Tiện nghi</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(editRoomInputs.amenities).map((a, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 bg-gray-50 border p-2 rounded cursor-pointer hover:bg-indigo-50"
                    >
                      <input
                        type="checkbox"
                        checked={editRoomInputs.amenities[a]}
                        onChange={() =>
                          setEditRoomInputs(prev => ({ ...prev, amenities: { ...prev.amenities, [a]: !prev.amenities[a] } }))
                        }
                      />
                      <span className="text-indigo-600">{amenityIcons[a]}</span>
                      <span className="text-sm">{facilityLabels[a]}</span>
                    </label>
                  ))}
                </div>

                {/* Ảnh riêng cho từng phòng */}
                <p className="mt-6 mb-2 font-semibold text-gray-700">Ảnh của phòng</p>
                <div
                  onDrop={handleEditRoomImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-indigo-300 rounded-md p-4 text-center cursor-pointer hover:bg-indigo-50"
                >
                  <p className="text-sm text-gray-500">Kéo thả ảnh hoặc chọn ảnh phòng</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditRoomImageChange}
                    className="hidden"
                    id="editRoomImageInput"
                  />
                  <label htmlFor="editRoomImageInput" className="text-indigo-600 cursor-pointer font-medium mt-2 block">
                    Chọn ảnh
                  </label>
                </div>

                {/* Hiển thị preview ảnh phòng */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {editRoomInputs.roomImages?.map((img, i) => (
                    <div key={i} className="relative w-24 h-24 rounded overflow-hidden shadow">
                      <img src={img instanceof File ? URL.createObjectURL(img) : img} alt="room" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeEditRoomImage(i)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
                      >
                        <FaTimes className="text-red-500 text-xs" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Nút submit */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeRoomEditModal}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={roomEditLoading}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                  >
                    {roomEditLoading ? 'Đang cập nhật...' : 'Cập nhật phòng'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Room Modal */}
      <AnimatePresence>
        {addRoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Thêm phòng mới</h3>
                <button onClick={() => setAddRoomModal(false)} className="p-2 text-gray-500 hover:text-gray-700"><FaTimes /></button>
              </div>

              <form onSubmit={handleAddRoomSubmit} className="space-y-6">
                {/* Trường nhập phòng */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <input
                    type="text"
                    placeholder="Số phòng"
                    value={addRoomInputs.roomNumber}
                    onChange={(e) => setAddRoomInputs({ ...addRoomInputs, roomNumber: e.target.value })}
                    className="border p-2 rounded"
                  />
                  <select
                    value={addRoomInputs.roomType}
                    onChange={(e) => setAddRoomInputs({ ...addRoomInputs, roomType: e.target.value })}
                    className="border p-2 rounded"
                  >
                    <option value="">-- Loại phòng --</option>
                    <option value="Giường đơn">Giường đơn</option>
                    <option value="Giường đôi">Giường đôi</option>
                    <option value="Phòng cao cấp">Phòng cao cấp</option>
                    <option value="Phòng gia đình">Phòng gia đình</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Giá / đêm"
                    value={addRoomInputs.pricePerNight}
                    onChange={(e) => setAddRoomInputs({ ...addRoomInputs, pricePerNight: e.target.value })}
                    className="border p-2 rounded"
                  />
                </div>

                {/* Diện tích & số lượng khách tối đa */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Diện tích phòng (m²)"
                    value={addRoomInputs.roomArea || ''}
                    onChange={(e) => setAddRoomInputs({ ...addRoomInputs, roomArea: e.target.value })}
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Người lớn (max)"
                    value={addRoomInputs.maxAdults}
                    onChange={(e) => setAddRoomInputs({ ...addRoomInputs, maxAdults: e.target.value })}
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Trẻ em (max)"
                    value={addRoomInputs.maxChildren}
                    onChange={(e) => setAddRoomInputs({ ...addRoomInputs, maxChildren: e.target.value })}
                    className="border p-2 rounded"
                  />
                </div>

                {/* Giảm giá */}
                <div className="mt-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Giảm giá (%)"
                    value={addRoomInputs.discount}
                    onChange={(e) => setAddRoomInputs({ ...addRoomInputs, discount: e.target.value })}
                    className="border p-2 rounded w-full"
                  />
                </div>



                {/* Tiện nghi */}
                <p className="mt-6 mb-2 font-semibold text-gray-700">Tiện nghi</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(addRoomInputs.amenities).map((a, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 bg-gray-50 border p-2 rounded cursor-pointer hover:bg-indigo-50"
                    >
                      <input
                        type="checkbox"
                        checked={addRoomInputs.amenities[a]}
                        onChange={() =>
                          setAddRoomInputs(prev => ({ ...prev, amenities: { ...prev.amenities, [a]: !prev.amenities[a] } }))
                        }
                      />
                      <span className="text-indigo-600">{amenityIcons[a]}</span>
                      <span className="text-sm">{facilityLabels[a]}</span>
                    </label>
                  ))}
                </div>

                {/* Ảnh riêng cho từng phòng */}
                <p className="mt-6 mb-2 font-semibold text-gray-700">Ảnh của phòng</p>
                <div
                  onDrop={handleAddRoomImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-indigo-300 rounded-md p-4 text-center cursor-pointer hover:bg-indigo-50"
                >
                  <p className="text-sm text-gray-500">Kéo thả ảnh hoặc chọn ảnh phòng</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAddRoomImageChange}
                    className="hidden"
                    id="roomImageInput"
                  />
                  <label htmlFor="roomImageInput" className="text-indigo-600 cursor-pointer font-medium mt-2 block">
                    Chọn ảnh
                  </label>
                </div>

                {/* Hiển thị preview ảnh phòng */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {addRoomInputs.roomImages?.map((img, i) => (
                    <div key={i} className="relative w-24 h-24 rounded overflow-hidden shadow">
                      <img src={URL.createObjectURL(img)} alt="room" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAddRoomImage(i)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
                      >
                        <FaTimes className="text-red-500 text-xs" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Nút submit */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setAddRoomModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={addRoomLoading}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                  >
                    {addRoomLoading ? 'Đang thêm...' : 'Thêm phòng'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default Listroom
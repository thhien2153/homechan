import React, { useState, useEffect, useRef } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../conext/AppContext'
import toast from 'react-hot-toast'
import facilityLabels from '../facilityLabels'
import { suggestRoomPrice } from '../../ai/suggestPrice'
import {
  FaWifi, FaCoffee, FaConciergeBell, FaMountain, FaSwimmingPool, FaTimes, FaTrash, FaEdit
} from 'react-icons/fa'
import { AnimatePresence, motion } from 'framer-motion'

const amenityIcons = {
  'Free WiFi': <FaWifi />,
  'Free Breakfast': <FaCoffee />,
  'Room Service': <FaConciergeBell />,
  'Mountain View': <FaMountain />,
  'Pool Access': <FaSwimmingPool />
}

// ================== COMPONENT HIỂN THỊ THẺ PHÒNG ==================
const RoomCard = ({ room, index, editRoom, removeRoomFromList, facilityLabels }) => {
  const [currentImage, setCurrentImage] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const images =
    room.roomImages?.map(file => (file instanceof File ? URL.createObjectURL(file) : (file.startsWith('http') ? file : `http://localhost:3000${file.replace('.', '')}`))) || []

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


const Addroom = () => {
  const { axios, getToken, refreshRooms } = useAppContext()





  useEffect(() => {
    // mount debug to detect duplicate mounts (React StrictMode may mount twice in dev)
    // eslint-disable-next-line no-console
    console.debug('AddRoom component mounted')
  }, [])

  // Prevent handler re-entrancy (extra safety beyond `loading`) to avoid double submits
  const submitLock = useRef(false)

  const [images, setImages] = useState([])
  const [roomsList, setRoomsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [editIndex, setEditIndex] = useState(null) // index của phòng đang edit, null nếu thêm mới

  const [inputs, setInputs] = useState({
    hotelName: '',
    hotelDescription: '',
    hotelAddress: '',
    contact: '',
    city: '',
    roomNumber: '',
    roomType: '',
    roomArea: '',
    // new fields: maximum guests
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
    }
  })

  // Auto-suggest price when room type is selected
  useEffect(() => {
    if (inputs.roomType) {
      try {
        const result = suggestRoomPrice(inputs);
        setInputs(prev => ({
          ...prev,
          pricePerNight: result.price
        }));
        toast.success(`🤖 AI đề xuất: ${result.price.toLocaleString()}₫/đêm`);
      } catch (error) {
        console.error('Error in AI price suggestion:', error);
        toast.error('Lỗi khi gợi ý giá AI');
      }
    }
  }, [inputs.roomType])

  // ----- Image handlers -----
  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    setImages(prev => [...prev, ...files])
  }
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'))
    setImages(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // ----- Add or Update room -----
  const addRoomToList = () => {
    const { roomNumber, roomType, pricePerNight } = inputs
    if (!roomNumber || !roomType || !pricePerNight) {
      toast.error('Vui lòng nhập đầy đủ thông tin phòng!')
      return
    }

    const newRoom = {
      roomNumber,
      roomType,
      pricePerNight,
      discount: Number(inputs.discount) || 0,
      roomArea: Number(inputs.roomArea) || 0,
      maxAdults: Number(inputs.maxAdults) || 0,
      maxChildren: Number(inputs.maxChildren) || 0,
      bedsDetails: { ...inputs.bedsDetails },
      bathroomsDetails: { ...inputs.bathroomsDetails },
      amenities: Object.keys(inputs.amenities).filter(k => inputs.amenities[k]),
      roomImages: inputs.roomImages || []
    }

    if (editIndex !== null && editIndex >= 0 && editIndex < roomsList.length) {
      // cập nhật phòng
      const updated = [...roomsList]
      updated[editIndex] = newRoom
      setRoomsList(updated)
      toast.success('Đã cập nhật phòng!')
      setEditIndex(null)

    } else {
      // thêm mới
      setRoomsList(prev => [...prev, newRoom])
      toast.success('Đã thêm phòng vào danh sách!')
    }

    // Reset phần thông tin phòng (không reset thông tin khách sạn và ảnh)
    setInputs(prev => ({
      ...prev,
      roomNumber: '',
      roomType: '',
      pricePerNight: '',
      discount: '',
      roomArea: '',
      maxAdults: '',
      maxChildren: '',
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
      roomImages: [],


    }))
  }

  // ----- Remove room -----
  const removeRoomFromList = (index) => {
    setRoomsList(prev => prev.filter((_, i) => i !== index))
    // nếu đang sửa phòng bị xóa, hủy edit
    if (editIndex === index) {
      setEditIndex(null)
      // reset form phòng
      setInputs(prev => ({
        ...prev,
        roomNumber: '',
        roomType: '',
        pricePerNight: '',
        discount: '',
        maxAdults: '',
        maxChildren: '',
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
        }
      }))
    } else if (editIndex !== null && editIndex > index) {
      // adjust editIndex nếu xóa 1 phòng trước index đang edit
      setEditIndex(prev => prev - 1)
    }
    toast.success('Đã xóa phòng khỏi danh sách!')
  }

  // ----- Edit room: nạp dữ liệu phòng lên form -----
  const editRoom = (index) => {
    const room = roomsList[index]
    if (!room) return
    // Build amenities object: giữ tất cả keys, set true với những amenity có trong room.amenities
    const amenitiesObj = {}
    Object.keys(inputs.amenities).forEach(key => {
      amenitiesObj[key] = room.amenities.includes(key)
    })

    setInputs(prev => ({
      ...prev,
      roomNumber: room.roomNumber || '',
      roomType: room.roomType || '',
      pricePerNight: room.pricePerNight || '',
      maxAdults: room.maxAdults ?? '',
      maxChildren: room.maxChildren ?? '',
      bedsDetails: { ...room.bedsDetails },
      bathroomsDetails: { ...room.bathroomsDetails },
      amenities: amenitiesObj,
      roomImages: room.roomImages || []
    }))
    setEditIndex(index)
    toast('Đang chỉnh sửa phòng')
  }

  // ----- Submit hotel with rooms -----
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (submitLock.current) return;
    submitLock.current = true;
    if (loading) { submitLock.current = false; return; }
    setLoading(true);

    if (!inputs.hotelName || !inputs.hotelAddress || !inputs.contact || !inputs.city) {
      toast.error('Vui lòng nhập đầy đủ thông tin khách sạn!');
      setLoading(false);
      submitLock.current = false;
      return;
    }

    if (roomsList.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 phòng!');
      setLoading(false);
      submitLock.current = false;
      return;
    }

    try {
      const formData = new FormData();
      formData.append('hotelName', inputs.hotelName);
      formData.append('hotelDescription', inputs.hotelDescription);
      formData.append('hotelAddress', inputs.hotelAddress);
      formData.append('contact', inputs.contact);
      formData.append('city', inputs.city);
      formData.append('rooms', JSON.stringify(roomsList));

      // --- Ảnh khách sạn ---
      images.forEach((img) => formData.append('images', img));

      // --- Ảnh của từng phòng ---
      roomsList.forEach((room, i) => {
        if (Array.isArray(room.roomImages)) {
          room.roomImages.forEach((file, j) => {
            if (file instanceof File) {
              formData.append(`roomImages_${i}_${j}`, file);
            }
          });
        }
      });

      const { data } = await axios.post('/api/rooms/', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        toast.success('Thêm khách sạn thành công!');
        refreshRooms();
        setImages([]);
        setRoomsList([]);
        setInputs({
          hotelName: '',
          hotelDescription: '',
          hotelAddress: '',
          contact: '',
          city: '',
          roomNumber: '',
          roomType: '',
          pricePerNight: '',
          roomArea: '',
          maxAdults: '',
          maxChildren: '',
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
        });
        setEditIndex(null);
      } else {
        toast.error(data.message || 'Lỗi khi thêm khách sạn!');
      }
    } catch (err) {
      console.error('Error creating hotel+rooms:', err);
      toast.error('Lỗi khi thêm khách sạn!');
    } finally {
      setLoading(false);
      submitLock.current = false;
    }
  };


  // ----- Cancel editing (nút Hủy) -----
  const cancelEdit = () => {
    setEditIndex(null)
    setInputs(prev => ({
      ...prev,
      roomNumber: '',
      roomType: '',
      pricePerNight: '',
      maxAdults: '',
      maxChildren: '',
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
      }
    }))
  }

  return (
    <motion.form
      onSubmit={onSubmitHandler}
      className="p-6 bg-white rounded-xl shadow max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title
        title="🏨 Thêm khách sạn & phòng"
        subTitle="Điền thông tin khách sạn và các phòng bên dưới."
        align="center"
      />

      {/* Upload ảnh khách sạn */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-indigo-300 rounded-md p-4 mt-6 text-center cursor-pointer hover:bg-indigo-50"
      >
        <p className="text-sm text-gray-500">Kéo thả ảnh hoặc chọn ảnh từ máy</p>
        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="imageInput" />
        <label htmlFor="imageInput" className="text-indigo-600 cursor-pointer font-medium mt-2 block">
          Chọn ảnh
        </label>
      </div>

      {/* Hiển thị preview ảnh */}
      <div className="flex flex-wrap gap-4 mt-4">
        <AnimatePresence>
          {images.map((img, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-24 h-24 rounded overflow-hidden shadow"
            >
              <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
              >
                <FaTimes className="text-red-500 text-xs" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Form thông tin khách sạn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div>
          <label className="text-sm text-gray-600">Tên khách sạn</label>
          <input
            type="text"
            value={inputs.hotelName}
            onChange={(e) => setInputs({ ...inputs, hotelName: e.target.value })}
            className="mt-1 w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Tỉnh / Thành phố</label>
          <select
            value={inputs.city}
            onChange={(e) => setInputs({ ...inputs, city: e.target.value })}
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

      <div className="mt-4">
        <label className="text-sm text-gray-600">Địa chỉ</label>
        <input
          type="text"
          value={inputs.hotelAddress}
          onChange={(e) => setInputs({ ...inputs, hotelAddress: e.target.value })}
          className="mt-1 w-full border rounded p-2"
        />
      </div>

      <div className="mt-4">
        <label className="text-sm text-gray-600">Liên hệ (số điện thoại / email)</label>
        <input
          type="text"
          value={inputs.contact}
          onChange={(e) => setInputs({ ...inputs, contact: e.target.value })}
          className="mt-1 w-full border rounded p-2"
          placeholder="Số điện thoại hoặc email liên hệ"
        />
      </div>



      <div className="mt-4">
        <label className="text-sm text-gray-600">Mô tả</label>
        <textarea
          value={inputs.hotelDescription}
          onChange={(e) => setInputs({ ...inputs, hotelDescription: e.target.value })}
          className="mt-1 w-full border rounded p-2 min-h-[80px]"
        />
      </div>

      {/* ========== FORM THÊM PHÒNG ========== */}
      <div className="flex items-center justify-between mt-8">
        <h4 className="text-lg font-semibold">🛏️ Thông tin phòng</h4>
        <div className="flex items-center gap-2">
          {editIndex !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-300 text-gray-800 px-3 py-2 rounded hover:bg-gray-200 transition"
            >
              Hủy
            </button>
          )}
          <button
            type="button"
            onClick={addRoomToList}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            {editIndex !== null ? 'Lưu thay đổi' : '+ Thêm phòng'}
          </button>
        </div>
      </div>

      {/* Trường nhập phòng */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <input
          type="text"
          placeholder="Số phòng"
          value={inputs.roomNumber}
          onChange={(e) => setInputs({ ...inputs, roomNumber: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={inputs.roomType}
          onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
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
          value={inputs.pricePerNight}
          onChange={(e) => setInputs({ ...inputs, pricePerNight: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      {/* Diện tích & số lượng khách tối đa */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
        <input
          type="number"
          min="0"
          placeholder="Diện tích phòng (m²)"
          value={inputs.roomArea || ''}
          onChange={(e) => setInputs({ ...inputs, roomArea: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          min="0"
          placeholder="Người lớn (max)"
          value={inputs.maxAdults}
          onChange={(e) => setInputs({ ...inputs, maxAdults: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          min="0"
          placeholder="Trẻ em (max)"
          value={inputs.maxChildren}
          onChange={(e) => setInputs({ ...inputs, maxChildren: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      {/* Giảm giá */}
      <div className="mt-4">
        <input
          type="number"
          placeholder="Giảm giá (%)"
          value={inputs.discount}
          onChange={(e) => setInputs({ ...inputs, discount: e.target.value })}
          className="border p-2 rounded w-full"
          min="0"
          max="100"
        />
      </div>

      {/* Tiện nghi */}
      <p className="mt-6 mb-2 font-semibold text-gray-700">Tiện nghi</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.keys(inputs.amenities).map((a, i) => (
          <label
            key={i}
            className="flex items-center gap-2 bg-gray-50 border p-2 rounded cursor-pointer hover:bg-indigo-50"
          >
            <input
              type="checkbox"
              checked={inputs.amenities[a]}
              onChange={() =>
                setInputs(prev => ({ ...prev, amenities: { ...prev.amenities, [a]: !prev.amenities[a] } }))
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
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
          setInputs(prev => ({ ...prev, roomImages: [...(prev.roomImages || []), ...files] }));
        }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-indigo-300 rounded-md p-4 text-center cursor-pointer hover:bg-indigo-50"
      >
        <p className="text-sm text-gray-500">Kéo thả ảnh hoặc chọn ảnh phòng</p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
            setInputs(prev => ({ ...prev, roomImages: [...(prev.roomImages || []), ...files] }));
          }}
          className="hidden"
          id="roomImageInput"
        />
        <label htmlFor="roomImageInput" className="text-indigo-600 cursor-pointer font-medium mt-2 block">
          Chọn ảnh
        </label>
      </div>

      {/* Hiển thị preview ảnh phòng */}
      <div className="flex flex-wrap gap-4 mt-4">
        {inputs.roomImages?.map((img, i) => (
          <div key={i} className="relative w-24 h-24 rounded overflow-hidden shadow">
            <img src={URL.createObjectURL(img)} alt="room" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() =>
                setInputs(prev => ({
                  ...prev,
                  roomImages: prev.roomImages.filter((_, idx) => idx !== i)
                }))
              }
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
            >
              <FaTimes className="text-red-500 text-xs" />
            </button>
          </div>
        ))}
      </div>

      {/* Danh sách phòng đã thêm */}
      {roomsList.length > 0 && (
        <div className="mt-10">
          <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span role="img" aria-label="hotel">🏨</span> Danh sách phòng đã thêm
          </h4>

          <div className="flex flex-col gap-6">
            {roomsList.map((r, i) => (
              <RoomCard
                key={i}
                room={r}
                index={i}
                editRoom={editRoom}
                removeRoomFromList={removeRoomFromList}
                facilityLabels={facilityLabels}
              />
            ))}
          </div>
        </div>
      )}




      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.03 }}
        className="mt-10 bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700 flex items-center justify-center gap-2"
      >
        {loading ? 'Đang thêm...' : 'Thêm khách sạn mới'}
      </motion.button>
    </motion.form>
  )
}

export default Addroom

import React, { useState } from 'react'
import { assets, cities } from '../assets/assets'
import { useAppContext } from '../conext/AppContext'
import toast from 'react-hot-toast'
// gọi api để đăng ký  khách sạn mới 
const HotelReg = () => {
  const { setShowHotelReg, axios, getToken, setUser } = useAppContext()

  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [contact, setContact] = useState("")
  const [city, setCity] = useState("")

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault()
      const token = await getToken()
      const { data } = await axios.post(
        `/api/hotels/`,
        { name, contact, address, city },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      console.log("Phản hồi từ server:", data)

      if (data.success) {
        toast.success(data.message)
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
        setShowHotelReg(false)
      } else {
        toast.error(data.message || "Đăng ký không thành công")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Đã xảy ra lỗi")
    }
  }

  return (
    <div onClick={() => setShowHotelReg(false)} className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center justify-center bg-black/70'>
      <form onSubmit={onSubmitHandler} onClick={(e) => e.stopPropagation()} className='flex bg-white rounded-xl max-w-4xl max-md:mx-2'>
        <img src={assets.regImage} alt="reg-image" className='w-1/2 rounded-xl hidden md:block' />

        <div className='relative flex flex-col items-center md:w-1/2 p-8 md:p-10'>
          <img src={assets.closeIcon} alt="close-icon" className='absolute top-4 right-4 h-4 w-4 cursor-pointer' onClick={() => setShowHotelReg(false)} />
          <p className='text-2xl font-semibold mt-6'>Đăng kí khách sạn của bạn</p>

          <div className='w-full mt-4'>
            <label htmlFor="name" className='font-medium text-gray-500'>
              Tên khách sạn
            </label>
            <input id='name' onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder='Nhập tại đây' className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light' required />
          </div>

          <div className='w-full mt-4'>
            <label htmlFor="contact" className='font-medium text-gray-500'>
              Số điện thoại
            </label>
            <input onChange={(e) => setContact(e.target.value)} value={contact} id='contact' type="text" placeholder='Nhập tại đây' className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light' required />
          </div>

          <div className='w-full mt-4'>
            <label htmlFor="address" className='font-medium text-gray-500'>
              Địa chỉ
            </label>
            <input onChange={(e) => setAddress(e.target.value)} value={address} id='address' type="text" placeholder='Nhập tại đây' className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light' required />
          </div>

          <div className='w-full mt-4 max-w-60 mr-auto'>
            <label htmlFor="city" className='font-medium text-gray-500'>
              Tỉnh / Thành phố
            </label>
            <input
              type="text"
              list="cities"
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className='border border-gray-300 rounded-lg w-full px-3 py-2.5 mt-1 
               outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
               text-gray-700 placeholder-gray-400 font-light'
              placeholder="Nhập tên thành phố (ví dụ: Đà Nẵng, Hà Nội...)"
              autoComplete="off"
              required
            />

            <datalist id="cities">
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </datalist>
          </div>

          <button className='bg-indigo-500 hover:bg-indigo-600 transition-all text-white mr-auto px-6 py-2 rounded cursor-pointer mt-6'>
            Đăng kí
          </button>
        </div>
      </form>
    </div>
  )
}

export default HotelReg

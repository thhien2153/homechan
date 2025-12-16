import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [showHint, setShowHint] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const seed = encodeURIComponent(formData.username.trim());
      const image = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`; // dùng style avataaars

      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp");
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append("username", formData.username);
      data.append("fullname", formData.fullname);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("address", formData.address);
      data.append("password", formData.password);

      if (avatar) {
        data.append("avatar", avatar);
      }

      await axios.post('/api/auth/register', data, {
        headers: { "Content-Type": "multipart/form-data" }
      });


      Swal.fire({
        icon: 'success',
        title: 'Đăng ký thành công!',
        text: 'Chào mừng bạn đến với HOMECHAN',
        showConfirmButton: false,
        timer: 2000,
      });

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-50 flex items-center justify-center px-4"
    >
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl p-10">
        <h2 className="text-3xl font-bold text-center text-pink-700 mb-6 tracking-wide">
          Tạo tài khoản HOMECHAN
        </h2>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Username */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>

          {/* Fullname */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Họ và tên đầy đủ</label>
            <input
              type="text"
              name="fullname"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-gray-600 font-medium mb-1">Địa chỉ</label>
            <input
              type="text"
              name="address"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-gray-600 font-medium mb-1">Mật khẩu</label>
            <input
              type="password"
              name="password"
              required
              onFocus={() => setShowHint(true)}
              onBlur={() => setShowHint(false)}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 outline-none"
            />

            {showHint && (
              <div className="absolute top-full left-0 bg-white shadow-lg rounded-lg p-3 border mt-1 text-xs w-[250px] z-10">
                <p className="font-semibold mb-1 text-pink-600">Mật khẩu phải có:</p>
                <p>• Ít nhất 8 ký tự</p>
                <p>• Chữ hoa (A-Z)</p>
                <p>• Chữ thường (a-z)</p>
                <p>• Số (0-9)</p>
                <p>• Ký tự đặc biệt (!@#$%^&*)</p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>

          {/* Avatar */}
          <div className="md:col-span-2">
            <label className="block text-gray-600 font-medium mb-1">Ảnh đại diện</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setAvatar(e.target.files[0]);
              }}
              className="w-full px-3 py-2 border rounded-xl"
            />

            {avatar && (
              <img
                src={URL.createObjectURL(avatar)}
                alt="preview"
                className="mt-3 w-24 h-24 rounded-full object-cover border shadow-md"
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 transition-all duration-300 text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-[1.02]"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <a href="/login" className="text-pink-600 font-medium hover:underline">
            Đăng nhập ngay
          </a>
        </p>
      </div>
    </motion.div>
  );

};

export default Register;

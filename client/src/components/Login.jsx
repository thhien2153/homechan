import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../conext/AppContext';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const Login = () => {
  const [formData, setFormData] = useState({ account: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const trimmedData = {
        account: formData.account.trim(),
        password: formData.password.trim(),
      };

      const res = await axios.post('/api/auth/login', trimmedData);

      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);

      Swal.fire({
        icon: 'success',
        title: 'Đăng nhập thành công!',
        text: 'Chào mừng bạn quay lại HOMECHAN ',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      if (res.data.user.role === "hotelOwner") {
        setTimeout(() => navigate('/owner'), 2000);
      } else if (res.data.user.role === "admin") {
        setTimeout(() => navigate('/admin'), 2000);
      } else {
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#e0f7ef] flex items-center justify-center px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="max-w-5xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden">

        {/* Left: Form */}
        <div className="p-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-6 tracking-tight">
            Đăng nhập vào <span className="text-emerald-600">HOMECHAN</span>
          </h2>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Tên tài khoản</label>
              <input
                type="text"
                required
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-gray-900 placeholder-gray-400 border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                placeholder="Email/ Số điện thoại/ Username"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-gray-900 placeholder-gray-400 border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group inline-flex items-center justify-center px-6 py-3 text-white font-semibold rounded-xl bg-black hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
            >
              <span className="relative z-10">
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </span>
              <span className="absolute inset-0 bg-white opacity-5 group-hover:opacity-10 transition-opacity duration-300 rounded-xl z-0" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <a href="/register" className="text-emerald-600 font-medium hover:underline">
              Đăng ký ngay
            </a>
          </p>
        </div>

        {/* Right: Illustration */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-tr from-emerald-200 to-emerald-100 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-emerald-800 mb-2">HOMECHAN</h2>
            <p className="text-emerald-900 text-lg font-medium">
              Nơi nghỉ dưỡng lý tưởng của bạn
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
import React, { useState, useEffect } from "react";
import { useAppContext } from "../conext/AppContext.jsx";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// Định nghĩa ảnh mặc định an toàn để tránh lỗi src=""
const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder";

const Profile = () => {
    const { user, axios, setUser } = useAppContext();
    const [profileData, setProfileData] = useState(null);
    const [address, setAddress] = useState("");
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || user?.image || DEFAULT_AVATAR);
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Hàm lấy thông tin Profile đầy đủ
    const fetchProfile = async () => {
        try {
            const res = await axios.get("/api/user/profile");
            if (res.data.success) {
                const profile = res.data.profile;
                setProfileData(profile);
                setAddress(profile.address || "");
                setAvatarPreview(profile.avatar || profile.image || DEFAULT_AVATAR);
            }
        } catch (error) {
            console.error("Lỗi lấy profile:", error);
            setProfileData(user);
        }
    };

    // Tải thông tin profile khi component mount
    useEffect(() => {
        if (user) {
            setAvatarPreview(user.image || DEFAULT_AVATAR);
            fetchProfile();
        }
    }, [user]);

    if (!user || !profileData) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
                {user ? "Đang tải thông tin..." : "Bạn chưa đăng nhập."}
            </div>
        );
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("address", address);
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const res = await axios.put("/api/user/update-profile", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data?.success) {
                // Cập nhật profileData từ response
                const updatedProfile = res.data.profile;
                setProfileData(updatedProfile);
                setAvatarPreview(updatedProfile.avatar || updatedProfile.image || DEFAULT_AVATAR);
                setAvatarFile(null);
                setAddress(updatedProfile.address || "");

                toast.success("Cập nhật thông tin thành công!");
            } else {
                toast.error(res.data?.message || "Lỗi cập nhật thông tin!");
            }
        } catch (error) {
            console.error("Update profile error:", error);
            toast.error(error.response?.data?.message || error.message || "Lỗi cập nhật thông tin!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Thông tin cá nhân</h1>

                <div className="flex flex-col gap-10">
                    {/* Phần thông tin cơ bản */}
                    <div className="flex flex-col md:flex-row gap-10">
                        {/* Cột trái: Ảnh đại diện - Có thể chỉnh sửa */}
                        <div className="flex flex-col items-center md:w-1/3">
                            <div className="relative group">
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="w-40 h-40 object-cover rounded-full border-4 border-orange-500 shadow-md"
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                    title="Thay đổi ảnh đại diện"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M4 5a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
                                        <path d="M14.414 7l3.293-3.293a1 1 0 00-1.414-1.414L13 5.586V4a1 1 0 112 0v5a1 1 0 11-2 0V7z" />
                                    </svg>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="mt-4 text-lg font-semibold text-gray-700">{profileData.fullname}</p>
                            <p className="text-sm text-gray-500">@{profileData.username}</p>
                        </div>

                        {/* Cột phải: Thông tin cơ bản - Read only */}
                        <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={profileData.username || ''}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                                <input
                                    type="text"
                                    value={profileData.fullname || ''}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    type="text"
                                    value={profileData.email}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                                <input
                                    type="text"
                                    value={profileData.phone || ''}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Phần địa chỉ - Có thể chỉnh sửa */}
                    <div className="border-t pt-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Địa chỉ giao hàng</h2>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Nhập địa chỉ giao hàng của bạn"
                                className="w-full px-4 py-3 bg-white text-gray-700 rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    {/* Nút lưu */}
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Đang lưu..." : "Lưu thông tin"}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
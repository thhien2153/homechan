import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { UserButton } from "@clerk/clerk-react";
import { useAppContext } from "../conext/AppContext";
import Swal from "sweetalert2";

// Icon đặt phòng
const BookIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"
    />
  </svg>
);

// --------------------------
// Popup xác nhận đăng ký khách sạn (UI đẹp)
// --------------------------
const RegConfirmationPopup = ({ onClose, onConfirm }) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/40 text-center animate-fadeIn"
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-full shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7v13a1 1 0 001 1h16a1 1 0 001-1V7M16 3l5 4H3l5-4"
              />
            </svg>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Đăng ký khách sạn của bạn
        </h3>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          Hãy xác nhận nếu bạn muốn trở thành{" "}
          <b>chủ khách sạn</b> và bắt đầu đăng bài của riêng mình nhé!
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all font-medium shadow-sm"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-md hover:shadow-lg hover:opacity-90 transition-all"
          >
            Đồng ý
          </button>
        </div>

        {/* Decorative Glow */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl opacity-70"></div>
      </div>
    </div>
  );
};

// --------------------------
// Navbar chính
// --------------------------
const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRegConfirmation, setShowRegConfirmation] = useState(false);
  const dropdownRef = useRef();

  const { user, isOwner, navigate, axios, setIsOwner, setUser } =
    useAppContext();

  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Khách sạn", path: "/rooms" },
    { name: "Giới thiệu", path: "/gioi-thieu" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showLightHeader = isScrolled || location.pathname !== "/";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    Swal.fire({
      icon: "success",
      title: "Đăng xuất thành công!",
      text: "Hẹn gặp lại bạn lần sau 👋",
      showConfirmButton: false,
      timer: 1800,
    });

    navigate("/");
  };

  // Khi click nút "Đăng ký khách sạn của bạn"
  const handleRegClick = () => {
    if (isOwner) navigate("/owner");
    else setShowRegConfirmation(true);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 drop-shadow-md ${showLightHeader
          ? "bg-white/80 backdrop-blur-md shadow-md text-gray-800"
          : "text-white"
          }`}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 flex justify-between items-center h-[64px] md:h-[80px]">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <h1
              className={`text-2xl font-bold transition-all hover:scale-105 duration-300 ${showLightHeader ? "text-gray-800" : "text-white"
                }`}
            >
              🏩 HOMECHAN
            </h1>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10 font-medium">
            {navLinks.map((link, i) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={i}
                  to={link.path}
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className={`relative group text-sm transition ${isActive
                    ? showLightHeader
                      ? "text-black font-semibold"
                      : "text-white font-semibold"
                    : showLightHeader
                      ? "text-gray-700 hover:text-black"
                      : "text-white/90 hover:text-white"
                    }`}
                >
                  {link.name}
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] bg-current transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                  />
                </Link>
              );
            })}

            {user && (
              <button
                onClick={handleRegClick}
                className={`border px-4 py-1.5 rounded-full text-sm transition ${showLightHeader
                  ? "border-black text-black hover:bg-black hover:text-white"
                  : "border-white text-white hover:bg-white hover:text-black"
                  }`}
              >
                {isOwner ? "Quản trị" : "Đăng ký khách sạn của bạn"}
              </button>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-5 relative">
            <img
              src={assets.searchIcon}
              alt="search"
              className={`h-6 ${showLightHeader && "invert"} cursor-pointer`}
            />

            {user?.external ? (
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Đặt phòng của tôi"
                    labelIcon={<BookIcon />}
                    onClick={() => navigate("/my-bookings")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            ) : user ? (
              <div className="relative">
                <img
                  src={user.image || assets.defaultAvatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border cursor-pointer"
                  onClick={() => setShowDropdown((prev) => !prev)}
                />
                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-3 w-64 bg-white/70 backdrop-blur-lg border border-gray-200 shadow-xl rounded-xl z-50 transition-all"
                  >
                    <div className="px-5 py-4 border-b border-gray-200">
                      <p className="text-base font-semibold text-gray-900">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-5 py-3 text-gray-800 hover:bg-gray-100 transition text-sm"
                    >
                      Hồ sơ của tôi
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/my-bookings");
                      }}
                      className="w-full text-left px-5 py-3 text-gray-800 hover:bg-gray-100 transition text-sm"
                    >
                      Đặt phòng của tôi
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/favorites");
                      }}
                      className="w-full text-left px-5 py-3 text-gray-800 hover:bg-gray-100 transition text-sm"
                    >
                      Mục yêu thích
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 text-red-500 hover:bg-red-100 transition text-sm"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-900 transition-all"
              >
                Đăng nhập
              </button>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex items-center gap-3 md:hidden">
            <img
              src={assets.menuIcon}
              onClick={() => setIsMenuOpen(true)}
              className={`h-5 cursor-pointer ${showLightHeader && "invert"}`}
            />
          </div>
        </div>
      </nav>

      {/* Popup xác nhận */}
      {showRegConfirmation && (
        <RegConfirmationPopup
          onClose={() => setShowRegConfirmation(false)}
          onConfirm={() => {
            setShowRegConfirmation(false);
            axios
              .post("/api/user/become-owner")
              .then(({ data }) => {
                if (data.success) {
                  const updatedUser = data.user || data.updatedUser || data;
                  setUser(updatedUser);
                  try {
                    sessionStorage.setItem("user", JSON.stringify(updatedUser));
                  } catch (e) { }
                  setIsOwner(true);

                  Swal.fire({
                    icon: "success",
                    title: "Bạn đã trở thành chủ khách sạn",
                    showConfirmButton: false,
                    timer: 1400,
                  });

                  navigate("/owner");
                } else {
                  Swal.fire(
                    "Lỗi",
                    data.message || "Không thể cập nhật quyền",
                    "error"
                  );
                }
              })
              .catch((err) => {
                Swal.fire(
                  "Lỗi",
                  err?.response?.data?.message || err.message || "Lỗi server",
                  "error"
                );
              });
          }}
        />
      )}
    </>
  );
};

export default Navbar;

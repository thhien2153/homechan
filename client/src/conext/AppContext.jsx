import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { roomsDummyData } from "../assets/assets";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
console.log('AXIOS baseURL =', import.meta.env.VITE_BACKEND_URL);

//Khởi tạo Context và State
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);

  //Khôi phục session người dùng
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("token");

    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
  }, []);


  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [user]);

  //Xác định quyền người dùng
  useEffect(() => {
    if (user) {
      setIsOwner(user.role === "hotelOwner");
      setIsAdmin(user.role === "admin");
    } else {
      setIsOwner(false);
      setIsAdmin(false);
    }
  }, [user]);

  //Điều hướng tự động cho chủ khách sạn
  useEffect(() => {
    if (user && user.role === "hotelOwner") {
      const currentPath = window.location.pathname;

      if (currentPath === "/" || currentPath === "/rooms" || currentPath === "/trai-nghiem" || currentPath === "/gioi-thieu") {

        setTimeout(() => {
          if (window.location.pathname !== "/owner") {
            navigate("/owner");
          }
        }, 100);
      }
    }
  }, [user?.role, navigate]);

  //Điều hướng tự động cho admin
  useEffect(() => {
    if (user && user.role === "admin") {
      const currentPath = window.location.pathname;
      if (currentPath === "/" || currentPath === "/rooms" || currentPath === "/trai-nghiem" || currentPath === "/gioi-thieu") {
        setTimeout(() => {
          if (window.location.pathname !== "/admin") {
            navigate("/admin");
          }
        }, 100);
      }
    }
  }, [user?.role, navigate]);

  const getToken = () => sessionStorage.getItem("token");
  //Gọi API GET để lấy danh sách phòng từ server
  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms");
      if (data.success) {

        const validRooms = data.rooms.filter(room =>
          room &&
          room._id &&
          room.hotel &&
          room.hotel.name &&
          room.hotel.city &&
          room.roomType &&
          room.pricePerNight
        );
        setRooms(validRooms); // lưu vào state
        console.log(' Đã lọc và tải:', validRooms.length, 'phòng hợp lệ từ', data.rooms.length, 'phòng');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(' Lỗi fetch rooms:', error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const value = {
    currency,
    navigate,
    user,
    setUser,
    getToken,
    isOwner,
    setIsOwner,
    isAdmin,
    setIsAdmin,
    axios,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
    rooms,
    setRooms,
    refreshRooms: fetchRooms,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
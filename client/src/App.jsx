import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import Home from './pages/Home';
import Footer from './components/Footer';
import AllRooms from './pages/AllRooms';
import RoomDetails from './pages/RoomDetails';
import MyBookings from './pages/MyBookings';
import Favorites from './pages/Favorites';
import HotelReg from './components/HotelReg';
import Layout from './pages/hotelOwner/Layout';
import Dashboard from './pages/hotelOwner/Dashboard';
import Listroom from './pages/hotelOwner/ListRoom';
import { Toaster } from 'react-hot-toast';
import { useAppContext } from './conext/AppContext';
import Addroom from './pages/hotelOwner/AddRoom';
import ManageBookings from './pages/hotelOwner/ManageBookings';
import About from './components/About';
import Login from './components/Login';
import Register from './components/Register';
import AdminLayout from './pages/admin/Layout';
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageHotels from './pages/admin/ManageHotels';
import AllBookings from './pages/admin/AllBookings';
import HotelsList from './pages/HotelsList';
import HotelDetail from './pages/HotelDetail';
import BookingPage from "./pages/BookingPage"
import LoginSuccess from './pages/LoginSuccess';
import Profile from './pages/Profile';

const App = () => {
  // kiểm tra đường dẫn
  const location = useLocation();
  const isOwnerPath = location.pathname.includes("owner");
  const isAdminPath = location.pathname.includes("admin");
  const isLoginOrRegisterPath = location.pathname === "/login" || location.pathname === "/register";
  const { showHotelReg, user } = useAppContext(); //


  return (
    <div>
      <Toaster />
      {!isOwnerPath && !isAdminPath && !isLoginOrRegisterPath && <Navbar />}
      {showHotelReg && <HotelReg />}
      <div className='min-h-[70vh]'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/rooms' element={<AllRooms />} />
          <Route path='/rooms/:id' element={<RoomDetails />} />
          <Route path='/hotels' element={<HotelsList />} />
          <Route path='/hotels/:id' element={<HotelDetail />} />
          <Route path='/my-bookings' element={<MyBookings />} />
          <Route path='/favorites' element={<Favorites />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/profile" element={<Profile />} />

          {/* Owner routes */}
          <Route path='/owner' element={
            user?.role === "hotelOwner" ? <Layout /> : <Navigate to="/login" />
          }>
            <Route index element={<Dashboard />} />
            <Route path="add-room" element={<Addroom />} />
            <Route path="list-room" element={<Listroom />} />
            <Route path="manage-bookings" element={<ManageBookings />} />
          </Route>

          {/* Admin routes */}
          <Route path='/admin' element={
            user?.role === "admin" ? <AdminLayout /> : <Navigate to="/login" />
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="manage-hotels" element={<ManageHotels />} />
            <Route path="bookings" element={<AllBookings />} />
          </Route>

          <Route path='/gioi-thieu' element={<About />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login-success' element={<LoginSuccess />} />

        </Routes>
      </div>
      {!isLoginOrRegisterPath && <Footer />}
    </div>
  )
}

export default App
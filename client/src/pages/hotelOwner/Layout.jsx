import React, { useEffect } from 'react'
import Navbar from '../../components/hotelOwner/Navbar'
import Sidebar from '../../components/hotelOwner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../conext/AppContext'

const Layout = () => {
  const { isOwner, navigate, user } = useAppContext()

  useEffect(() => {
    if (user && isOwner === false) {
      navigate('/')
    }
  }, [isOwner, navigate, user])
  if (!user || isOwner === undefined) {
    return null
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />


      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 pt-10 md:px-10 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
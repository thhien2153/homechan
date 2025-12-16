import React, { useEffect } from 'react'
import Navbar from '../../components/admin/Navbar'
import Sidebar from '../../components/admin/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../conext/AppContext'

const Layout = () => {
    const { isAdmin, navigate } = useAppContext()

    useEffect(() => {
        if (!isAdmin) {
            navigate('/')
        }
    }, [isAdmin])

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

import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Users, Building2, Calendar } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        {
            path: '/admin',
            icon: BarChart3,
            label: 'Dashboard',
            exact: true
        },
        {
            path: '/admin/manage-users',
            icon: Users,
            label: 'Manage Users'
        },
        {
            path: '/admin/manage-hotels',
            icon: Building2,
            label: 'Manage Hotels'
        },
        {
            path: '/admin/bookings',
            icon: Calendar,
            label: 'All Bookings'
        }
    ];

    return (
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
            <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) =>
                                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, X, Bell, User, LogOut, Settings } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import NotificationDropdown from './NotificationDropdown';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getNavigationItems = () => {
    if (user?.role === 'student') {
      return [
        { name: 'Dashboard', href: '/student/dashboard', icon: '📊' },
        { name: 'Profile', href: '/student/profile', icon: '👤' },
        { name: 'Hotels', href: '/student/hotels', icon: '🏨' },
        { name: 'Orders', href: '/student/orders', icon: '🍽️' },
        { name: 'Wallet', href: '/student/wallet', icon: '💳' },
      ];
    } else if (user?.role === 'hotel_owner') {
      return [
        { name: 'Dashboard', href: '/hotel-owner/dashboard', icon: '📊' },
        { name: 'Profile', href: '/hotel-owner/profile', icon: '🏨' },
        { name: 'Students', href: '/hotel-owner/students', icon: '👥' },
        { name: 'Orders', href: '/hotel-owner/orders', icon: '📋' },
        { name: 'Menu', href: '/hotel-owner/menu', icon: '🍽️' },
        { name: 'Rooms', href: '/hotel-owner/rooms', icon: '🏠' },
      ];
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-600">StudentHotel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  location.pathname === item.href
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.name || user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationDropdown />

              {/* User menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-600">
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:block text-sm">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
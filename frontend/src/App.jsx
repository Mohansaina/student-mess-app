import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';
import { SocketProvider } from './hooks/useSocket';

// Components
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import DemoHome from './pages/DemoHome';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentHotels from './pages/student/Hotels';
import StudentOrders from './pages/student/Orders';
import StudentWallet from './pages/student/Wallet';

// Hotel Pages
import HotelDashboard from './pages/hotel/Dashboard';
import HotelProfile from './pages/hotel/Profile';
import HotelStudents from './pages/hotel/Students';
import HotelOrders from './pages/hotel/Orders';
import HotelMenu from './pages/hotel/Menu';
import HotelRooms from './pages/hotel/Rooms';

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to={`/${user?.role?.replace('_', '-')}/dashboard`} replace />
              ) : (
                <Login />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? (
                <Navigate to={`/${user?.role?.replace('_', '-')}/dashboard`} replace />
              ) : (
                <Register />
              )
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/student/*" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="profile" element={<StudentProfile />} />
                    <Route path="hotels" element={<StudentHotels />} />
                    <Route path="orders" element={<StudentOrders />} />
                    <Route path="wallet" element={<StudentWallet />} />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/hotel-owner/*" 
            element={
              <ProtectedRoute allowedRoles={['hotel_owner']}>
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<HotelDashboard />} />
                    <Route path="profile" element={<HotelProfile />} />
                    <Route path="students" element={<HotelStudents />} />
                    <Route path="orders" element={<HotelOrders />} />
                    <Route path="menu" element={<HotelMenu />} />
                    <Route path="rooms" element={<HotelRooms />} />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Redirect based on user role */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Navigate to={`/${user?.role?.replace('_', '-')}/dashboard`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </SocketProvider>
  );
}

export default App;
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Hotel, 
  CreditCard, 
  ShoppingBag, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { studentAPI, orderAPI, transactionAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentDashboard = () => {
  const { user, profile } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState({
    recentOrders: [],
    walletBalance: 0,
    recentTransactions: [],
    stats: {
      totalOrders: 0,
      totalSpent: 0,
      accountStatus: 'pending'
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile?._id) return;
      
      try {
        setLoading(true);
        
        // Fetch student data including wallet
        const walletResponse = await studentAPI.getWallet(profile._id);
        
        // Fetch recent orders
        const ordersResponse = await studentAPI.getOrders(profile._id, { limit: 5 });
        
        // Fetch recent transactions
        const transactionsResponse = await transactionAPI.getAll({ limit: 5 });

        setDashboardData({
          walletBalance: walletResponse.data.data.balance,
          recentOrders: ordersResponse.data.data.orders,
          recentTransactions: transactionsResponse.data.data.transactions,
          stats: {
            totalOrders: ordersResponse.data.data.orders.length,
            totalSpent: transactionsResponse.data.data.transactions
              .filter(t => t.type === 'payment')
              .reduce((sum, t) => sum + t.amount, 0),
            accountStatus: profile.hotelAccountStatus || 'pending'
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'rejected': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {profile?.name || user?.email}! 👋
        </h1>
        <p className="text-primary-100">
          {profile?.linkedHotelId 
            ? `Your account is ${dashboardData.stats.accountStatus} with ${profile.hotel?.name || 'a hotel'}`
            : 'Start by finding and linking to a hotel near your college'
          }
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Wallet Balance</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{dashboardData.walletBalance}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData.stats.totalOrders}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{dashboardData.stats.totalSpent}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getStatusIcon(dashboardData.stats.accountStatus)}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Account Status</dt>
                  <dd className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dashboardData.stats.accountStatus)}`}>
                    {dashboardData.stats.accountStatus}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {!profile?.linkedHotelId ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <Hotel className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Find a Hotel</h3>
            <p className="text-gray-500 mb-6">
              Connect with nearby hotels and hostels to start ordering meals and accessing services.
            </p>
            <Link to="/student/hotels" className="btn-primary">
              Browse Hotels
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              <Link to="/student/orders" className="text-sm text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
            <div className="card-body">
              {dashboardData.recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link to="/student/orders" className="btn-primary mt-4">
                    Place First Order
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{order.total}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
              <Link to="/student/wallet" className="text-sm text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
            <div className="card-body">
              {dashboardData.recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentTransactions.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.type === 'topup' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'topup' ? '+' : '-'}₹{transaction.amount}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion */}
      {!profile?.faceVerification?.isVerified && (
        <div className="card border-yellow-200 bg-yellow-50">
          <div className="card-body">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="font-medium text-yellow-800">Complete Your Profile</h3>
                <p className="text-yellow-700 text-sm">
                  Your face verification is pending. Complete it to access all features.
                </p>
              </div>
              <Link to="/student/profile" className="btn-outline ml-auto">
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
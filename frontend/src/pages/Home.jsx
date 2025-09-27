import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Hotel, Shield, Clock } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">StudentHotel</h1>
            </div>
            <div className="space-x-4">
              <Link to="/login" className="btn-outline">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Connect Students with
              <span className="text-primary-600"> Hotel Services</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A modern platform that bridges students living away from home with nearby hotels and hostels for daily mess services, accommodation, and more.
            </p>
            <div className="space-x-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Join as Student
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/register" className="btn-outline text-lg px-8 py-3">
                Register Hotel
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to connect students with quality hotel services</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* For Students */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Students</h3>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Create Profile</h4>
                  <p className="text-gray-600">Register with college details and upload verification documents</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Find Hotels</h4>
                  <p className="text-gray-600">Search and connect with nearby hotels and hostels</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Enjoy Services</h4>
                  <p className="text-gray-600">Order meals, manage wallet, and access hotel amenities</p>
                </div>
              </div>
            </div>

            {/* For Hotels */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Hotels</h3>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                  <span className="text-secondary-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Setup Profile</h4>
                  <p className="text-gray-600">Register your hotel with license details and location</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                  <span className="text-secondary-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Manage Students</h4>
                  <p className="text-gray-600">Approve student applications and manage accounts</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                  <span className="text-secondary-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Grow Business</h4>
                  <p className="text-gray-600">Process orders, update menu, and track revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose StudentHotel?</h2>
            <p className="text-xl text-gray-600">Built specifically for the student-hotel ecosystem</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Students</h3>
              <p className="text-gray-600">All students verified with college ID and face recognition</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hotel className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Licensed Hotels</h3>
              <p className="text-gray-600">Only registered and licensed hotels and hostels</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">Safe wallet system with transaction tracking</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Live notifications for orders and account status</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of students and hotels already using our platform
          </p>
          <div className="space-x-4">
            <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors">
              Create Account
            </Link>
            <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">StudentHotel</h3>
              <p className="text-gray-400">
                Connecting students with quality hotel services for a better living experience.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Students</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Find Hotels</a></li>
                <li><a href="#" className="hover:text-white">Order Food</a></li>
                <li><a href="#" className="hover:text-white">Manage Wallet</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Hotels</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Register Hotel</a></li>
                <li><a href="#" className="hover:text-white">Manage Students</a></li>
                <li><a href="#" className="hover:text-white">Track Orders</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 StudentHotel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
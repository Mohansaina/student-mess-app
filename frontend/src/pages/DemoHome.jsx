import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Hotel, Shield, Clock, CheckCircle } from 'lucide-react';

const DemoHome = () => {
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

      {/* Demo Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center text-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">🎉 Demo Preview - Full-Stack StudentHotel Application</span>
          </div>
        </div>
      </div>

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
            <div className="space-x-4 mb-8">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Join as Student
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/register" className="btn-outline text-lg px-8 py-3">
                Register Hotel
              </Link>
            </div>
            
            {/* Demo Features */}
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ This Demo Includes:</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Full REST API Backend
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  React Frontend with Routing
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  JWT Authentication
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Socket.IO Real-time Updates
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  File Upload System
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Docker & CI/CD Ready
                </div>
              </div>
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

      {/* Tech Stack */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built with Modern Tech Stack</h2>
            <p className="text-xl text-gray-600">Production-ready technologies for scalability and performance</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Backend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Node.js + Express</li>
                <li>• MongoDB + Mongoose</li>
                <li>• JWT Authentication</li>
                <li>• Socket.IO</li>
                <li>• Multer File Upload</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Frontend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• React 18 + Vite</li>
                <li>• Redux Toolkit</li>
                <li>• Tailwind CSS</li>
                <li>• React Router</li>
                <li>• Formik + Yup</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">DevOps</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Docker Containers</li>
                <li>• GitHub Actions CI/CD</li>
                <li>• Jest Testing</li>
                <li>• ESLint + Prettier</li>
                <li>• Production Ready</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Accounts */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Try the Demo!
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Use these demo accounts to explore the full functionality
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Student Account</h3>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Email:</strong> student1@demo.com<br/>
                <strong>Password:</strong> password123
              </p>
              <Link to="/login" className="btn-primary w-full">Login as Student</Link>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Hotel Owner</h3>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Email:</strong> hotel1@demo.com<br/>
                <strong>Password:</strong> password123
              </p>
              <Link to="/login" className="btn-primary w-full">Login as Hotel</Link>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Admin Panel</h3>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Email:</strong> admin@studenthotel.com<br/>
                <strong>Password:</strong> admin123
              </p>
              <Link to="/login" className="btn-primary w-full">Login as Admin</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">StudentHotel Demo</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              This is a complete full-stack demonstration of the StudentHotel application, showcasing modern web development practices and production-ready code.
            </p>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">&copy; 2025 StudentHotel Demo. Built with ❤️ for students and hotels.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DemoHome;
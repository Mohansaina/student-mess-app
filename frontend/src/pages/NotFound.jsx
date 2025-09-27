import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <div className="text-6xl mb-4">🏨</div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Oops! Page not found
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <div className="space-x-4">
          <Link 
            to="/" 
            className="btn-primary inline-flex items-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="btn-outline inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
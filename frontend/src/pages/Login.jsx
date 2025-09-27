import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { login, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (values) => {
    try {
      const result = await dispatch(login(values));
      if (login.fulfilled.match(result)) {
        toast.success('Login successful!');
        const userRole = result.payload.user.role.replace('_', '-');
        navigate(`/${userRole}/dashboard`);
      } else {
        toast.error(result.payload || 'Login failed');
      }
    } catch (err) {
      toast.error('Login failed');
    }
  };

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">StudentHotel</h1>
          <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Register here
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="label">
                    Email address
                  </label>
                  <div className="relative">
                    <Field
                      name="email"
                      type="email"
                      className="input pl-10"
                      placeholder="Enter your email"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className="input pl-10 pr-10"
                      placeholder="Enter your password"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                      Forgot your password?
                    </a>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>

                {/* Demo accounts */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p><strong>Student:</strong> student@demo.com / password123</p>
                    <p><strong>Hotel Owner:</strong> hotel@demo.com / password123</p>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
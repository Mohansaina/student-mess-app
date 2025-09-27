import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { register, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const RegisterSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  role: Yup.string().oneOf(['student', 'hotel_owner'], 'Please select a valid role').required('Role is required'),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (values) => {
    try {
      const result = await dispatch(register(values));
      if (register.fulfilled.match(result)) {
        toast.success('Registration successful!');
        const userRole = result.payload.user.role.replace('_', '-');
        navigate(`/${userRole}/dashboard`);
      } else {
        toast.error(result.payload || 'Registration failed');
      }
    } catch (err) {
      toast.error('Registration failed');
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
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <Formik
            initialValues={{
              email: '',
              password: '',
              confirmPassword: '',
              role: '',
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="label">
                    I am a
                  </label>
                  <Field as="select" name="role" className="input">
                    <option value="">Select your role</option>
                    <option value="student">Student</option>
                    <option value="hotel_owner">Hotel Owner</option>
                  </Field>
                  <ErrorMessage name="role" component="div" className="text-red-500 text-sm mt-1" />
                </div>

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
                      placeholder="Create a password"
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

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="label">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Field
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input pl-10 pr-10"
                      placeholder="Confirm your password"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Terms and conditions */}
                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                    I agree to the{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Role-specific info */}
                {values.role && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {values.role === 'student' ? (
                        <>
                          <strong>Students:</strong> After registration, you'll need to complete your profile with college details, upload your student ID, and face verification before linking to hotels.
                        </>
                      ) : (
                        <>
                          <strong>Hotel Owners:</strong> After registration, you'll need to complete your hotel profile with license details, location, and menu before students can find and link to your hotel.
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2" />
                      Creating account...
                    </div>
                  ) : (
                    'Create account'
                  )}
                </button>
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

export default Register;
# StudentHotel 🏨

A full-stack web application connecting students with nearby hotels and hostels for daily mess services, accommodation, and more.

## 🌟 Features

### For Students
- **Profile Management**: Complete registration with college details and document verification
- **Face Verification**: Client-side face recognition using face-api.js for enhanced security
- **Hotel Discovery**: Search and connect with nearby hotels and hostels
- **Digital Wallet**: Secure wallet system for payments and top-ups
- **Meal Ordering**: Browse menus and place food orders
- **Real-time Notifications**: Live updates for account status, orders, and more
- **Order Tracking**: Monitor order status from preparation to delivery

### For Hotel Owners
- **Hotel Management**: Complete hotel profile with license verification
- **Student Approval**: Review and approve/reject student account requests
- **Menu Management**: Add, edit, and manage food items and pricing
- **Order Processing**: Receive and manage student orders in real-time
- **Room Management**: Manage room allocations and capacity
- **Revenue Tracking**: Monitor transactions and business analytics
- **Student Communication**: Direct messaging and notifications

### Technical Features
- **JWT Authentication**: Secure authentication with refresh tokens
- **File Upload**: Support for local storage and AWS S3
- **Real-time Communication**: Socket.IO for live notifications
- **Responsive Design**: Mobile-first, accessible UI
- **Security**: Rate limiting, input validation, and data encryption
- **Scalable Architecture**: Microservices-ready backend structure

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: Socket.IO
- **File Upload**: Multer with S3 support
- **Security**: Helmet, CORS, rate limiting
- **Validation**: express-validator

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Forms**: Formik with Yup validation
- **Face Recognition**: face-api.js
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios

### DevOps & Deployment
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Deployment**: Render, Vercel, Netlify
- **Database**: MongoDB Atlas
- **Storage**: AWS S3 (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/studenthotel.git
cd studenthotel
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install:all
```

3. **Environment Setup**

Create `.env` files in both backend and frontend directories:

**Backend `.env`:**
```env
# Database
DB_URI=mongodb://localhost:27017/studenthotel
DB_URI_TEST=mongodb://localhost:27017/studenthotel_test

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=studenthotel-bucket
AWS_REGION=us-east-1
USE_S3=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_SALT_ROUNDS=12
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start the application**
```bash
# Development mode (both frontend and backend)
npm run dev

# Or start individually
npm run dev:backend
npm run dev:frontend
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Health Check: http://localhost:5000/api/health

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Hotel Endpoints
- `GET /api/hotels` - Get all hotels (with search/filter)
- `GET /api/hotels/:id` - Get single hotel
- `POST /api/hotels` - Create hotel (hotel owner)
- `PUT /api/hotels/:id` - Update hotel (hotel owner)
- `DELETE /api/hotels/:id` - Delete hotel (hotel owner)

### Student Endpoints
- `GET /api/students/:id` - Get student profile
- `POST /api/students` - Create student profile
- `PUT /api/students/:id` - Update student profile
- `POST /api/students/:id/link-hotel` - Request hotel account

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/cancel` - Cancel order

### Transaction Endpoints
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions/topup` - Wallet top-up
- `GET /api/transactions/:id` - Get single transaction

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Watch mode
```

### Frontend Tests
```bash
cd frontend
npm test                # Run all tests
npm run test:watch      # Watch mode
```

## 📦 Deployment

### Using Docker

1. **Build and run with Docker Compose**
```bash
docker-compose up -d
```

2. **Build individual containers**
```bash
# Backend
docker build -t studenthotel-backend ./backend

# Frontend
docker build -t studenthotel-frontend ./frontend
```

### Manual Deployment

#### Backend (Render/Heroku)
1. Push code to GitHub
2. Connect repository to Render/Heroku
3. Set environment variables
4. Deploy

#### Frontend (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set up redirects for client-side routing

### Environment Variables for Production

**Backend:**
- `NODE_ENV=production`
- `DB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Strong secret key
- `JWT_REFRESH_SECRET` - Strong refresh key
- `FRONTEND_URL` - Production frontend URL

**Frontend:**
- `VITE_API_URL` - Production backend API URL

## 🔒 Security Features

- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT Authentication**: Access and refresh token system
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: Configurable request rate limiting
- **CORS**: Cross-origin resource sharing protection
- **Helmet**: Security headers
- **File Upload Security**: File type and size validation
- **Face Verification**: Optional biometric verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚨 Important Notes

### Face Recognition Compliance
- Face recognition is implemented as an optional feature
- Explicit user consent is required before enabling face verification
- Face data is encrypted and can be deleted upon user request
- Compliant with privacy regulations (GDPR, etc.)
- Manual verification fallback is always available

### Payment Integration
- Currently uses mock payment gateway for development
- Replace with production payment service (Razorpay, Stripe, etc.)
- Implement proper webhook handling for payment confirmations

### Production Checklist
- [ ] Change all default secrets and passwords
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure AWS S3 for file storage (recommended)
- [ ] Set up email service for notifications
- [ ] Configure domain and SSL certificates
- [ ] Set up monitoring and logging
- [ ] Implement backup strategies
- [ ] Review and test security configurations

## 📞 Support

For support, email support@studenthotel.com or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- Face recognition powered by [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- Icons by [Lucide React](https://lucide.dev)
- UI components inspired by [Tailwind UI](https://tailwindui.com)

---

**Made with ❤️ for students and hotels**
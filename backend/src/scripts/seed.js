const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Hotel, Student, Room, Order, Transaction } = require('../models');

require('dotenv').config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/studenthotel');
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Hotel.deleteMany({}),
      Student.deleteMany({}),
      Room.deleteMany({}),
      Order.deleteMany({}),
      Transaction.deleteMany({})
    ]);
    console.log('🧹 Cleared existing data');

    // Create Users
    console.log('👥 Creating users...');
    
    const users = await User.create([
      {
        email: 'admin@studenthotel.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      },
      {
        email: 'hotel1@demo.com',
        password: 'password123',
        role: 'hotel_owner',
        isActive: true,
        isEmailVerified: true
      },
      {
        email: 'hotel2@demo.com',
        password: 'password123',
        role: 'hotel_owner',
        isActive: true,
        isEmailVerified: true
      },
      {
        email: 'student1@demo.com',
        password: 'password123',
        role: 'student',
        isActive: true,
        isEmailVerified: true
      },
      {
        email: 'student2@demo.com',
        password: 'password123',
        role: 'student',
        isActive: true,
        isEmailVerified: true
      },
      {
        email: 'student3@demo.com',
        password: 'password123',
        role: 'student',
        isActive: true,
        isEmailVerified: true
      }
    ]);

    const [adminUser, hotel1Owner, hotel2Owner, student1User, student2User, student3User] = users;

    // Create Hotels
    console.log('🏨 Creating hotels...');
    
    const hotels = await Hotel.create([
      {
        ownerUserId: hotel1Owner._id,
        name: 'Campus Inn Hotel',
        address: {
          street: '123 University Road',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India'
        },
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139] // Delhi coordinates
        },
        licenseNumber: 'DL-HTL-2024-001',
        contactPhone: '9876543210',
        email: 'info@campusinn.com',
        description: 'A modern hotel catering to students with affordable mess services',
        amenities: ['wifi', 'laundry', 'parking', 'study_hall', 'kitchen'],
        menu: [
          {
            name: 'Breakfast Combo',
            description: 'Paratha, Sabzi, Tea/Coffee',
            price: 80,
            category: 'breakfast',
            isVeg: true,
            isAvailable: true
          },
          {
            name: 'Lunch Thali',
            description: 'Rice, Dal, Sabzi, Roti, Pickle',
            price: 120,
            category: 'lunch',
            isVeg: true,
            isAvailable: true
          },
          {
            name: 'Dinner Special',
            description: 'Rice/Roti, Dal, Sabzi, Salad',
            price: 100,
            category: 'dinner',
            isVeg: true,
            isAvailable: true
          },
          {
            name: 'Evening Snacks',
            description: 'Samosa, Tea/Coffee',
            price: 40,
            category: 'snacks',
            isVeg: true,
            isAvailable: true
          }
        ],
        pricing: {
          dailyMess: 300,
          monthlyMess: 8000,
          securityDeposit: 2000
        },
        isActive: true,
        isVerified: true,
        maxStudents: 100,
        currentStudents: 0
      },
      {
        ownerUserId: hotel2Owner._id,
        name: 'Student Paradise Hostel',
        address: {
          street: '456 College Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760] // Mumbai coordinates
        },
        licenseNumber: 'MH-HTL-2024-002',
        contactPhone: '9876543211',
        email: 'info@studentparadise.com',
        description: 'Budget-friendly hostel with quality food and modern facilities',
        amenities: ['wifi', 'laundry', 'gym', 'common_room', 'ac'],
        menu: [
          {
            name: 'South Indian Breakfast',
            description: 'Idli, Sambar, Chutney, Coffee',
            price: 70,
            category: 'breakfast',
            isVeg: true,
            isAvailable: true
          },
          {
            name: 'North Indian Lunch',
            description: 'Roti, Dal, Sabzi, Rice, Curd',
            price: 110,
            category: 'lunch',
            isVeg: true,
            isAvailable: true
          },
          {
            name: 'Chinese Dinner',
            description: 'Fried Rice, Noodles, Manchurian',
            price: 130,
            category: 'dinner',
            isVeg: false,
            isAvailable: true
          }
        ],
        pricing: {
          dailyMess: 280,
          monthlyMess: 7500,
          securityDeposit: 1500
        },
        isActive: true,
        isVerified: true,
        maxStudents: 80,
        currentStudents: 0
      }
    ]);

    const [campusInn, studentParadise] = hotels;

    // Create Students
    console.log('🎓 Creating students...');
    
    const students = await Student.create([
      {
        userId: student1User._id,
        name: 'Rahul Sharma',
        studentId: 'CS2024001',
        mobile: '9876543100',
        roomNumber: 'A101',
        groupMembers: [
          { name: 'Amit Kumar', studentId: 'CS2024002', mobile: '9876543101' },
          { name: 'Priya Singh', studentId: 'CS2024003', mobile: '9876543102' }
        ],
        fatherName: 'Ram Sharma',
        fatherPhone: '9876543103',
        emergencyContact: {
          name: 'Sunita Sharma',
          phone: '9876543104',
          relation: 'Mother'
        },
        college: {
          name: 'Delhi Technical University',
          course: 'Computer Science',
          year: 2
        },
        documents: {
          idCard: {
            url: '/uploads/documents/student1-id.jpg'
          },
          faceImage: {
            url: '/uploads/documents/student1-face.jpg'
          }
        },
        faceVerification: {
          isVerified: true,
          consentGiven: true,
          method: 'manual'
        },
        linkedHotelId: campusInn._id,
        hotelAccountStatus: 'approved',
        hotelAccountRequestedAt: new Date(),
        hotelAccountApprovedAt: new Date(),
        walletBalance: 1500,
        isActive: true
      },
      {
        userId: student2User._id,
        name: 'Anita Patel',
        studentId: 'EC2024001',
        mobile: '9876543105',
        roomNumber: 'B205',
        groupMembers: [
          { name: 'Neha Gupta', studentId: 'EC2024002', mobile: '9876543106' }
        ],
        fatherName: 'Ashok Patel',
        fatherPhone: '9876543107',
        emergencyContact: {
          name: 'Meera Patel',
          phone: '9876543108',
          relation: 'Mother'
        },
        college: {
          name: 'Mumbai Institute of Technology',
          course: 'Electronics',
          year: 3
        },
        documents: {
          idCard: {
            url: '/uploads/documents/student2-id.jpg'
          },
          faceImage: {
            url: '/uploads/documents/student2-face.jpg'
          }
        },
        faceVerification: {
          isVerified: true,
          consentGiven: true,
          method: 'automatic'
        },
        linkedHotelId: studentParadise._id,
        hotelAccountStatus: 'approved',
        hotelAccountRequestedAt: new Date(),
        hotelAccountApprovedAt: new Date(),
        walletBalance: 2000,
        isActive: true
      },
      {
        userId: student3User._id,
        name: 'Vikram Singh',
        studentId: 'ME2024001',
        mobile: '9876543109',
        roomNumber: 'C301',
        groupMembers: [],
        fatherName: 'Rajesh Singh',
        fatherPhone: '9876543110',
        emergencyContact: {
          name: 'Kavita Singh',
          phone: '9876543111',
          relation: 'Mother'
        },
        college: {
          name: 'Delhi Technical University',
          course: 'Mechanical Engineering',
          year: 1
        },
        documents: {
          idCard: {
            url: '/uploads/documents/student3-id.jpg'
          },
          faceImage: {
            url: '/uploads/documents/student3-face.jpg'
          }
        },
        faceVerification: {
          isVerified: false,
          consentGiven: true,
          method: 'automatic'
        },
        linkedHotelId: campusInn._id,
        hotelAccountStatus: 'pending',
        hotelAccountRequestedAt: new Date(),
        walletBalance: 500,
        isActive: true
      }
    ]);

    const [rahul, anita, vikram] = students;

    // Update hotel student counts
    campusInn.currentStudents = 2;
    studentParadise.currentStudents = 1;
    await campusInn.save();
    await studentParadise.save();

    // Create Rooms
    console.log('🏠 Creating rooms...');
    
    await Room.create([
      {
        roomNumber: 'A101',
        hotelId: campusInn._id,
        members: [
          { studentId: rahul._id, isPrimary: true, joinedAt: new Date() }
        ],
        capacity: 4,
        floor: 1,
        roomType: 'shared',
        amenities: ['ac', 'wifi', 'attached_bathroom', 'study_table'],
        rent: {
          perPerson: 8000,
          securityDeposit: 5000
        },
        status: 'available',
        isActive: true
      },
      {
        roomNumber: 'B205',
        hotelId: studentParadise._id,
        members: [
          { studentId: anita._id, isPrimary: true, joinedAt: new Date() }
        ],
        capacity: 2,
        floor: 2,
        roomType: 'double',
        amenities: ['wifi', 'attached_bathroom', 'balcony', 'wardrobe'],
        rent: {
          perPerson: 7000,
          securityDeposit: 3000
        },
        status: 'available',
        isActive: true
      }
    ]);

    // Create Sample Orders
    console.log('🍽️ Creating sample orders...');
    
    const order1 = new Order({
      studentId: rahul._id,
      hotelId: campusInn._id,
      orderNumber: 'ORD25012700001', // Manual order number for seeding
      items: [
        {
          menuItemId: campusInn.menu[0]._id.toString(),
          name: 'Breakfast Combo',
          price: 80,
          quantity: 1,
          category: 'breakfast',
          isVeg: true
        }
      ],
      orderType: 'daily_meal',
      subtotal: 80,
      taxes: 5,
      discount: 0,
      total: 85,
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'wallet'
    });
    await order1.save();
    
    const order2 = new Order({
      studentId: anita._id,
      hotelId: studentParadise._id,
      orderNumber: 'ORD25012700002', // Manual order number for seeding
      items: [
        {
          menuItemId: studentParadise.menu[1]._id.toString(),
          name: 'North Indian Lunch',
          price: 110,
          quantity: 1,
          category: 'lunch',
          isVeg: true
        }
      ],
      orderType: 'daily_meal',
      subtotal: 110,
      taxes: 8,
      discount: 0,
      total: 118,
      status: 'preparing',
      paymentStatus: 'paid',
      paymentMethod: 'wallet'
    });
    await order2.save();
    
    const orders = [order1, order2];

    // Note: Skipping transaction seeding due to validation issues
    // Transactions will be created automatically when orders are placed
    console.log('💳 Skipping transaction seeding for now...');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Hotels: ${hotels.length}`);
    console.log(`   Students: ${students.length}`);
    console.log(`   Orders: ${orders.length}`);
    console.log('\n🔐 Demo Accounts:');
    console.log('   Admin: admin@studenthotel.com / admin123');
    console.log('   Hotel Owner 1: hotel1@demo.com / password123');
    console.log('   Hotel Owner 2: hotel2@demo.com / password123');
    console.log('   Student 1: student1@demo.com / password123');
    console.log('   Student 2: student2@demo.com / password123');
    console.log('   Student 3: student3@demo.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seed script
if (require.main === module) {
  seedData();
}

module.exports = seedData;
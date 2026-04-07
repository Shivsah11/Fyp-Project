import mongoose from 'mongoose';
import Payment from './Src/Models/Payment.js';
import Tenant from './Src/Models/Tenant.js';
import Property from './Src/Models/Property.js';
import Booking from './Src/Models/Booking.js';
import dotenv from 'dotenv';

dotenv.config();

const createSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create sample tenants
    const tenant1 = new Tenant({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'Tenant',
      phone: '9876543210'
    });

    const tenant2 = new Tenant({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'password123',
      role: 'Tenant',
      phone: '9876543211'
    });

    await tenant1.save();
    await tenant2.save();
    console.log('Sample tenants created');

    // Create sample properties
    const property1 = new Property({
      title: 'Cozy Apartment',
      description: 'A nice apartment in the city center',
      price: '15000',
      location: 'Kathmandu',
      type: 'apartment',
      beds: 2,
      baths: 1,
      area: 800,
      landlordId: new mongoose.Types.ObjectId(), // This should be a real landlord ID
      status: 'active'
    });

    const property2 = new Property({
      title: 'Modern House',
      description: 'A beautiful house with garden',
      price: '25000',
      location: 'Pokhara',
      type: 'house',
      beds: 3,
      baths: 2,
      area: 1200,
      landlordId: new mongoose.Types.ObjectId(), // This should be a real landlord ID
      status: 'active'
    });

    await property1.save();
    await property2.save();
    console.log('Sample properties created');

    // Create sample bookings
    const booking1 = new Booking({
      propertyId: property1._id,
      tenantId: tenant1._id,
      landlordId: new mongoose.Types.ObjectId(), // This should be a real landlord ID
      checkInDate: '2024-01-01',
      checkOutDate: '2024-12-31',
      status: 'confirmed',
      paymentStatus: 'paid',
      price: '15000',
      totalAmount: 180000
    });

    const booking2 = new Booking({
      propertyId: property2._id,
      tenantId: tenant2._id,
      landlordId: new mongoose.Types.ObjectId(), // This should be a real landlord ID
      checkInDate: '2024-01-01',
      checkOutDate: '2024-12-31',
      status: 'confirmed',
      paymentStatus: 'pending',
      price: '25000',
      totalAmount: 300000
    });

    await booking1.save();
    await booking2.save();
    console.log('Sample bookings created');

    // Create sample payments
    const payment1 = new Payment({
      tenantId: tenant1._id,
      amount: 15000,
      method: 'esewa',
      description: 'Monthly rent for January',
      status: 'completed',
      date: '2024-01-15'
    });

    const payment2 = new Payment({
      tenantId: tenant2._id,
      amount: 25000,
      method: 'bank transfer',
      description: 'Monthly rent for January',
      status: 'pending',
      date: '2024-01-20'
    });

    const payment3 = new Payment({
      tenantId: tenant1._id,
      amount: 15000,
      method: 'credit card',
      description: 'Monthly rent for February',
      status: 'failed',
      date: '2024-02-15'
    });

    await payment1.save();
    await payment2.save();
    await payment3.save();
    console.log('Sample payments created');

    console.log('All sample data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample data:', error);
    process.exit(1);
  }
};

createSampleData();

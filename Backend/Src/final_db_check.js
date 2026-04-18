import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const BookingSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const PropertySchema = new mongoose.Schema({
  title: String,
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const UserSchema = new mongoose.Schema({
  email: String,
  role: String,
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const allUsers = await User.find({});
    console.log('--- ALL USERS ---');
    allUsers.forEach(u => {
      console.log(`ID: ${u._id}, Email: ${u.email}, Role: ${u.role}`);
    });
    console.log('');

    console.log('--- ACTIVE LANDLORDS ---');
    const landlords = await User.find({ role: 'landlord' });
    landlords.forEach(l => console.log(`ID: ${l._id}, Email: ${l.email}`));

    console.log('\n--- PROPERTIES & OWNERS ---');
    const properties = await Property.find();
    properties.forEach(p => console.log(`Property: ${p.title}, ID: ${p._id}, Owner: ${p.landlordId}`));

    console.log('\n--- RECENT BOOKINGS ---');
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
    bookings.forEach(b => console.log(`Booking: ${b._id}, Prop: ${b.propertyId}, Landlord: ${b.landlordId}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();

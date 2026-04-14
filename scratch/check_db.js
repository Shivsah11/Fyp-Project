import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/fyp_project");
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available Collections:', collections.map(c => c.name));

    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`Collection: ${col.name} - Count: ${count}`);
    }

    // Check specific fields in first booking if available
    const bookingCol = mongoose.connection.db.collection('bookings');
    const sample = await bookingCol.findOne();
    if (sample) {
      console.log('Sample Booking:', JSON.stringify(sample, null, 2));
    } else {
      console.log('No bookings found in the database.');
    }

    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

connectDB();

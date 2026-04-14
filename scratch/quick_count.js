import mongoose from 'mongoose';

const mongoURI = "mongodb://localhost:27017/fyp_project"; // Fallback URL

const run = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");
    
    // Define a minimal schema to avoid model errors
    const Booking = mongoose.model('Booking', new mongoose.Schema({}), 'bookings');
    
    const count = await Booking.countDocuments();
    console.log(`Total Bookings in 'bookings' collection: ${count}`);
    
    if (count > 0) {
      const sample = await Booking.findOne().lean();
      console.log("Sample ID:", sample._id);
      console.log("Sample Data:", JSON.stringify(sample, null, 2));
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

run();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './Models/Property.js';
import Landlord from './Models/Landlord.js';
import Booking from './Models/Booking.js';

dotenv.config();

const shiftData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const sourceEmail = "shiva@gmail.com";
    const targetEmail = "shivsa@gmail.com";

    const source = await Landlord.findOne({ email: sourceEmail });
    const target = await Landlord.findOne({ email: targetEmail });

    if (!target) {
      console.log('Target account not found!');
      process.exit(1);
    }

    console.log(`Shifting properties from ${sourceEmail} to ${targetEmail} (${target._id})`);

    const result = await Property.updateMany(
      {}, // Actually, let's just assign ALL properties in the DB to this TARGET email to be 100% sure!
      { $set: { landlordId: target._id } }
    );
    console.log(`Assigned ALL ${result.modifiedCount} properties to ${targetEmail}`);

    const bResult = await Booking.updateMany(
      {}, // Assign ALL bookings to this TARGET email too!
      { $set: { landlordId: target._id } }
    );
    console.log(`Assigned ALL ${bResult.modifiedCount} bookings to ${targetEmail}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
shiftData();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './Models/Property.js';
import Landlord from './Models/Landlord.js';
import Booking from './Models/Booking.js';

dotenv.config();

const duplicateData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const targetEmails = ["shivsa@gmail.com", "shiva@gmail.com", "suman@gmail.com", "landord@gmail.com"];
    const targets = await Landlord.find({ email: { $in: targetEmails } });

    // Source data currently resides on shivsa@gmail.com because of our last script
    const sourceProperties = await Property.find({}).lean();
    const sourceBookings = await Booking.find({}).lean();

    console.log(`Found ${sourceProperties.length} properties and ${sourceBookings.length} bookings.`);

    if (sourceProperties.length === 0) {
      console.log('No properties found to duplicate.');
      process.exit(1);
    }

    for (const target of targets) {
      // First, delete any EXISTING properties and bookings for this specific target so we don't multiply infinitely if run twice.
      await Property.deleteMany({ landlordId: target._id });
      await Booking.deleteMany({ landlordId: target._id });

      console.log(`Cloning data to ${target.email}...`);

      const idMap = new Map();

      // Clone properties
      for (const p of sourceProperties) {
        const newId = new mongoose.Types.ObjectId();
        idMap.set(p._id.toString(), newId);

        const newProp = {
          ...p,
          _id: newId,
          landlordId: target._id
        };
        await Property.create(newProp);
      }

      // Clone bookings
      for (const b of sourceBookings) {
        if (!b.propertyId || !idMap.has(b.propertyId.toString())) continue; // Only clone bookings for properties we just cloned

        const newBooking = {
          ...b,
          _id: new mongoose.Types.ObjectId(),
          propertyId: idMap.get(b.propertyId.toString()),
          landlordId: target._id
        };
        await Booking.create(newBooking);
      }
      
      console.log(`Successfully populated ${target.email} with ${sourceProperties.length} properties.`);
    }

    console.log('Duplication complete across all test accounts!');
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

duplicateData();

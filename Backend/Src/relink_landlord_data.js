import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './Models/Property.js';
import Landlord from './Models/Landlord.js';
import Booking from './Models/Booking.js';

dotenv.config();

const relinkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // The landlord's active login email based on context:
    const activeEmails = ["shivsa@gmail.com", "shiva@gmail.com", "suman@gmail.com", "landord@gmail.com"];

    // Let's find these landlords
    const landlords = await Landlord.find({ email: { $in: activeEmails } });
    if (landlords.length === 0) {
      console.log('Active landlords not found.');
      process.exit(1);
    }

    // Assign to the most pertinent S account, or fallback to the first found
    const activeLandlord = landlords.find(l => l.email.startsWith('shiv')) || landlords.find(l => l.email === 'suman@gmail.com') || landlords[0];
    const activeLandlordId = activeLandlord._id;

    console.log(`Relinking all dummy properties to Active Landlord ID: ${activeLandlordId} (${activeLandlord.email})`);

    // Old landlord IDs that currently hold the properties (including the one we just migrated to):
    const oldIds = ["69e0bffd41bf5e13a811c34b", "69c8f0e3750e64673abd4cff", "69e38076acdb802bb033554f"];

    // 1. Update Properties
    const propertyUpdateResult = await Property.updateMany(
      { landlordId: { $in: oldIds } },
      { $set: { landlordId: activeLandlordId } }
    );
    console.log(`Updated ${propertyUpdateResult.modifiedCount} properties.`);

    // 2. Fetch the updated properties to get their new IDs if needed (or just update bookings where landlordId is oldId)
    const bookingUpdateResult = await Booking.updateMany(
      { landlordId: { $in: oldIds } },
      { $set: { landlordId: activeLandlordId } }
    );
    console.log(`Updated ${bookingUpdateResult.modifiedCount} bookings that had old landlord references.`);

    // 3. Make sure the user's role is correctly lowercase 'landlord'
    await Landlord.updateOne({ _id: activeLandlordId }, { $set: { role: 'landlord' } });
    console.log("Ensured the active user's role is 'landlord'.");

    console.log("Relinking complete!");
    process.exit(0);

  } catch (error) {
    console.error('Error during relink:', error);
    process.exit(1);
  }
};

relinkData();


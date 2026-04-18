import mongoose from "mongoose";
import Booking from "./Src/Models/Booking.js";
import Property from "./Src/Models/Property.js";
import Landlord from "./Src/Models/Landlord.js";

async function check() {
  try {
    await mongoose.connect('mongodb+srv://ssah62729_db_user:rAnpfLB3sH1k4sgi@fyp.ynkn9id.mongodb.net/suitedreams');
    console.log("Connected to DB");
    
    // Specifically looking for landlord@gmail.com
    const landlords = await Landlord.find({ email: 'landord@gmail.com' });
    console.log("Landlords:", landlords.map(l => ({ id: l._id, email: l.email })));
    
    if (landlords.length > 0) {
      const landlordId = landlords[0]._id;
      const propertiesForLandlord = await Property.find({ landlordId });
      console.log(`Properties for landlord (id: ${landlordId}): ${propertiesForLandlord.length}`);
      
      const propertyIds = propertiesForLandlord.map(p => p._id);
      console.log("Property IDs:", propertyIds);
      
      const bookingsForLandlord = await Booking.find({ propertyId: { $in: propertyIds } });
      console.log(`Bookings found by propertyId $in: ${bookingsForLandlord.length}`);

      // Try finding by string propertyIds if there's type mismatch
      const stringPropertyIds = propertyIds.map(id => id.toString());
      const bookingsWithStringIds = await Booking.find({ propertyId: { $in: stringPropertyIds } });
      console.log(`Bookings found by String propertyId $in: ${bookingsWithStringIds.length}`);

      // Let's also check if landlordId is stored natively
      const bookingsByLandlordId = await Booking.find({ landlordId: { $in: [landlordId, landlordId.toString()] } });
      console.log(`Bookings found by landlordId directly: ${bookingsByLandlordId.length}`);

      const allBookings = await Booking.find();
      console.log(`Total bookings in DB: ${allBookings.length}`);
      if(allBookings.length > 0) {
          console.log("Sample booking propertyId type:", typeof allBookings[0].propertyId, "value:", allBookings[0].propertyId);
          console.log("Sample booking landlordId type:", typeof allBookings[0].landlordId, "value:", allBookings[0].landlordId);
          
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();

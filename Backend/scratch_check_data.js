import mongoose from "mongoose";
import Property from "./Src/Models/Property.js";

async function check() {
  try {
    await mongoose.connect('mongodb+srv://ssah62729_db_user:rAnpfLB3sH1k4sgi@fyp.ynkn9id.mongodb.net/suitedreams');
    
    const allProperties = await Property.find();
    console.log(`Total properties: ${allProperties.length}`);
    
    allProperties.forEach(p => {
        console.log(`Property ID: ${p._id}`);
        console.log(`Title: ${p.title}`);
        console.log(`Price: ${p.price}`);
        console.log(`Lat: ${p.lat}, Lng: ${p.lng}`);
        console.log('---');
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();

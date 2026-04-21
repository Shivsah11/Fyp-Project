import mongoose from "mongoose";
import Property from "../Src/Models/Property.js";

async function listProperties() {
  try {
    await mongoose.connect('mongodb+srv://ssah62729_db_user:rAnpfLB3sH1k4sgi@fyp.ynkn9id.mongodb.net/suitedreams');
    
    const allProperties = await Property.find();
    console.log("Property IDs:");
    allProperties.forEach(p => {
      console.log(`${p.title}: ${p._id}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
listProperties();

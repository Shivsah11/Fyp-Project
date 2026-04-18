import mongoose from "mongoose";
import Property from "./Src/Models/Property.js";

async function check() {
  try {
    await mongoose.connect('mongodb+srv://ssah62729_db_user:rAnpfLB3sH1k4sgi@fyp.ynkn9id.mongodb.net/suitedreams');
    
    const allProperties = await Property.find();
    console.log(`Total properties: ${allProperties.length}`);
    if(allProperties.length > 0) {
        console.log("Sample property 1 landlordId:", allProperties[0].landlordId);
        console.log("Sample property 2 landlordId:", allProperties[1]?.landlordId);
        
        let targetId = '69e38076acdb802bb033554f';
        console.log(`Looking for landlordId: ${targetId}`);
        const found = allProperties.filter(p => p.landlordId && p.landlordId.toString() === targetId);
        console.log(`Manual filter found: ${found.length} properties`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();

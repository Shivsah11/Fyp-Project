import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from './Src/Models/Notification.js';
import { createInternalNotification } from './Src/Controllers/NotificationController.js';

dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const testRecipientId = new mongoose.Types.ObjectId();
    
    console.log('Creating test notification for Landlord...');
    const noti = await createInternalNotification({
      recipient: testRecipientId,
      recipientModel: 'Landlord',
      title: 'Test Notification',
      message: 'This is a test notification for the landlord.',
      type: 'info'
    });

    console.log('Created notification:', noti);

    if (noti && noti.recipientModel === 'Landlord') {
      console.log('SUCCESS: Notification created with recipientModel');
    } else {
      console.log('FAILURE: Notification missing recipientModel or failed to create');
    }

    // Cleanup
    await Notification.findByIdAndDelete(noti._id);
    console.log('Cleaned up test notification');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
};

test();

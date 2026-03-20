const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to database
mongoose.connect('mongodb://127.0.0.1:27017/suitedreams')
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  // Define Admin schema
  const adminSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    role: String,
    permissions: {
      manageUsers: Boolean,
      manageProperties: Boolean,
      viewAnalytics: Boolean,
      systemSettings: Boolean
    },
    isActive: Boolean,
    createdAt: Date
  });
  
  const Admin = mongoose.model('Admin', adminSchema);
  
  // Check if admin exists
  const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
  if (existingAdmin) {
    console.log('✅ Admin already exists:', existingAdmin.email);
  } else {
    // Create admin
    const hashedPassword = await bcrypt.hash('123456', 10);
    const admin = new Admin({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'Admin',
      permissions: {
        manageUsers: true,
        manageProperties: true,
        viewAnalytics: true,
        systemSettings: false
      },
      isActive: true,
      createdAt: new Date()
    });
    
    await admin.save();
    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: 123456');
  }
  
  mongoose.connection.close();
})
.catch(err => console.error('❌ Error:', err));

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  
  const existing = await User.findOne({ email: 'aditi@gmail.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit();
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash('aditi1234', salt);

  await User.create({
    name: 'Aditi',
    email: 'aditi@gmail.com',
    password: hashed,
    role: 'admin',
    isVerified: true
  });

  console.log('✅ Admin created successfully');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit();
});
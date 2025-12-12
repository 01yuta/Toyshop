const mongoose = require('mongoose');
const User = require('../models/UserModel');
require('dotenv').config();

const [, , usernameArg, emailArg, passwordArg] = process.argv;

const promptUsage = () => {
  console.log('Usage: node src/scripts/createAdmin.js <username> <email> <password>');
  console.log('Example: node src/scripts/createAdmin.js admin admin@example.com StrongPass123');
};

if (!usernameArg || !emailArg || !passwordArg) {
  promptUsage();
  process.exit(1);
}

const createAdmin = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/toysecommerce';

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: emailArg });
    if (existing) {
      console.log('User with this email already exists. Aborting.');
      process.exit(1);
    }

    const user = await User.create({
      username: usernameArg,
      email: emailArg,
      password: passwordArg,
      isAdmin: true,
    });

    console.log('Admin account created successfully:');
    console.log(`  Username: ${user.username}`);
    console.log(`  Email:    ${user.email}`);
    console.log('You can now log in and access /admin/products');
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin user:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

createAdmin();




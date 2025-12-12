const mongoose = require('mongoose');
const Product = require('../models/ProductModel');
require('dotenv').config();

const migrateIsNewField = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/toysecommerce';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const result = await Product.updateMany(
      { isNew: { $exists: true }, isNewProduct: { $exists: false } },
      [
        {
          $set: {
            isNewProduct: '$isNew',
            isNew: '$$REMOVE'
          }
        }
      ]
    );

    console.log(`✅ Migration completed: ${result.modifiedCount} products updated`);
    console.log(`   - Field 'isNew' renamed to 'isNewProduct'`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error migrating:', error);
    process.exit(1);
  }
};

migrateIsNewField();


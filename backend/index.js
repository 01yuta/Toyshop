const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (allowedOrigins.some((o) => origin === o)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB error:', err.message));


const userRoutes = require('./src/routes/UserRouter');
const authRoutes = require('./src/routes/AuthRouter');
const productRoutes = require('./src/routes/ProductRouter');
const orderRoutes = require('./src/routes/OrderRouter');
const paymentRoutes = require('./src/routes/PaymentRouter');
const uploadRoutes = require('./src/routes/UploadRouter');
const supportRoutes = require('./src/routes/SupportRouter');

console.log("✅ PaymentRouter loaded");

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/support', supportRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Toy E-commerce Backend!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
const accountRoutes = require('./routes/accountRoutes');
const menuRoutes = require('./routes/menuRoutes');
const tableRoutes = require('./routes/tableRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const kioskRoutes = require('./routes/kioskRoutes');
const authRoutes = require('./routes/authRoutes');
const posRoutes = require('./routes/posRoutes');

app.use('/api/accounts', accountRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/kiosk', kioskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pos', posRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to The Self Station API' });
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// Health Check
app.get('/', (req, res) => res.json({ message: 'Billing System API is running' }));

// Sinkronisasi DB dan Jalankan Server
db.sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

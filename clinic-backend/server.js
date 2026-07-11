const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./db/store');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Only these origins are allowed to call this API. Add more via the
// ALLOWED_ORIGINS env var (comma-separated) if you ever add another
// domain (e.g. a custom domain on top of the Vercel one).
const defaultOrigins = [
  'https://family-medical-and-dental-care.vercel.app',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : defaultOrigins;

app.use(cors({
  origin: function (origin, callback) {
    // Allow tools with no Origin header (curl, Postman, server-to-server).
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  }
}));
app.use(express.json());

// Initialize Database (creates db/clinic-data.json and seeds it on first run)
initDB();

// Routes
app.use('/api/v1/appointments', require('./routes/appointments'));
app.use('/api/v1/inquiries', require('./routes/inquiries'));
app.use('/api/v1/services', require('./routes/services'));
app.use('/api/v1/admin', require('./routes/admin'));

// Basic Health Check
app.get('/', (req, res) => {
  res.json({ message: "Family Medical & Dental Care API is running locally." });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
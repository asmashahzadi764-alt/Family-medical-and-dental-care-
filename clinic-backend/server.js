const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./db/store');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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

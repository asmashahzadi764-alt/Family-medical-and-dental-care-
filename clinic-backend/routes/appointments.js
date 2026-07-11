const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { load, save, nextId } = require('../db/store');

// Rate limiting: 5 requests per 15 mins per IP
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many booking attempts. Please try again later." }
});

// Helper: Validate Pakistani Phone Number (+92 3XX XXXXXXX)
const isValidPakistaniPhone = (phone) => {
  const regex = /^\+92\s?3\d{2}\s?\d{7}$/;
  return regex.test(phone);
};

const ALL_SLOTS = ['10AM-12PM', '12PM-2PM', '5PM-7PM', '7PM-9PM'];

// GET /api/v1/appointments/available-slots?date=YYYY-MM-DD
router.get('/available-slots', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Date is required" });

  const day = new Date(date + 'T00:00:00').getDay();
  if (day === 0) { // Sunday
    return res.json({ date, availableSlots: [], closed: true, message: "Clinic is closed on Sundays." });
  }

  const data = load();
  const bookedSlots = data.appointments
    .filter(a => a.preferred_date === date && a.status !== 'Cancelled')
    .map(a => a.time_slot);

  const availableSlots = ALL_SLOTS.filter(s => !bookedSlots.includes(s));
  res.json({ date, availableSlots });
});

// POST /api/v1/appointments
router.post('/', bookingLimiter, (req, res) => {
  const { full_name, phone_number, service_type, preferred_date, time_slot } = req.body;

  // Basic Validation
  if (!full_name || !phone_number || !service_type || !preferred_date || !time_slot) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Date Validation (Sunday Check)
  const bookingDate = new Date(preferred_date + 'T00:00:00');
  if (isNaN(bookingDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
  }
  if (bookingDate.getDay() === 0) {
    return res.status(400).json({ error: "Clinic is closed on Sundays. Please choose another date." });
  }

  // Past Date Check
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (bookingDate < today) {
    return res.status(400).json({ error: "Cannot book appointments in the past." });
  }

  // Time Slot Validation
  if (!ALL_SLOTS.includes(time_slot)) {
    return res.status(400).json({ error: `time_slot must be one of: ${ALL_SLOTS.join(', ')}` });
  }

  // Phone Validation
  if (!isValidPakistaniPhone(phone_number)) {
    return res.status(400).json({ error: "Please provide a valid Pakistani phone number (+92 3XX XXXXXXX)." });
  }

  const data = load();

  // Double Booking Check
  const clash = data.appointments.find(
    a => a.preferred_date === preferred_date && a.time_slot === time_slot && a.status !== 'Cancelled'
  );
  if (clash) {
    return res.status(409).json({ error: "This time slot is already booked. Please select another slot or date." });
  }

  const appointment = {
    id: nextId(data, 'appointments'),
    full_name,
    phone_number,
    service_type,
    preferred_date,
    time_slot,
    status: 'Pending',
    created_at: new Date().toISOString()
  };

  data.appointments.push(appointment);
  save(data);

  res.status(201).json({
    message: "Appointment request submitted successfully. Our team will contact you to confirm.",
    appointmentId: appointment.id
  });
});

module.exports = router;

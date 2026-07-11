const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { load, save } = require('../db/store');
const auth = require('../middleware/auth');

// POST /api/v1/admin/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const data = load();
  const user = data.admin_users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid email or password." });

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) return res.status(401).json({ error: "Invalid email or password." });

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '8h' }
  );

  res.json({ token, user: { name: user.name, role: user.role } });
});

// GET /api/v1/admin/dashboard-stats
router.get('/dashboard-stats', auth, (req, res) => {
  const data = load();
  const todayStr = new Date().toISOString().slice(0, 10);

  const todayAppointments = data.appointments.filter(
    a => a.created_at.slice(0, 10) === todayStr
  ).length;

  const pendingInquiries = data.inquiries.filter(i => i.status === 'New').length;

  res.json({ todayAppointments, pendingInquiries });
});

// GET /api/v1/admin/appointments
router.get('/appointments', auth, (req, res) => {
  const data = load();
  const rows = [...data.appointments].sort((a, b) => {
    if (a.preferred_date !== b.preferred_date) {
      return b.preferred_date.localeCompare(a.preferred_date);
    }
    return a.time_slot.localeCompare(b.time_slot);
  });
  res.json(rows);
});

// PATCH /api/v1/admin/appointments/:id
router.patch('/appointments/:id', auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  const data = load();
  const appointment = data.appointments.find(a => a.id === id);

  if (!appointment) return res.status(404).json({ error: "Appointment not found." });

  appointment.status = status;
  save(data);
  res.json({ message: "Appointment updated", id, status });
});

// GET /api/v1/admin/inquiries
router.get('/inquiries', auth, (req, res) => {
  const data = load();
  const rows = [...data.inquiries].sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(rows);
});

// PATCH /api/v1/admin/inquiries/:id
router.patch('/inquiries/:id', auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  const data = load();
  const inquiry = data.inquiries.find(i => i.id === id);

  if (!inquiry) return res.status(404).json({ error: "Inquiry not found." });

  inquiry.status = status;
  save(data);
  res.json({ message: "Inquiry updated", id, status });
});

// POST /api/v1/admin/change-password
router.post('/change-password', auth, async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: "Current password and new password are required." });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters long." });
  }
  if (new_password === current_password) {
    return res.status(400).json({ error: "New password must be different from the current password." });
  }

  const data = load();
  const user = data.admin_users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Admin user not found." });

  const validPassword = await bcrypt.compare(current_password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }

  user.password_hash = await bcrypt.hash(new_password, 10);
  save(data);

  res.json({ message: "Password updated successfully. Please log in again next time with your new password." });
});

module.exports = router;

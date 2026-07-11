const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { load, save, nextId } = require('../db/store');

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many inquiries. Please wait 15 minutes." }
});

// POST /api/v1/inquiries
router.post('/', inquiryLimiter, (req, res) => {
  const { full_name, phone_number, service_interest, message } = req.body;

  if (!full_name || !phone_number || !message) {
    return res.status(400).json({ error: "Name, phone, and message are required." });
  }

  const data = load();

  const inquiry = {
    id: nextId(data, 'inquiries'),
    full_name,
    phone_number,
    service_interest: service_interest || null,
    message,
    status: 'New',
    created_at: new Date().toISOString()
  };

  data.inquiries.push(inquiry);
  save(data);

  res.status(201).json({
    message: "Thank you for your inquiry. We will get back to you within 24 hours.",
    inquiryId: inquiry.id
  });
});

module.exports = router;

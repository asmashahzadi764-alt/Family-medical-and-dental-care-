const express = require('express');
const router = express.Router();
const { load, save, nextId } = require('../db/store');
const auth = require('../middleware/auth');

// GET /api/v1/services  (public - only active services, for services.html)
router.get('/', (req, res) => {
  const data = load();
  const active = data.services
    .filter(s => s.active)
    .sort((a, b) => a.display_order - b.display_order);
  res.json(active);
});

// GET /api/v1/services/admin/all  (admin - includes inactive services)
router.get('/admin/all', auth, (req, res) => {
  const data = load();
  const all = [...data.services].sort((a, b) => a.display_order - b.display_order);
  res.json(all);
});

// POST /api/v1/services  (admin - create new service)
router.post('/', auth, (req, res) => {
  const { title, short_description, icon_name, is_specialty, display_order } = req.body;

  if (!title || !short_description || !icon_name) {
    return res.status(400).json({ error: "title, short_description, and icon_name are required." });
  }

  const data = load();
  const service = {
    id: nextId(data, 'services'),
    title,
    short_description,
    icon_name,
    is_specialty: !!is_specialty,
    display_order: display_order || 0,
    active: true
  };
  data.services.push(service);
  save(data);

  res.status(201).json({ message: "Service created.", id: service.id });
});

// PATCH /api/v1/services/:id  (admin - edit a service)
router.patch('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = load();
  const service = data.services.find(s => s.id === id);

  if (!service) return res.status(404).json({ error: "Service not found." });

  const { title, short_description, icon_name, is_specialty, display_order, active } = req.body;
  if (title !== undefined) service.title = title;
  if (short_description !== undefined) service.short_description = short_description;
  if (icon_name !== undefined) service.icon_name = icon_name;
  if (is_specialty !== undefined) service.is_specialty = !!is_specialty;
  if (display_order !== undefined) service.display_order = display_order;
  if (active !== undefined) service.active = !!active;

  save(data);
  res.json({ message: "Service updated.", id });
});

// DELETE /api/v1/services/:id  (admin - remove a service)
router.delete('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = load();
  const index = data.services.findIndex(s => s.id === id);

  if (index === -1) return res.status(404).json({ error: "Service not found." });

  data.services.splice(index, 1);
  save(data);
  res.json({ message: "Service deleted.", id });
});

module.exports = router;

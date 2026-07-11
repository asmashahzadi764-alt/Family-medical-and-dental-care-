const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DB_FILE = path.resolve(__dirname, 'clinic-data.json');

function defaultData() {
  return {
    nextIds: { admin_users: 1, services: 1, appointments: 1, inquiries: 1 },
    admin_users: [],
    services: [],
    appointments: [],
    inquiries: []
  };
}

function load() {
  if (!fs.existsSync(DB_FILE)) {
    save(defaultData());
  }
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(raw);
}

function save(data) {
  // Write to a temp file first, then rename — avoids a half-written file
  // if the process crashes mid-write.
  const tmpFile = DB_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
  fs.renameSync(tmpFile, DB_FILE);
}

function nextId(data, table) {
  const id = data.nextIds[table];
  data.nextIds[table] += 1;
  return id;
}

// Creates clinic-data.json on first run and seeds it with an admin
// account and a few starter services, same as the original schema.sql did.
//
// The admin password is NEVER hardcoded here. It comes from the
// ADMIN_SEED_PASSWORD environment variable (set in your .env file, which
// is not committed to source control). If you don't set one, a random
// password is generated and printed once in the terminal — copy it
// immediately, because it is not stored anywhere in plain text after that.
function initDB() {
  const data = load();

  if (data.admin_users.length === 0) {
    const seedPassword = process.env.ADMIN_SEED_PASSWORD || crypto.randomBytes(6).toString('hex');

    data.admin_users.push({
      id: nextId(data, 'admin_users'),
      name: process.env.ADMIN_SEED_NAME || 'Admin',
      email: process.env.ADMIN_SEED_EMAIL || 'admin@clinic.com',
      password_hash: bcrypt.hashSync(seedPassword, 10),
      role: 'Admin',
      created_at: new Date().toISOString()
    });

    if (!process.env.ADMIN_SEED_PASSWORD) {
      console.log('\n============================================');
      console.log('No ADMIN_SEED_PASSWORD set in .env.');
      console.log('Generated a one-time admin password:');
      console.log('  Email:    ' + (process.env.ADMIN_SEED_EMAIL || 'admin@clinic.com'));
      console.log('  Password: ' + seedPassword);
      console.log('Copy this now — it will not be shown again.');
      console.log('Change it via the dashboard after logging in.');
      console.log('============================================\n');
    }
  }

  if (data.services.length === 0) {
    const seedServices = [
      { title: 'General Dentistry', short_description: 'Preventative care is the foundation of oral health. We offer comprehensive examinations, digital X-rays, and customized dental education to keep your smile bright and healthy.', icon_name: 'health_and_safety', is_specialty: false, display_order: 1 },
      { title: 'Root Canal Treatment', short_description: 'Endodontic therapy focused on pain relief and tooth preservation. Using modern rotary techniques for a comfortable, efficient experience that saves your natural teeth.', icon_name: 'biotech', is_specialty: false, display_order: 2 },
      { title: 'Tooth-Saving & Restorative Care', short_description: 'We specialize in advanced procedures designed to restore and protect compromised teeth. From biocompatible crowns to intricate bridge work, we prioritize conservative dentistry to save your natural smile.', icon_name: 'healing', is_specialty: true, display_order: 3 },
      { title: 'Extractions', short_description: 'Painless extractions for non-restorable teeth or wisdom tooth removal. We ensure a gentle process with comprehensive post-operative care for a speedy recovery.', icon_name: 'remove_circle', is_specialty: false, display_order: 4 },
      { title: 'Scaling & Polishing', short_description: 'Professional hygiene services to remove plaque and tartar buildup. Essential for preventing gum disease and maintaining long-term periodontal health.', icon_name: 'cleaning_services', is_specialty: false, display_order: 5 },
      { title: 'Combined Care', short_description: 'Integrated healthcare approach addressing the link between oral health and systemic well-being. Ideal for patients with chronic conditions requiring coordinated care.', icon_name: 'medication', is_specialty: false, display_order: 6 }
    ];
    seedServices.forEach(s => {
      data.services.push({
        id: nextId(data, 'services'),
        active: true,
        ...s
      });
    });
  }

  save(data);
  console.log('Database ready at', DB_FILE);
}

module.exports = { load, save, nextId, initDB, DB_FILE };

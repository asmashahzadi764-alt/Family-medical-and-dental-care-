# Family Medical & Dental Care — Backend

A local Node.js + Express backend for the Multan clinic website
(index.html, about.html, services.html, book.html, contact.html).

Data is stored in a plain JSON file (`db/clinic-data.json`), not SQLite —
this was changed from the original Stitch output so the project needs
**zero native/compiled dependencies**. That means `npm install` works
reliably on any machine (Windows, Mac, Linux) without needing Python or
Visual Studio Build Tools installed, which is a common source of errors
with packages like `sqlite3`.

## 🚀 Quick Start

1. **Unzip** the files into a folder.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set `ADMIN_SEED_PASSWORD` to a password of your choice
   (this becomes your admin login password the first time the server runs).
   If you leave it blank, the server generates a random one-time password
   and prints it in the terminal — you must copy it immediately, since it
   is never shown or stored in plain text again.

4. **Run the server**:
   ```bash
   npm start
   ```
   The server starts at `http://localhost:5000`. On first run it
   automatically creates `db/clinic-data.json` and seeds it with:
   - One admin account, using the credentials from `.env`
     (or a printed one-time password if you left `ADMIN_SEED_PASSWORD` blank)
   - Three starter services

## 🧪 Testing Endpoints

### 1. Appointments (Public)

**Check available slots:**
```
GET /api/v1/appointments/available-slots?date=2026-07-10
```

**Book an appointment:**
```
POST /api/v1/appointments
Content-Type: application/json

{
  "full_name": "Ahmad Malik",
  "phone_number": "+92 300 1234567",
  "service_type": "Root Canal Treatment",
  "preferred_date": "2026-07-10",
  "time_slot": "10AM-12PM"
}
```
`time_slot` must be one of: `10AM-12PM`, `12PM-2PM`, `5PM-7PM`, `7PM-9PM`.

### 2. Inquiries (Public)
```
POST /api/v1/inquiries
Content-Type: application/json

{
  "full_name": "Sara Khan",
  "phone_number": "+92 312 9876543",
  "message": "Do you offer braces for children?"
}
```

### 3. Services (Public)
```
GET /api/v1/services
```

### 4. Admin Login (Private)
```
POST /api/v1/admin/login
Content-Type: application/json

{
  "email": "admin@clinic.com",
  "password": "whatever you set in ADMIN_SEED_PASSWORD"
}
```
Returns a JWT `token`. Send it as `Authorization: Bearer <token>` on all
`/api/v1/admin/*` routes below.

> ⚠️ The admin password is set in your local `.env` file, never in the
> source code, and `.env` is excluded from version control via
> `.gitignore`. Use the "Change Password" option in the admin dashboard
> (or `POST /api/v1/admin/change-password`) if you ever need to rotate it.

### 5. Admin Routes (require the Bearer token)
- `GET /api/v1/admin/dashboard-stats`
- `GET /api/v1/admin/appointments`
- `PATCH /api/v1/admin/appointments/:id` — body: `{ "status": "Confirmed" }`
- `GET /api/v1/admin/inquiries`
- `PATCH /api/v1/admin/inquiries/:id` — body: `{ "status": "Contacted" }`
- `POST /api/v1/admin/change-password` — body: `{ "current_password": "...", "new_password": "..." }` (min 8 characters, must differ from current)
- `GET /api/v1/services/admin/all`
- `POST /api/v1/services`
- `PATCH /api/v1/services/:id`
- `DELETE /api/v1/services/:id`

## 🛠 Business Rules Implemented

- **Sunday check**: rejects any `preferred_date` that falls on a Sunday.
- **Past-date check**: rejects dates before today.
- **Double booking**: rejects duplicate `date + time_slot` combinations
  (unless the existing one was Cancelled).
- **Phone validation**: enforces `+92 3XX XXXXXXX` format.
- **Rate limiting**: 5 requests per 15 minutes per IP on the public
  booking and inquiry endpoints, to reduce spam.
- **Authentication**: JWT required on every `/api/v1/admin/*` route.

## 🔌 Connecting Your Existing HTML Forms

In `book.html`, replace the fake `setTimeout` submit handler with a real
`fetch()` call, e.g.:

```javascript
document.getElementById('appointmentForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const payload = {
    full_name: formData.get('full_name'),
    phone_number: formData.get('phone'),
    service_type: formData.get('service'),
    preferred_date: formData.get('date'),
    time_slot: formData.get('time')
  };

  const res = await fetch('http://localhost:5000/api/v1/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await res.json();

  if (res.ok) {
    alert(result.message);
    e.target.reset();
  } else {
    alert(result.error);
  }
});
```

Do the same pattern for the inquiry form in `contact.html`, pointing at
`/api/v1/inquiries`.

## 📁 Project Structure

```
clinic-backend/
├── server.js
├── package.json
├── .env.example
├── db/
│   └── store.js        (JSON file read/write + seed data)
├── middleware/
│   └── auth.js          (JWT verification)
└── routes/
    ├── appointments.js
    ├── inquiries.js
    ├── services.js
    └── admin.js
```

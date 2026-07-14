<h1 align="center">Family Medical And Dental Care</h1>
<p align="center"><strong>Website & Online Appointment Booking System</strong></p>
<p align="center">
A full-stack website with an online booking system, a patient inquiry form, and an admin dashboard,
built for a family dental & medical clinic in Multan, Pakistan.
</p>

<p align="center">
<a href="https://family-medical-and-dental-care.vercel.app"><img src="https://img.shields.io/badge/Live_Site-Visit_Website-1F4B3F?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Site"/></a>
<a href="https://fmdc-backend-v7gu.onrender.com"><img src="https://img.shields.io/badge/Live_API-View_Endpoint-C1791A?style=for-the-badge&logo=render&logoColor=white" alt="Live API"/></a>
<a href="https://github.com/asmashahzadi764-alt/Family-medical-and-dental-care-"><img src="https://img.shields.io/badge/Source_Code-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="Source Code"/></a>
</p>

---

## Client Details

| | |
|---|---|
| **Clinic name** | Family Medical And Dental Care |
| **Practitioner** | Dr. Arif Siddiqui (BDS) |
| **Tagline** | "Honest Care, Healthy Smiles." |
| **Location** | Loha Market Rd, Kiri Dawood Khan, Multan, Punjab, Pakistan |
| **Hours** | Mon–Sat: 10:00 AM–2:00 PM & 5:00 PM–9:00 PM · Closed Sundays |
| **Phone** | +92 301 7483133 |
| **Email** | arifsiddiqui1526@yahoo.com |
| **Specialty** | Conservative, tooth-saving dentistry combined with general medical consultations under one roof |

---

## What This Project Does

**For patients (public site)**
- Browse services, with full details available in a click-through modal
- Book an appointment online — date, time slot, and service, with real-time
  validation (no Sunday bookings, no past dates, no double-booked slots,
  Pakistani phone number format enforced)
- Send a general inquiry through a contact form
- Reach the clinic directly by phone, email, or a one-tap WhatsApp button
  (present on every page)
- Fully responsive — works smoothly on mobile, including a dedicated
  bottom navigation bar

**For clinic staff (admin dashboard)**
- Secure login with session-based authentication
- View and update the status of every appointment (Pending → Confirmed →
  Completed/Cancelled)
- View and track every inquiry (New → Contacted → Closed)
- Add, edit, hide, or delete services shown on the public site — no code
  changes needed
- Change the admin password directly from the dashboard

---

## Tech Stack

**Frontend**

<p>
<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
</p>

- Plain HTML5 + Tailwind CSS (via CDN)
- Vanilla JavaScript (no framework — fetch API for all backend calls)
- Fonts: Fraunces (headings) + Inter (body text)
- Icons: Material Symbols
- Custom scroll-reveal animations (IntersectionObserver)

**Backend**

<p>
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
<img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
<img src="https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white" alt="JSON"/>
</p>

- Node.js + Express
- Data storage: a plain JSON file (`db/clinic-data.json`) — no SQL
  database, so the project needs zero native/compiled dependencies and
  installs reliably on any machine
- Authentication: JWT (`jsonwebtoken`) + bcryptjs for password hashing
- Security: rate limiting on public form endpoints, CORS locked to the
  live frontend domain only
- Config: dotenv for environment variables

**Hosting & Infrastructure**

<p>
<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
<img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render"/>
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</p>

| Layer | Service |
|---|---|
| Frontend (static site) | Vercel |
| Backend (API) | Render |
| Source control | GitHub |

---

## Project Structure

```
family-medical-and-dental-care/
├── index.html          Homepage
├── about.html           About Dr. Arif Siddiqui + clinic philosophy
├── services.html        Services list (loaded live from the backend)
├── book.html             Appointment booking form
├── contact.html          Contact / inquiry form
├── admin.html             Admin dashboard (login-protected, noindexed)
├── privacy.html           Privacy policy
├── faq.html                Frequently asked questions
├── favicon.svg              Site icon
├── assets/                    Images used across the site
├── .gitignore
└── clinic-backend/
    ├── server.js               Express app entry point
    ├── package.json
    ├── .env.example
    ├── db/
    │   └── store.js                JSON file read/write + first-run seeding
    ├── middleware/
    │   └── auth.js                  Session verification
    └── routes/
        ├── appointments.js           Booking logic + business rules
        ├── inquiries.js               Contact form handling
        ├── services.js                 Public + admin service management
        └── admin.js                     Login, dashboard stats, appointment/inquiry management
```

---

## API Overview

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/services` | Public |
| POST | `/api/v1/appointments` | Public |
| GET | `/api/v1/appointments/available-slots` | Public |
| POST | `/api/v1/inquiries` | Public |
| POST | `/api/v1/admin/login` | Public |
| GET, PATCH | `/api/v1/admin/appointments` | Admin only |
| GET, PATCH | `/api/v1/admin/inquiries` | Admin only |
| GET, POST, PATCH, DELETE | `/api/v1/services/*` (admin routes) | Admin only |
| POST | `/api/v1/admin/change-password` | Admin only |

Full details are in `clinic-backend/README.md`.

---

## Running Locally

**Backend**
```bash
cd clinic-backend
npm install
cp .env.example .env
npm start
```
Runs at `http://localhost:5000`.

**Frontend**
```bash
python -m http.server 5500
```
Then open `http://localhost:5500/index.html`. (Opening the HTML files
directly with a double-click won't work reliably — the browser blocks the
API calls from a `file://` page.)

> The deployed frontend points to the live Render backend by default
> (`API_BASE_URL` in each page's script). Change that constant back to
> `http://localhost:5000` in `book.html`, `contact.html`, `services.html`,
> and `admin.html` if you want to test fully offline against your local
> backend instead.

---

## Security Notes

- Admin passwords are hashed and never stored in plain text.
- Admin-only routes require a valid authenticated session.
- Public booking and inquiry endpoints are rate-limited to reduce spam.
- CORS is restricted to the live frontend domain — no other website can
  call this API from a browser.
- `admin.html` is marked `noindex, nofollow` so it won't appear in search
  results.
- `.env` and the real data file (`clinic-data.json`) are excluded from
  version control via `.gitignore`.

---

## Credits

Designed and built by **Asma Shahzadi** for Dr. Arif Siddiqui's Family
Medical And Dental Care clinic in Multan — from the frontend design and
booking flow to a fully working backend, admin dashboard, and live
deployment.
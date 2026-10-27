Build a full-stack web application called **CareID**: a personal health profile website for people in Malaysia, with emergency family alerts, a Jane / John Doe family search, live hospital emergency department traffic by triage zone, hospital queue numbers and maps. It is a university project, so the code must be clean, well commented and easy for a student to run in VS Code.

---

## 1. Tech stack

- **Frontend:** plain HTML, CSS and JavaScript (no framework), split into `public/index.html`, `public/style.css`, `public/script.js`.
- **Backend:** Node.js 18+ with Express, REST API under `/api`, JSON in and out.
- **Database:** MySQL (must work with XAMPP / phpMyAdmin). Provide `database/schema.sql` and `database/seed.sql`.
- **SMS:** Twilio. If Twilio keys are missing, run in "simulated" mode and print every SMS in the terminal instead.
- **Maps:** Google Maps JavaScript API + Directions API. If no key is set, fall back to a built-in map drawn in SVG.
- **Config:** `.env` file (provide `.env.example`) with PORT, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, GOOGLE_MAPS_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.
- **Packages:** express, mysql2, dotenv, twilio (nodemon as dev dependency). Scripts: `npm start`, `npm run dev`.
- The Express server serves the website from `public/`, receipt images from `uploads/`, and the API from `/api`.
- **Demo mode:** if `index.html` is opened directly as a file, or the server is not reachable, the site still works fully with sample data saved in localStorage. A small label next to the logo shows "Connected · SMS simulated/twilio" or "Demo mode · sample data".

Folder structure:
```
careid/
  database/schema.sql, seed.sql
  public/index.html, style.css, script.js
  server/index.js, db.js
  server/lib/alerts.js, sms.js, match.js, geo.js, helpers.js
  server/routes/index.js, health.js, receipts.js, contacts.js, emergencies.js, unidentified.js
  uploads/
  .env.example, .gitignore, package.json, README.md
```

---

## 2. Design

- Clean, calm medical app look. Teal accent colour, cool grey-green neutrals, white cards with thin borders.
- Semantic colours separate from the accent: **red** (critical), **yellow/amber** (semi-urgent), **green** (non-urgent).
- Fonts from Google Fonts: Bricolage Grotesque (headings), Figtree (body), JetBrains Mono (IDs, numbers, phone numbers).
- Light and dark mode using CSS variables and `prefers-color-scheme`.
- Fully responsive down to phone width (about 390px), no horizontal scrolling, 16px side padding.
- Sticky top bar: "CareID" logo with a "+" icon, the mode label, and the user's name and CareID number on the right.
- Tab bar with 5 tabs: **My health**, **Emergency contacts**, **Emergency alerts**, **Find family**, **Hospital traffic & queue**.
- Toast messages at the bottom for every action ("Profile saved", "Alert sent to Rosli, Norhayati").
- Status shown with pills (coloured dot + text), not only numbers.
- Accessible: visible keyboard focus, labels on every input, respects reduced motion.

---

## 3. Sample data (seed)

Use a made-up sample person: **Aiman Hakimi bin Rosli**, CareID `CID-0412-7781`, born 2004-03-12, 68 kg, blood type O+, thalassaemia "Not a carrier", HIV "Negative" (tested 2025-06, **not shared** by default), allergies "Penicillin, Peanuts", condition "Asthma (mild)", organ donor "Pledged", "Regular donor" of blood, last donation 2026-07-18, 6 donations.

- **Emergency contacts:** Rosli bin Ahmad (Father, +60 12-480 2231), Norhayati binti Ismail (Mother, +60 13-722 9104), Nur Aina Rosli (Sister, +60 11-3301 5567). All receive alerts.
- **Medicines:**
  - Active: Cetirizine 10 mg (once a day), Salbutamol inhaler 100 mcg (as needed), Vitamin D3 1000 IU (once a day).
  - Completed: Paracetamol 500 mg, Erythromycin 250 mg.
- **Vaccinations:** Influenza (next due 2026-11), Tdap booster (next due 2034-09), COVID-19 Comirnaty dose 2 and booster, MMR, Hepatitis B, BCG.
- **Medical records:** Klinik Kesihatan Bangi visits, an emergency visit for a sprained ankle at Hospital Kajang, a blood donation at Pusat Darah Negara, an asthma review, allergy and HIV tests, and thalassaemia screening in Form 4.
- **Hospitals (real coordinates):**
  - Hospital Kuala Lumpur (HKL, 3.1716, 101.7016, capacity 120)
  - Hospital Canselor Tuanku Muhriz (HCTM UKM, 3.0976, 101.7258, 80)
  - Hospital Sungai Buloh (3.2187, 101.5838, 90)
  - Hospital Kajang (2.9938, 101.7887, 60)
  - Hospital Selayang (3.2432, 101.6457, 70)
- **Unidentified patients (4 samples):**
  - UNK-0193 at HKL: male 25–35, road accident on Jalan Tun Razak, blue denim jacket, black helmet, tattoo on left forearm, red zone.
  - UNK-0191 at Selayang: female 18–25, fainted at LRT Gombak, black hoodie, university lanyard, green zone.
  - UNK-0188 at Selayang: female 60–75, collapsed at Pasar Borong Selayang, green baju kurung, grey tudung, yellow zone.
  - UNK-0186 at Kajang: male 40–55, fall at construction site in Semenyih, orange safety vest, yellow zone.
- The user's own location for distances is a sample point at IIUM Gombak (3.2516, 101.7346).

---

## 4. Features by tab

### Tab 1: My health (dashboard + health profile + medical records on ONE page)

**Top summary row (4 tiles):**
- Blood type, with thalassaemia status underneath
- Number of allergies and their names
- Medicine doses taken today, e.g. "1/2"
- Hospital queue number, or "No number" with a link to the Hospital traffic tab

If there is an active medical emergency, show a red banner below the tiles with a "View emergency" button.

**Health profile section (two columns):**
- **Left card, Personal details** (view mode with an "Edit profile" button that switches to a form):
  - Basics: full name, date of birth (with age), weight.
  - Blood and screening: blood type; thalassaemia (Not a carrier / Carrier alpha trait / Carrier beta trait / Intermedia / Major / Not screened); HIV / AIDS status (Negative / HIV positive / AIDS / Not tested / Prefer not to say) with last test month.
  - Allergies and conditions as tags (allergies in red).
  - Donor status: organ donor (Pledged / Not pledged); blood donor (Regular / Occasional / Not a donor / Not eligible) with total donations, last donation date and "next eligible" date (90 days later).
- **Right card, What responders see:** a preview of the emergency view for ambulance crews and hospitals.
  - Large blood type, organ donor status, allergies, conditions and thalassaemia, current medicines.
  - HIV status shows only as "HIV status: private" unless the user ticks **"Share my HIV / AIDS status with emergency responders"**. This is off by default.

**Medicines and vaccinations section (two columns):**
- **Prescriptions:**
  - Each active medicine shows its name, dose, how often, who prescribed it, and when it was last taken.
  - Small dots show today's doses taken out of the doses per day.
  - A "Mark dose taken" button records the time. It is disabled once today's doses are complete.
  - A "Finish course" button moves the medicine to a collapsible "Completed prescriptions" list.
  - An "Add a prescription" form: name and strength, dose, how often (as needed or 1–4 times a day), prescribed by.
  - **Allergy check:** when a medicine conflicts with an allergy, show a red tag "Conflicts with Penicillin allergy. Check with your doctor." and a warning toast. Include medicine families: penicillin → amoxicillin, ampicillin, cloxacillin, Augmentin, piperacillin; sulfa → co-trimoxazole, Bactrim; aspirin; peanut → arachis oil.
- **Vaccinations:**
  - A table with vaccine and place, dose, date given, and next due.
  - Next due shows "Due Nov 2026" (yellow pill) within 60 days, or "Overdue" (red pill).
  - A summary line, e.g. "8 doses recorded · 1 due soon".
  - An "Add a vaccination" form.

**Medical records and receipts section (two columns):**
- **Medical records:** a timeline, newest first, with the date, a title and details.
- **Medical receipts:**
  - Upload a photo of a receipt with the clinic or hospital name, date and amount (RM).
  - Resize the image in the browser to a maximum of 900px before uploading.
  - Show a grid of thumbnails with the clinic, date and amount, plus a summary like "2 receipts · RM 16.00 spent in 2026".
  - Clicking a thumbnail opens a lightbox with the receipt, a Delete button and a Close button (Escape also closes it).
  - In demo mode, generate 2 sample receipt images using canvas.

### Tab 2: Emergency contacts

- A list of contacts showing the initial avatar, name, relationship and phone number, a **"Receives emergency alerts"** checkbox, and a Remove button.
- An "Add a contact" form: name, relationship, phone.
- **Alert history:** every message sent to family, with the date and time, title (Emergency alert / Update: transported / Update: arrived / Emergency alert, unidentified patient now identified), emergency type and hospital, emergency ID, and who it was sent to with each delivery status.

### Tab 3: Emergency alerts (any medical emergency, not only accidents)

**Report form:**
- **Type of emergency:**
  - Sudden illness: suspected heart attack, suspected stroke, severe asthma attack, seizure, collapsed or unconscious, severe allergic reaction, difficulty breathing, very high fever or dengue warning signs, diabetic emergency, pregnancy emergency.
  - Injury: road accident, fall, workplace injury, sports injury, burn.
  - Other medical emergency.
- **Patient identity:** "Known: MyKad or CareID found", or "Unknown: no ID, cannot speak (Jane / John Doe)". Choosing Unknown shows a "Description for identification" field.
- **Location:** a text field plus a **map**. Tapping the map drops a pin, fills in "Near Ampang (3.1244, 101.7361)" and selects the nearest hospital. Below the map, show the nearest 3 hospitals and the route distance and time.
- **Receiving hospital:** a dropdown.
- **Responder triage:** red, yellow or green.
- **Reported by:** ambulance crew (MERS 999), police at scene, hospital or clinic staff, or 999 call centre.
- Buttons: Report emergency, Advance status, Clear.

**Emergency status card:**
- 4 steps with checkmarks: **Reported → Verified → Transported → Arrived and triaged**.
- Family are only alerted from "Verified" onwards, so they never receive unconfirmed information.

**Map behaviour:**
- A dashed route line from the emergency pin to the hospital.
- At "Transported", an ambulance icon animates along the route.
- At "Arrived", the patient appears in that hospital's zone list in the Hospital traffic tab, highlighted as linked to their CareID.

**Messages sent to family:** shown as phone-style message cards, newest first, with the recipients listed above.
- **Verified:** "CareID Emergency Alert". The person's name has a verified medical emergency of the given type. Includes where it happened, the time, the hospital name and address, the status ("Verified by ... Ambulance being arranged"), the emergency ID, "Go to the Emergency Department (Jabatan Kecemasan) and quote the emergency ID", and Google Maps and Waze buttons.
- **Transported:** "On the way to [hospital] by ambulance. Expected arrival in about N minutes."
- **Arrived:** "Arrived at [hospital] and is being treated in the [red/yellow/green] zone", plus plain advice:
  - Red: "Doctors are treating them now…"
  - Yellow: "Stable and will be seen shortly"
  - Green: "Not serious, may be discharged after treatment"
- Each card shows the delivery status per contact, e.g. "SMS: Rosli (queued), Norhayati (simulated)".

**Unknown patient (Jane / John Doe) flow:**
- The patient gets a temporary ID like UNK-4821 and is added to the unidentified patient registry.
- A yellow card explains that no ID was found, so CareID cannot alert family yet.
- **No messages are sent** until the patient is identified.
- Identification buttons: "Fingerprint check" (matched to their MyKad record), "Scan CareID card or QR", and "Wait for family search" (goes to Find family).
- Once identified, family receive one catch-up alert: the person "received emergency care as an unidentified patient (UNK-xxxx) and has now been identified by [method]". It includes the emergency type, where they were found, the hospital, the current status, the emergency ID, "bring your MyKad", and map links. After this, the normal updates continue.

### Tab 4: Find family (for a Jane / John Doe whose family don't know which hospital they're in)

- **A 4-step explanation:**
  1. The hospital registers the unknown patient in a registry shared by all hospitals.
  2. The hospital tries to identify them by fingerprint (MyKad) or a CareID card or QR.
  3. The family search here.
  4. Identity is confirmed in person, then the normal alerts start.
- **"Describe the missing person" form**, prefilled with a sample that matches UNK-0193: their name, sex (Male / Female / Not sure), age, last seen at, last seen time, clothing and features, your relationship, your phone.
- **Matching** (also run on the server):
  - Exclude a record if the sex conflicts, the age is more than 5 years outside the range, or the patient was admitted more than 2 hours before the person was last seen.
  - Score: +3 sex, +3 age in range (+1 if close), +1 time, +2 per shared place word (max 4), +1 per shared description word (max 4). Ignore words of 3 letters or fewer and stop words like "jalan", "with", "wearing".
  - Show results with a score of 4 or more: "Strong match" for 9+, "Possible match" otherwise.
  - Each result shows the hospital, zone, sex and age range, when they were brought in, where they were found, their description, "Matched on sex, age, place (tun, razak), description (blue, denim, jacket)", and Google Maps and Waze links.
- **"Ask hospital to check" button:** records the request and shows "[Hospital] emergency department will call you on [phone] to arrange identification in person. Bring your MyKad and a recent photo."
  - If the match is the current demo emergency, identify the patient straight away and send the family alerts.
- **No match:** "CareID keeps checking new admissions… Please also make a missing person report at the nearest police station (PDRM)."
- **"Unidentified patients now" list:** labelled as the hospital staff and police view. It shows each record's ID, admission time, hospital, zone and status (Identified / Family check requested).
- **Privacy:** families only see matches to their own search, never photos or the full list.

### Tab 5: Hospital traffic & queue

- **Legend** explaining the zones:
  - Red, critical: treated immediately, no queue.
  - Yellow, semi-urgent: within 30 min.
  - Green, non-urgent: within 90 min.
- **Step 1, choose a hospital:**
  - **A map** of the 5 hospitals. Pins are coloured by how busy each hospital is (green Moderate below 65% full, yellow Busy from 65%, red Very busy from 90%) and show their patient count. A "You" marker shows the user's location. Tapping a pin selects that hospital.
  - **A recommendation line:** "Best for a non-urgent visit now: Hospital Selayang, about 23 min drive + 49 min wait. Nearest is HKL. For a critical emergency, call 999 or go to the nearest."
  - **Hospital cards**, one per hospital, showing:
    - the name and a busy-level pill;
    - "101 patients · 84% full";
    - zone counts "R9 Y34 G58";
    - a stacked red/yellow/green bar;
    - "your number 1234" if the user holds a queue number there.
- **Hospital detail:**
  - The address, distance and drive time from the user, and Google Maps and Waze buttons.
  - 4 stats: patients in the emergency department (of capacity), average green-zone wait, arrivals in the last hour, ambulances inbound.
  - A 2-hour trend sparkline (area chart).
  - **3 zone columns** (Red / Yellow / Green). Each has a count, a target time and a scrollable list of anonymised patients: case number like ED-4127, the complaint, and time since arrival.
  - A privacy note: patients are anonymised. Family only see their own relative.
- **Step 2, get a queue number** (only appears after a hospital is selected):
  - The number now being served and the number of people waiting (about 4 min each).
  - A form with a reason ("Minor illness or injury" = green, or "Needs prompt care" = yellow) and an optional complaint.
  - "Get queue number" issues a ticket shown as a dashed queue slip: a big mono number, a self-reported zone pill, now serving, people ahead, estimated wait, the time issued, and a Cancel button.
  - When the number is called: "It's your turn. Please go to the triage counter now" and a toast.
  - Only one number at a time. Viewing another hospital says "You already hold number X at Y".
  - Warning: "Critical emergency such as chest pain, severe bleeding or unconsciousness? Do not queue. Call 999."
- **Live simulation** (in the browser) every 5 seconds: random arrivals and discharges, red patients stabilising to yellow, the trend updating, and the "now serving" number advancing. Include a "Pause updates" button and an "Updated hh:mm:ss" label.

---

## 5. Maps

- **With a Google Maps key:**
  - Google Maps with the traffic layer on both maps.
  - Hospital markers as coloured circles with an "H" label.
  - A draggable emergency pin, and clicking the map moves it.
  - Directions API driving route from the pin to the hospital, with `duration_in_traffic`.
  - The ambulance marker moves along the route's `overview_path`.
  - Message arrival times use the Google duration.
  - If the key fails (`gm_authFailure`), fall back to the drawn map.
- **Without a key:** an SVG map of the Klang Valley.
  - Uses the real coordinates of the hospitals.
  - Faint grid, area labels (Kuala Lumpur, Petaling Jaya, Shah Alam, Gombak, Selayang, Sungai Buloh, Ampang, Cheras, Puchong, Kajang, Bangi, Putrajaya, Semenyih, Kepong, Subang), a 10 km scale bar and a north arrow.
  - Redraw it on resize so text stays readable.
  - Distance uses the haversine formula. Drive time ≈ distance × 1.3 ÷ 40 km/h + 4 min.
- **Links:** every hospital gets "Google Maps" (`https://www.google.com/maps/search/?api=1&query=<name>`) and "Waze" (`https://waze.com/ul?ll=<lat>,<lng>&navigate=yes`) links.

---

## 6. Backend API (all JSON, under /api)

The demo has no login: a middleware sets `req.userId = 1`. Add a comment that real login (sessions or JWT) is the next step.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /config | `{ mapsKey, smsMode }` |
| GET, PUT | /profile | Read or update the profile (validate blood type, thalassaemia, HIV and donor values against the allowed lists, weight 1–400, dates YYYY-MM-DD, months YYYY-MM) |
| GET | /records | Medical records |
| GET, POST | /medicines | List (each with `taken: [ms timestamps]`) or add (returns `allergyWarning`) |
| POST | /medicines/:id/doses | Record a dose now. 409 if today's doses are complete or the course is completed |
| PATCH | /medicines/:id | `{ status: "completed" }` |
| GET, POST | /vaccinations | List or add |
| GET, POST | /receipts | List, or upload `{ clinic, date, amount, image: dataURL }`. Accept only JPEG/PNG/WebP up to 5 MB, save to `uploads/receipt-<id>.<ext>` |
| DELETE | /receipts/:id | Delete the row and the file |
| GET, POST | /contacts | List or add (validate the phone number) |
| PATCH, DELETE | /contacts/:id | `{ alert: true/false }` or remove |
| GET | /alerts | Alert history, grouped per emergency and message type, with names and statuses |
| GET | /hospitals | Hospitals with coordinates and capacity |
| POST | /emergencies | Report: type, loc, lat, lng, hospitalId, zone, reportedBy, identity known/unknown, plus sex, ageMin, ageMax and description for unknown patients. Creates an ID `CID-xxxx-xxxx`. Unknown patients also get an `UNK-xxxx` registry record and `user_id` NULL |
| GET | /emergencies/:id | Status |
| POST | /emergencies/:id/advance | Next stage (max 3). Sends SMS to contacts with alerts on, only if the patient is identified. Returns `{ emergency, sent: [{name, phone, status}] }` |
| POST | /emergencies/:id/identify | `{ method }`. Links the user, sets stage to at least 1, marks the registry record identified, sends the "identified" SMS |
| GET | /unidentified | Full registry (staff view) |
| POST | /unidentified/search | Family search, returns matches with score and reasons, unidentified patients only |
| POST | /unidentified/:id/requests | Family request. Demo shortcut: identifies the patient if linked to an emergency |

- **SMS:** convert Malaysian numbers to E.164 (`012-345 6789` → `+60123456789`). Save every SMS in an `alerts` table with its status (queued / simulated / failed) and the Twilio SID. One failed number must not stop the others.
- **Errors:** wrap async routes so errors reach one error handler. Return friendly messages (`{ error: "Blood type must be one of: …" }`) with 400, 404, 409 or 413 status codes, and a generic message for unexpected errors.
- **Startup:** on start, print the URL, SMS mode, whether a Maps key was found, and whether the database is connected (with a hint if not).

## 7. Database tables (MySQL)

- **users:** profile fields, `hiv_share` defaults to 0.
- **medicines**, **medicine_doses**, **vaccinations**, **medical_records**, **receipts**, **emergency_contacts** (`receives_alerts`).
- **hospitals:** id, name, short name, address, lat, lng, capacity.
- **emergencies:**
  - id, user_id (nullable), type, location, lat, lng, hospital_id, triage_zone, reported_by;
  - stage 0–3;
  - identity_status: known, unknown or identified;
  - unidentified_id, identified_by, created_at.
- **alerts:** one row per SMS per contact, with kind, message, status and provider_id.
- **unidentified_patients:**
  - id, hospital_id, sex, age_min, age_max, found_at, admitted_at, description, triage_zone;
  - status: unidentified or identified;
  - emergency_id.
- **identity_requests:** family requests.

Use foreign keys, utf8mb4, and `DROP TABLE IF EXISTS` so the schema can be re-run.

---

## 8. Privacy and safety rules

- HIV/AIDS status is private by default and only shown to responders if the user opts in.
- Family are never alerted about unverified reports or unidentified patients.
- Other patients in hospital zone lists are anonymised (case number + complaint only).
- Families never see photos or the full unidentified patient list.
- Show "Prototype · sample data" style labelling. All people in the sample data are fictional.
- The README lists what a real system would still need:
  - secure login with roles for patients, staff and police;
  - HTTPS;
  - encryption of sensitive fields;
  - audit logs;
  - explicit consent.

## 9. README

Include:
- the folder structure;
- setup steps:
  - `npm install`;
  - import the schema and seed in phpMyAdmin or with the MySQL CLI;
  - copy `.env.example` to `.env`;
  - `npm start`;
  - open http://localhost:3000;
- how to get Twilio keys (trial accounts can only send to verified numbers);
- how to get a Google Maps key (enable Maps JavaScript API + Directions API, billing required, restrict the key to localhost);
- the API table;
- what is still simulated (login, hospital traffic, the queue, the fingerprint check);
- a troubleshooting section for common MySQL errors and a busy port.

## 10. Done when

- Opening `public/index.html` directly works fully in demo mode.
- With `npm start` and MySQL, every change saves to the database and is still there after reloading.
- Reporting a known emergency and advancing it sends 3 SMS per stage (printed in the terminal in simulated mode). Delivery statuses show in the message cards and the alert history.
- An unknown emergency sends nothing until it is identified by fingerprint, card, or a family search match. Then the catch-up alert is sent.
- No console errors, works on phone and desktop, in light and dark mode.

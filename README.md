<div align="center">

# 🏥 MediKiosk

### AI-Powered Clinical History Intake & Document Digitization Platform

**Capturing 10–15 minutes of structured patient history before the doctor ever walks in.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-medkiosk--by--blackops.vercel.app-0e75b6?logo=vercel&logoColor=white)](https://medkiosk-by-blackops.vercel.app)
[![React](https://img.shields.io/badge/React-18-20232A?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
![Status](https://img.shields.io/badge/Status-Prototype-yellow)
![Compliance](https://img.shields.io/badge/Aligned%20With-ABDM%20FHIR%20R4%20%7C%20DPDP%202023-4479A1)

[Live Demo](https://medkiosk-by-blackops.vercel.app) · [Problem](#-the-problem) · [How It Works](#-how-it-works) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Roadmap](#-roadmap)

</div>

---

## 🚩 The Problem

India's government hospitals register **4,000–10,000 OPD patients a day**, with doctor-patient consultation time averaging just **2–5 minutes** — among the shortest globally. Within that window, physicians must elicit history, examine the patient, review scattered paper records, diagnose, counsel, and prescribe.

The result: under-elicited history, missed comorbidities, repeated questioning across visits, and preventable diagnostic errors — a problem made even harder in AYUSH (Ayurvedic) settings, where a full **Dashavidha Pariksha** (10-factor constitutional assessment) is effectively impossible to capture manually inside an OPD slot.

## 💡 The Solution

**MediKiosk** is a patient-facing kiosk application that moves history-taking *out* of the consultation room and into the waiting area. Before the patient sees a doctor, MediKiosk:

1. 🎙️ Captures a full clinical history through natural **voice + touch conversation**
2. 📄 Digitizes prior prescriptions and lab reports via **OCR**
3. 🧠 Structures everything using clinical frameworks — **SOCRATES** (Allopathy) and **Dashavidha Pariksha** (AYUSH)
4. ⚠️ Flags emergency red-flag symptoms in real time for immediate triage
5. 📋 Generates a physician-ready structured summary before the consultation even begins
6. 🔗 Prepares data for **ABDM/ABHA** interoperability using **FHIR R4**

> **Impact:** physicians get 10–15 minutes of pre-captured, structured history instantly — freeing consultation time for diagnosis, examination, and counseling instead of transcription.

---

## 🧭 How It Works

MediKiosk walks each patient through a five-step flow:

| Step | Screen | What Happens |
|------|--------|---------------|
| 1 | **Identification & Consent** | Language selection, ABHA ID / QR scan, DPDP-aligned consent capture |
| 2 | **Conversational Interview** | Voice + touch symptom capture, AI-driven SOCRATES follow-up questions |
| 3 | **Document Upload** *(optional)* | OCR digitization of prior prescriptions and lab reports, entity extraction |
| 4 | **Handoff & Confirmation** | Patient reviews the captured summary and is routed to their consultation room |
| 5 | **Physician Verification** | Doctor reviews an editable, structured summary on an EMR-style dashboard and confirms |

Throughout the flow, a **red-flag detection engine** continuously scans for emergency symptoms (cardiac, neurological, respiratory, GI, trauma) and can escalate a patient straight to triage, bypassing the normal queue.

---

## ✨ Key Features

- 🗣️ **Dual input redundancy** — natural speech *and* large touch buttons, so it works for low-literacy and first-time users
- 🧩 **Adaptive SOCRATES engine** — branches follow-up questions based on the patient's chief complaint
- 🕉️ **AYUSH-aware intake** — extended Dashavidha Pariksha mode for Ayurvedic OPDs
- 📑 **OCR + clinical NER** — extracts diagnoses, medications, and lab values from photographed documents
- 🚨 **Red-flag emergency detection** — real-time keyword and pattern matching for critical symptoms
- 🩺 **Editable physician dashboard** — structured, auditable summary the doctor can correct before saving
- 🔐 **Consent-first, zero-persistence design** — session data is captured, used, and deleted; nothing lingers on the kiosk after handoff
- 🔗 **FHIR R4 / ABDM-ready** — structured output maps cleanly onto Patient, Condition, Observation, MedicationStatement, and AllergyIntolerance resources

---

## 🛠️ Tech Stack

This repository implements the **hackathon prototype tier** of the full MediKiosk architecture:

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TailwindCSS, React Router v6, Lucide React icons |
| Speech-to-Text | Web Speech API (browser-native, prototype) |
| Conversational AI | Google Gemini API |
| OCR | Tesseract.js (client-side) |
| State | React Hooks + Context |
| Deployment | Vercel |

The full production specification (documented in this repo) additionally targets a Node.js/NestJS API gateway, Python FastAPI AI services layer, PostgreSQL + Redis for persistence and session TTLs, an Electron-based kiosk shell, and a FHIR R4 / ABDM interoperability layer — see [`MASTER_SPECIFICATION_COMPLETE.md`](./MASTER_SPECIFICATION_COMPLETE.md) for the complete architecture.

---

## 📂 Repository Structure

```text
Medkiosk-By_Blackops/
├── medikiosk-prototype/                  # React + Tailwind hackathon prototype
├── MASTER_SPECIFICATION_COMPLETE.md      # Full product & technical specification
├── 02_ANTIGRAVITY_TECH_STACK.md          # Detailed technology stack breakdown
├── 03_UI_UX_SPECIFICATIONS.md            # Screen-by-screen UI/UX specs
├── 06_CODE_TEMPLATES_API_INTEGRATION.md  # API integration code templates
├── UI_BACKGROUND.md                      # Visual/design background notes
├── frontend.md                           # Frontend implementation notes
└── package-lock.json
```

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/sudhanshu25099-code/Medkiosk-By_Blackops.git
cd Medkiosk-By_Blackops/medikiosk-prototype

# Install dependencies
npm install

# Add your Gemini API key
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env

# Run the development server
npm run dev
```

Then open the local URL shown in your terminal. Voice capture requires microphone permissions and a Chromium-based browser (Web Speech API support varies across browsers).

**Try it live without installing anything:** [medkiosk-by-blackops.vercel.app](https://medkiosk-by-blackops.vercel.app)

---

## 🔐 Privacy & Compliance

MediKiosk's architecture is designed around **DPDP Act 2023** and **ABDM/ABHA** alignment:

- Session-by-session consent — no persistent consent across patient visits
- Voice buffers are deleted immediately after transcription
- Kiosk-side data is ephemeral; structured output is pushed onward and cleared locally
- Designed to map onto **FHIR R4** resources for national health record interoperability

> The current prototype demonstrates this flow with mocked ABDM/HIS endpoints. See the specification docs for the production-grade consent, encryption, and audit-logging design.

---

## 🗺️ Roadmap

- [ ] Replace mocked ABDM/ABHA and HIS endpoints with live integrations
- [ ] Multi-language ASR (Hindi, Tamil, Telugu, Kannada, Marathi, Bengali)
- [ ] Full Dashavidha Pariksha mode for AYUSH OPDs
- [ ] Production OCR pipeline (LayoutLMv3 / Donut Transformer for handwriting)
- [ ] Hospital admin analytics dashboard
- [ ] Kiosk hardware deployment (touchscreen + directional mic array)

---

## 🤝 Contributing

This project started as a hackathon build under the team name **Blackops**. Issues and pull requests are welcome — see the specification documents in this repo for context on intended architecture before proposing major changes.

---

<div align="center">

Built to give doctors back their time, and patients a better first word in the exam room.

</div>

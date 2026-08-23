# MediKiosk Frontend Specification (`frontend.md`)

## Executive Summary
This document defines the complete frontend visual design, component layout, color tokens, typography, interaction patterns, and input/output schema mapping for **MediKiosk**. 

The design adopts a dual-panel split dashboard aesthetic (**Nav.Clinic** paradigm) floating seamlessly above the interactive **Three.js Soft Clinical Abstract 3D Background**.

---

## 🎨 Visual Aesthetics & Layout Architecture

```
+-------------------------------------------------------------------------------------------------------+
|  BACKGROUND: Three.js Interactive WebGL Soft Clinical Fluid Mesh (#0056b3 -> #00a6e0 -> #ffffff)      |
|                                                                                                       |
|  +-------------------------------------------------------------------------------------------------+  |
|  | DUAL-PANEL FLOATING CONTAINER (Rounded 3XL / Glassmorphism / Shadow-2XL)                         |  |
|  |                                                                                                 |  |
|  | +-----------------------------------------+ +-------------------------------------------------+ |  |
|  | | LEFT PANEL: Vibrant Indigo Hero & Info  | | RIGHT PANEL: Crisp White Interactive Hub        | |  |
|  | | (Deep Blue #3B52E1 / Rounded 2XL)       | | (Soft Off-White #F6F8FE / Floating Nodes)      | |  |
|  | |                                         | |                                                 | |  |
|  | |  - Brand Header (Logo + Pills)          | |  - Top Search & User Profile ("Hi, Derek!")    | |  |
|  | |  - Hero Title & Subtext                 | |  - Quick Filter Pills (All / Nearby / 2km)      | |  |
|  | |  - "Find Nearby / Health Summary" Grid  | |  - Central Interactive Node Grid:               | |  |
|  | |    * Symptom Capsule Pills              | |      [ 🎙️ Voice Intake ]  [ 📄 Document OCR ]    | |  |
|  | |    * Clinical Triage Score Card (98/100)| |      [ 🩺 Symptom Select] [ 📋 Doctor Handoff ]  | |  |
|  | |    * Attending Doctor Avatar Stack      | |  - Bottom Navigation & Help Center              | |  |
|  | |    * Primary CTA: "Start Intake"        | |                                                 | |  |
|  | +-----------------------------------------+ +-------------------------------------------------+ |  |
|  +-------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------+
```

---

## 📐 Dual-Panel Layout Breakdown

### 1. Left Panel — Vibrant Medical Indigo (`#3B52E1` / `#2F43D4`)
* **Purpose**: Patient onboarding, clinical branding, high-level intake summary, and quick status overview.
* **Key Components**:
  * **Brand Header**: `MediKiosk` logo with sparkling status indicator, `Test History` pill badge, and `All Visits` action pill.
  * **Hero Content**: Bold headline: *"Navigating Clinical Care with MediKiosk AI Intake"*.
  * **Quick Health & Symptom Grid**:
    * **Symptom Pills**: Interactive pill buttons (`#4E64ED`, `#3548B8`) for instant symptom selection.
    * **Clinical Triage Score Card**: Floating white card displaying live confidence score (`98%`) and triage status (Routine / Urgent / Emergency).
    * **Attending Doctor Team Avatar Stack**: Visual stack of available OPD doctors with live availability status.
    * **Primary Action CTA**: Oval pill button (`View Intake / Start Session`) with animated arrow indicator.

### 2. Right Panel — Crisp Medical Light (`#F6F8FE` / `#FFFFFF`)
* **Purpose**: Primary interactive intake hub (Voice ASR capture, Document Upload OCR, Interactive Symptom Selection, and Summary Review).
* **Key Components**:
  * **Header Navigation**: Search bar for symptoms (`Search For Symptoms`), location indicator (`Locator`), and patient profile avatar (`Hi, Patient! 👋`).
  * **Filter Pill Row**: Sub-tabs for `All`, `Nearby`, and `Distance`.
  * **Interactive Intake Node Hub**:
    * **Central Feature Node**: Large floating rounded card with glowing ambient backdrop.
    * **Voice Intake Node (`🎙️ Voice Input`)**: Web Speech API speech-to-text trigger with pulsing audio wave feedback.
    * **Document OCR Node (`📄 Upload Reports`)**: Drag-and-drop file uploader powered by Tesseract.js.
    * **Quick Symptoms Grid (`🩺 Symptoms`)**: Common clinical complaint tags (Fever, Cough, Headache, Chest Pain).
    * **ABHA / Aadhaar Auth Card (`🆔 Patient Auth`)**: Fast authentication input fields.
  * **Footer Navigation**: Step indicators (`Step 1 of 5`), `Help Center`, and `Reset` controls.

---

## 🗂️ Input Schema & State Mapping

The frontend maps directly to the MediKiosk JSON Clinical Schema (`src/utils/geminiAPI.js`):

```typescript
interface MediKioskInputSchema {
  // Step 1: Patient Demographics & Consent
  patient_demographics: {
    patient_name: string;          // Default: "Patient" or user input
    abha_id: string;               // ABHA / Aadhaar number
    language: "hi-IN" | "en-IN";   // Selected intake language
    timestamp: string;             // ISO Timestamp
    consent_given: boolean;        // DPDP Act 2023 consent
  };

  // Step 2: Spoken Chief Complaint & Voice Transcript
  chief_complaint: string;         // Spoken chief complaint summary
  voice_transcript: string;        // Raw Web Speech API transcript

  // Step 3: Structured History of Present Illness (SOCRATES Framework)
  history_of_present_illness: {
    onset: string;                 // When & how it started
    character: string;             // Pain/symptom description (sharp, dull, throbbing)
    radiation: string;             // Radiation site
    associated_symptoms: string[]; // Selected or extracted symptoms
    duration: string;              // Symptom duration
    severity: string;              // Pain scale 0-10 or "Not specified"
    aggravating_relieving_factors: string;
  };

  // Step 4: Medical History & Medications
  past_medical_history: {
    conditions: string[];          // Pre-existing conditions (e.g. Diabetes, Hypertension)
    surgeries: string[];           // Past surgical history
  };
  medications_and_allergies: {
    current_medications: Array<{
      name: string;
      dose?: string;
      indication?: string;
    }>;
    allergies: string;             // NKDA or specific drug allergies
  };

  // Step 5: Document Upload & OCR Extracted Lab Values
  extracted_lab_values: Array<{
    test_name: string;
    value: string;
    unit?: string;
    status: "Normal" | "Abnormal";
  }>;

  // Clinical Triage & AI Diagnostics
  red_flags_detected: string[];    // Emergency symptoms (e.g. Dyspnea, Chest Pain)
  triage_priority: "Routine" | "Urgent" | "Emergency";
  confidence_score: number;        // AI structuring confidence (e.g. 0.95)
}
```

---

## 🎨 Color Palette & Design Tokens

| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Brand Indigo Primary** | `#3B52E1` | Left panel hero background, active CTA buttons |
| **Brand Indigo Dark** | `#2B3ECC` | Hover states, active tab backgrounds |
| **Medical Cyan** | `#00A6E0` | Active highlights, ripple animations, badge borders |
| **Clinical White** | `#FFFFFF` | Card containers, primary text on indigo panel |
| **Soft Surface Light** | `#F6F8FE` | Right panel background, input field fills |
| **Clinical Slate Text** | `#1E293B` | Main headings, primary body text |
| **Muted Slate Subtext**| `#64748B` | Labels, subtitles, secondary metadata |
| **Success Green** | `#10B981` | Triage Routine badge, OCR success indicator |
| **Warning Orange** | `#F59E0B` | Triage Urgent badge |
| **Emergency Red** | `#EF4444` | Red flag alert, Triage Emergency badge |

---

## 📱 Typography System

```css
/* Typography Scale */
font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

.title-hero    { font-size: 2.25rem; line-height: 1.2; font-weight: 800; tracking: -0.02em; }
.heading-card  { font-size: 1.25rem; line-height: 1.3; font-weight: 700; }
.subheading    { font-size: 0.875rem; line-height: 1.4; font-weight: 600; text-transform: uppercase; }
.body-main     { font-size: 1.00rem; line-height: 1.6; font-weight: 400; }
.badge-text    { font-size: 0.75rem; line-height: 1.0; font-weight: 700; border-radius: 9999px; }
```

---

## 🛠️ Step-by-Step Refactoring Implementation Plan

### Step 1: Install Layout & Icon Enhancements
Ensure `lucide-react` icons and Google Fonts (`Plus Jakarta Sans`) are loaded in [index.html](file:///c:/FlutterProjects/medkiosk/medikiosk-prototype/index.html).

### Step 2: Build `NavClinicLayout.jsx` Component
Create a master dual-panel layout container component (`src/components/NavClinicLayout.jsx`) that wraps all intake views inside the rounded glassmorphic frame over `ClinicalBackground`.

### Step 3: Refactor Intake Components into Dashboard Nodes
* **Left Panel**: Render live state highlights (`patient_demographics`, confidence score badge, and quick intake progress tracker).
* **Right Panel**: Render active step views (`WelcomeScreen`, `InterviewScreen`, `DocumentUploadScreen`, `HandoffScreen`, `DoctorDashboard`).

### Step 4: Add Micro-Animations & Sound Visualizer
* Smooth tab transitions with CSS `transition-all duration-300`.
* Microphone pulse animations during voice intake.
* Interactive mouse ripple response on the Three.js 3D canvas background.

---

## 🚀 Verification & Testing Checklist

- [x] Three.js WebGL fluid canvas running smoothly at 60 FPS on `localhost:5173`.
- [x] Dual-panel split container floating seamlessly above background.
- [x] Full input schema preserved across all intake steps.
- [x] High contrast, accessible touch targets (minimum 48px × 48px).
- [x] Web Speech API speech-to-text integration working in Hindi & English.
- [x] Tesseract.js OCR report parsing & Gemini API clinical structuring connected.

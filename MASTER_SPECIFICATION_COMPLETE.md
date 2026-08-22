# MediKiosk: Complete Software Specification & Technical Implementation Guide
## AI Clinical History Intake & Document Digitization Platform

**Document Version:** 2.0 (Master Specification)
**Last Updated:** August 2024
**Status:** Ready for Production Build
**Classification:** Complete Technical Reference
**Compliance:** ABDM FHIR R4, DPDP Act 2023, Healthcare Standards

---

## EXECUTIVE SUMMARY

### The Problem
India's government hospitals register **4,000-10,000 OPD patients daily**. Doctor-patient consultation time averages **2-5 minutes** (shortest globally per BMJ Open 2017). Within this narrow window, physicians must:
- Elicit history
- Examine patient
- Review prior records (scattered paper documents)
- Formulate diagnosis
- Counsel patient
- Prescribe treatment

**Result:** Systematic under-elicitation of history, missed comorbidities, repeated questioning across visits, diagnostic errors.

### Additional Complexity: AYUSH Settings
Ayurvedic history-taking requires detailed assessment of:
- Prakriti (constitution)
- Vikriti (current imbalance)
- Agni (digestive capacity)
- Koshtha (bowel nature)
- Ahara-Vihara (diet and lifestyle)
- Nidana (causative factors)
- Samprapti (pathogenesis)

Capturing this depth manually within OPD time constraints is **effectively impossible**.

### The Solution: MediKiosk
An **AI-powered, patient-facing software platform** that:
1. Captures comprehensive clinical history via natural voice conversation + touchscreen interaction
2. Digitizes fragmented paper medical records using OCR
3. Structures history using clinical frameworks (SOCRATES for Allopathy, Dashavidha for AYUSH)
4. Generates physician-ready summaries before consultation
5. Integrates with ABDM/ABHA ecosystem
6. Complies with DPDP Act 2023

**Impact:** Physicians get 10-15 minutes of pre-captured history instantly, allowing focus on diagnosis, examination, and counseling.

---

## PART 1: SYSTEM VISION & ARCHITECTURE

### 1.1 System Classification
- **Type:** Self-service multimodal clinical intake and document digitization platform
- **Deployment:** Kiosk-based in hospital OPD waiting areas
- **Scale:** 40-50 patients/kiosk/day, 1000+ deployments potential
- **Cost:** ₹5-10 per patient (50x ROI Year 1)

### 1.2 Key Success Metrics
✅ Zero physician-administered history intake time
✅ 10-15 minutes of pre-captured clinical data per patient
✅ 90%+ accuracy in SOCRATES/Dashavidha structuring
✅ 85%+ patient satisfaction (even low-literacy users)
✅ ABDM/ABHA integration ready
✅ DPDP Act 2023 compliant
✅ Scales to 40M+ annual OPD visits nationally

---

## PART 2: FUNCTIONAL MODULE SPECIFICATIONS

### Module A: Conversational Multimodal History Engine

#### A.1: Indian Language Speech Recognition (ASR)
**Technology Stack:**
- **Primary:** Bhashini / AI4Bharat IndicWhisper models
- **Fallback:** Google Cloud Speech-to-Text (production)
- **Prototype:** Web Speech API (browser native, FREE)

**Supported Languages:**
```
Tier 1 (MVP):
- Hindi (hi-IN)
- English (en-US, en-IN)

Tier 2 (Phase 2):
- Tamil (ta-IN)
- Telugu (te-IN)
- Kannada (kn-IN)
- Marathi (mr-IN)
- Bengali (bn-IN)
```

**Environmental Requirements:**
- Handles 80-90 dB OPD noise (directional microphone arrays in production)
- Real-time processing (< 3 second latency)
- Interim results displayed live as patient speaks
- Auto-stop after 3-second silence

**Implementation:**
```javascript
// Web Speech API (Prototype)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'hi-IN'; // or 'en-US'
recognition.continuous = false;
recognition.interimResults = true;
```

#### A.2: Adaptive SOCRATES Probing Engine
**Framework:** Automatically branches questioning based on chief complaint

**SOCRATES Parameters:**
- **Site:** Where is the symptom? (localized vs generalized)
- **Onset:** When did it start? (sudden vs gradual)
- **Character:** What type? (sharp, dull, throbbing, burning)
- **Radiation:** Does it spread? (radiating patterns)
- **Associated Symptoms:** What else? (fever, nausea, etc)
- **Time Course:** Duration, progression (constant vs intermittent)
- **Exacerbating/Relieving Factors:** What makes it worse/better?
- **Severity:** Pain/symptom intensity (0-10 scale)

**Adaptive Logic Example:**
```
Patient says: "Severe headache for 3 days"

AI asks:
├─ Onset: "Was it sudden or gradual?" [Gradual/Sudden/Other]
├─ Character: "What type of pain?" [Throbbing/Sharp/Dull/Other]
├─ Location: "Where exactly?" [Frontal/Temporal/Occipital/Diffuse]
├─ Associated: "Any fever?" [Yes/No]
├─ Associated: "Nausea?" [Yes/No]
├─ Associated: "Light sensitivity?" [Yes/No]
├─ Severity: Rate 0-10: [Slider]
└─ Relief: What helps? [Rest/Medicine/Dark room/Other]

(Different branching if patient had said "Chest pain" instead)
```

#### A.3: AYUSH Assessment Framework (Dashavidha Pariksha)
**For Ayurvedic OPDs:** Extended interview mode capturing:

```
Dashavidha Pariksha (10-Factor Assessment):

1. Prakriti (Constitution)
   Questions: Body type, digestion tendency, sleep pattern
   Output: Vata/Pitta/Kapha dominant constitution

2. Vikriti (Current Imbalance)
   Questions: Current health status vs baseline
   Output: Which dosha is currently aggravated

3. Sara (Tissue Quality)
   Questions: Skin quality, hair, nails
   Output: Tissue quality assessment

4. Samhanana (Body Compactness)
   Questions: Bone structure, muscle tone
   Output: Body compactness rating

5. Pramana (Body Measurements)
   Questions: Height, weight, proportions
   Output: Proportionality assessment

6. Satmya (Dietary Tolerance)
   Questions: Foods well-tolerated vs not
   Output: Constitutional diet preferences

7. Sattva (Psychological State)
   Questions: Mental strength, emotional stability
   Output: Psychological resilience assessment

8. Ahara Shakti (Digestive Capacity)
   Questions: Appetite, digestion, food absorption
   Output: Digestive strength level

9. Vyayama Shakti (Exercise Tolerance)
   Questions: Energy for exercise, recovery
   Output: Exercise capacity assessment

10. Vaya (Age Classification)
    Automatic calculation: Childhood/Youth/Middle/Old

Additional: Ahara-Vihara Assessment
- Diet details (what, when, how much)
- Lifestyle (sleep, stress, activity)
- Environmental factors (climate, location)
```

#### A.4: Dual Input Redundancy
**For Maximum Accessibility:**

**Voice Input:**
- Natural language speech capture
- Works for low-literacy users
- Hindi + English support
- Audio feedback and confirmations

**Touch Input:**
- Pre-defined symptom buttons (Fever, Cough, Headache, etc)
- Multiple-choice answers
- Large buttons (48px+ height)
- High contrast (clinical blue on white)
- Voice narration of options (audio for low-literacy)

**UI Example:**
```
┌─────────────────────────────────┐
│  "What brings you in today?"    │
├─────────────────────────────────┤
│                                 │
│  [🎤 SPEAK]                     │
│   OR tap symptom:               │
│                                 │
│  [Fever] [Cough] [Headache]     │
│  [Chest Pain] [Body Ache]       │
│  [More...▼]                     │
│                                 │
│  AI Follow-up:                  │
│  "When did it start?"           │
│  [2 days] [3 days] [1 week]    │
│  [Longer] [Custom]              │
│                                 │
└─────────────────────────────────┘
```

#### A.5: Red-Flag Emergency Detection
**Real-Time Pipeline:** Automatically flags critical symptoms

**Emergency Triggers (Route to Immediate Triage):**
```
CARDIAC:
- Acute crushing chest pain + dyspnea
- Chest pain radiating to arm/jaw
- Syncope

RESPIRATORY:
- Severe dyspnea at rest
- Hemoptysis (coughing blood)
- Stridor

NEUROLOGICAL:
- Acute onset weakness/numbness
- Facial droop
- Speech difficulty
- Acute confusion

GASTROINTESTINAL:
- Severe abdominal pain
- Hematemesis (vomiting blood)
- Melena (black stools)

TRAUMA:
- Active bleeding
- Loss of consciousness
- Severe injury

MEDICAL:
- Severe allergic reaction
- Hypoglycemia symptoms
- Severe dehydration
```

**Implementation:**
```javascript
const redFlagKeywords = [
  'crushing chest pain', 'difficulty breathing',
  'sudden weakness', 'facial droop', 'hemoptysis',
  'severe abdominal pain', 'loss of consciousness',
  // ... comprehensive list
];

function detectRedFlags(transcript) {
  const foundFlags = redFlagKeywords.filter(
    flag => transcript.toLowerCase().includes(flag)
  );
  
  if (foundFlags.length > 0) {
    return {
      isEmergency: true,
      triagePriority: 'EMERGENCY',
      alerts: foundFlags,
      action: 'Route to triage immediately'
    };
  }
}
```

**Action:** Immediately notify triage staff, bypass routine queueing, escalate to physician.

---

### Module B: Medical Document Digitization & Intelligence

#### B.1: Multilingual OCR Engine
**Technology Stack:**
- **Prototype:** Tesseract.js (client-side, FREE)
- **Production:** LayoutLMv3 + Donut Transformer (handwritten)
- **Fallback:** Google Cloud Vision API

**Document Types Supported:**
- Handwritten doctor prescriptions
- Printed lab reports
- Discharge summaries
- Hospital test sheets
- Previous consultation notes

**Languages:**
- English, Hindi (primary)
- Regional scripts (Tamil, Telugu, Kannada, etc)

**Quality Metrics:**
- Printed documents: 95%+ accuracy
- Handwritten: 80-85% accuracy (good for medication names, lab values)
- Mixed documents: Handled automatically

#### B.2: Clinical Entity Recognition (NER)
**Automatically Extracts:**

**Diagnoses:**
```
Input (OCR): "Patient presents with Type 2 Diabetes Mellitus 
             since 5 years, on metformin. Hypertension for 3 years."
             
Output:
- Diagnoses:
  • Type 2 Diabetes Mellitus (5 years)
  • Hypertension (3 years)
```

**Medications:**
```
Input (OCR): "Metformin 500mg BD, Amlodipine 5mg OD, 
             Atorvastatin 20mg HS"
             
Output:
- Medications:
  • Metformin: 500mg, Twice daily, Diabetes
  • Amlodipine: 5mg, Once daily, Hypertension
  • Atorvastatin: 20mg, At night, Cholesterol
```

**Lab Values:**
```
Input (OCR): "Hemoglobin: 13.2 g/dL (Normal: 12-16)
             Fasting glucose: 156 mg/dL (Normal: 70-100)
             TSH: 2.3 mIU/L (Normal: 0.5-5.0)"
             
Output:
- Lab Results:
  • Hemoglobin: 13.2 g/dL [Normal]
  • Fasting glucose: 156 mg/dL [Abnormal - Elevated]
  • TSH: 2.3 mIU/L [Normal]
```

**Procedures/Surgeries:**
```
Input (OCR): "Appendectomy 2015. Cataract surgery both eyes 2018."

Output:
- Surgical History:
  • Appendectomy (2015)
  • Bilateral cataract surgery (2018)
```

#### B.3: Timeline Construction
**Chronological Organization:**

```
MEDICAL TIMELINE:

2015-2018: Baseline Period
├─ Appendectomy (Jan 2015)
├─ Diabetes diagnosis (Mar 2015)
├─ Hypertension diagnosis (Jul 2016)
└─ Cataract surgery bilateral (Sep 2018)

2019-2022: Stable Period
├─ Medication management
├─ Regular follow-ups
└─ No major events

2023-2024: Recent Activity
├─ Lab work: Glucose control declining
├─ Medication adjusted
├─ Recent chest pain (2024-01-15)
└─ Current presentation

```

#### B.4: Abnormal Value Highlighting
**Automated Flagging:**

```
Lab Value: Fasting Glucose 156 mg/dL
Normal Range: 70-100 mg/dL
Status: ⚠️ ABNORMAL - ELEVATED
Alert: "Patient's diabetes control may be suboptimal"
Recommendation: Consider medication adjustment

Lab Value: Hemoglobin A1C 8.2%
Normal Range: <5.7%
Status: ⚠️ ABNORMAL - ELEVATED (Diabetic)
Alert: "Glycemic control suboptimal; target <7%"

Drug Interaction: Metformin + Atorvastatin
Risk Level: LOW-MODERATE
Alert: "No major interaction; monitor for muscle pain (statin side effect)"

Drug Allergy Check: History of Penicillin allergy
Current Medication: Amoxicillin prescribed
Status: 🔴 CRITICAL ALERT - CONTRAINDICATED
Action: Flag for immediate physician review
```

---

### Module C: Structured History Summary Generator

#### C.1: Standard Clinical Summary Format
**Output Structure:**

```json
{
  "patient_metadata": {
    "abha_id": "XXXX-XXXX-XXXX",
    "capture_timestamp": "2024-08-22T14:30:00Z",
    "capture_method": "Voice + Touch + Document OCR",
    "language": "hi-IN",
    "confidence_score": 0.92
  },
  
  "chief_complaint": {
    "primary": "Severe headache",
    "duration": "3 days",
    "severity": "8/10"
  },
  
  "history_of_present_illness": {
    "onset": "Gradual, 3 days ago",
    "character": "Throbbing, bilateral temples",
    "radiation": "Temples to occipital region",
    "associated_symptoms": [
      "Nausea",
      "Photophobia",
      "No fever"
    ],
    "duration": "Continuous",
    "severity": "8/10",
    "aggravating_factors": "Movement, light",
    "relieving_factors": "Rest, dark room"
  },
  
  "past_medical_history": {
    "conditions": [
      "Hypertension (diagnosed 5 years ago)",
      "Type 2 Diabetes Mellitus (diagnosed 5 years ago)"
    ],
    "surgeries": [
      "Appendectomy (2015)"
    ]
  },
  
  "medications_and_allergies": {
    "current_medications": [
      {
        "name": "Amlodipine",
        "dose": "5mg",
        "frequency": "Once daily",
        "indication": "Hypertension",
        "source": "Patient voice + Document"
      },
      {
        "name": "Metformin",
        "dose": "500mg",
        "frequency": "Twice daily",
        "indication": "Diabetes",
        "source": "Patient voice + Document"
      }
    ],
    "allergies": "NKDA (No known drug allergies)",
    "note": "Patient reports allergy to Penicillin (documented)"
  },
  
  "family_history": {
    "mother": "Hypertension, Diabetes",
    "father": "Coronary artery disease",
    "siblings": "No significant history"
  },
  
  "personal_history": {
    "occupation": "Office worker",
    "tobacco": "Non-smoker",
    "alcohol": "Occasional",
    "diet": "Vegetarian, high carbohydrate"
  },
  
  "review_of_systems": {
    "constitutional": "No fever, normal appetite",
    "respiratory": "No cough, normal breathing",
    "cardiovascular": "No chest pain",
    "gastrointestinal": "No nausea or vomiting",
    "neurological": "Occasional headaches",
    "musculoskeletal": "No joint pain"
  },
  
  "prior_investigations": [
    {
      "test_name": "Fasting glucose",
      "value": "156",
      "unit": "mg/dL",
      "reference_range": "70-100",
      "status": "ABNORMAL - ELEVATED",
      "date": "2024-01-15"
    },
    {
      "test_name": "Hemoglobin A1C",
      "value": "8.2",
      "unit": "%",
      "reference_range": "<5.7",
      "status": "ABNORMAL - ELEVATED",
      "date": "2024-01-15"
    },
    {
      "test_name": "Blood pressure",
      "value": "150/90",
      "unit": "mmHg",
      "reference_range": "<120/80",
      "status": "ABNORMAL - ELEVATED",
      "date": "2024-01-15"
    }
  ],
  
  "red_flags_detected": [
    {
      "flag": "Severe headache with photophobia",
      "severity": "Medium",
      "recommendation": "Neurological examination advised"
    },
    {
      "flag": "Hypertension not at goal (150/90)",
      "severity": "Low",
      "recommendation": "Review antihypertensive therapy"
    }
  ],
  
  "triage_priority": "URGENT",
  "triage_reasoning": "Severe headache with associated neurological symptoms warrants neurological evaluation",
  
  "document_sources": [
    "Patient voice transcript",
    "Prior lab report (OCR extracted)",
    "Prior prescription (OCR extracted)"
  ]
}
```

#### C.2: Bilingual Presentation
**Patient Confirmation (Audio + Text):**

```
Hindi Audio (नई कीला ): 
"आपका स्वास्थ्य इतिहास सफलतापूर्वक कैप्चर किया गया है। 
आपकी मुख्य शिकायत: गंभीर सिरदर्द है। 
यह जानकारी आपके डॉक्टर को भेज दी गई है।"

English Text (Displayed on Screen):
"Your health history has been captured successfully.
Chief Complaint: Severe headache
This information has been sent to your doctor.
Proceed to Room 102 for your consultation."
```

**Physician View (Structured Table):**

```
┌──────────────────────────────────────────────────────┐
│ PATIENT SUMMARY | Raj Kumar | ABHA: XXXX-XXXX-XXXX  │
│ Captured: 2:45 PM | Confidence: 92%                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ⚠️ URGENT: Severe headache + photophobia            │
│    → Neurological evaluation recommended             │
│                                                      │
│ CHIEF COMPLAINT:                                    │
│ Severe headache x 3 days                            │
│                                                      │
│ HISTORY OF PRESENT ILLNESS (SOCRATES):              │
│ Onset:       Gradual, 3 days ago                    │
│ Character:   Throbbing, bilateral                   │
│ Radiation:   Temples to occipital                   │
│ Associated:  Nausea, photophobia, no fever          │
│ Duration:    Continuous                            │
│ Severity:    8/10                                   │
│ Agg/Relief:  Worse with movement, better with rest │
│                                                      │
│ PAST MEDICAL HISTORY:                               │
│ • Hypertension (5 years)                            │
│ • Type 2 Diabetes (5 years)                         │
│ • Appendectomy (2015)                               │
│                                                      │
│ MEDICATIONS:                                        │
│ • Amlodipine 5mg daily                              │
│ • Metformin 500mg BID                               │
│                                                      │
│ ALLERGIES:                                          │
│ Penicillin (⚠️ DOCUMENTED)                          │
│                                                      │
│ PRIOR LABS:                                         │
│ • Glucose: 156 (⚠️ ABNORMAL)                        │
│ • A1C: 8.2% (⚠️ ABNORMAL)                           │
│ • BP: 150/90 (⚠️ ABNORMAL)                          │
│                                                      │
│ [EDIT] [CONFIRM & SAVE] [PRINT SUMMARY] [MORE INFO] │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### C.3: Physician Verification UI
**Editable Draft System:**

```javascript
// Workflow:
1. AI generates structured summary (draft)
2. Physician reviews on screen
3. Can edit any field in real-time
4. All edits timestamped and auditable
5. Physician clicks [CONFIRM & SAVE]
6. Data pushed to HIS + ABHA
7. Audit trail created

Example Edit Flow:
Patient said: "Severe headache"
AI structured: "Severity: 8/10"
Physician views and thinks: "Actually sounds more like 9/10"
Physician clicks [EDIT] next to severity
Field becomes editable: [8/10] → [9/10]
Physician clicks outside field (or presses Enter)
Field saves immediately: "Severity: 9/10"
Timestamp: "Edited by Dr. Sharma @ 14:32"
```

**Edit Restrictions:**
- Physician can edit any field
- Cannot delete chief complaint
- Cannot remove critical alerts
- System warns if conflicting edits (e.g., "No fever" but fever temp entered)
- All changes tracked in audit log

---

### Module D: Consent, Privacy & ABDM Integration

#### D.1: DPDP Act 2023 Compliance

**Consent Framework:**

```
STEP 1: Audio Explanation (Local Language)
├─ "MediKiosk will capture your medical history"
├─ "Your health data will be stored securely"
├─ "Your doctor will see this information"
├─ "You can withdraw consent anytime"
└─ "Your data will be deleted after consultation"

STEP 2: Visual Consent Form (Large Text, High Contrast)
├─ ☐ I agree to capture my health history
├─ ☐ I agree to digitize my medical documents
├─ ☐ I agree to share with my doctor
├─ ☐ I agree to link with ABHA
└─ ☐ I have read privacy policy (audio available)

STEP 3: Confirmation
├─ Display summary of what was agreed
├─ Ask: "Are you sure?"
├─ Option to revoke consent
└─ Proceed only if all boxes checked

STEP 4: Session-by-Session Consent
├─ Consent valid for THIS consultation only
├─ Must re-consent for next visit
├─ No persistent consent across patients
└─ Protects patient privacy
```

**Data Rights:**

```
WHAT WE COLLECT:
- Voice recording (temporary)
- Medical history (captured)
- Document images (OCR extracted)
- Lab values (extracted)
- Demographic data (entered)

HOW LONG WE KEEP IT:
- Voice: Deleted immediately after transcription
- Medical data: Kept until end of consultation session
- Extracted text: Pushed to HIS, then deleted locally
- No long-term storage on kiosk

WHERE IT GOES:
- Hospital Information System (HIS)
- Ayushman Bharat Health Account (ABHA)
- Patient's EMR

WHO CAN ACCESS:
- Treating physician (for this consultation)
- Hospital staff (authorized only)
- Patient (via ABHA app)
- NOT third parties (except per legal order)

HOW TO REVOKE:
- Say "I want to stop" anytime
- Patient data deleted immediately
- Kiosk workflow stops
```

#### D.2: ABDM Integration (ABHA/FHIR)

**ABHA Verification Flow:**

```
STEP 1: Identification
├─ QR Code scan (preferred)
├─ Manual ABHA ID entry
├─ Aadhaar + demographics (fallback)
└─ System verifies with ABDM backend

STEP 2: Authentication
├─ One-time password (OTP) via SMS/email
├─ Biometric (optional, production)
└─ User confirms identity

STEP 3: Consent Artifact (M3)
├─ User grants explicit consent
├─ Consent linked to session
├─ HIE knows data is coming
└─ Record stored in ABDM

STEP 4: Data Push (FHIR Bundle)
├─ MediKiosk creates FHIR R4 bundle
├─ Bundle contains:
│  ├─ Patient demographics
│  ├─ Condition (chief complaint)
│  ├─ Observation (vitals, findings)
│  ├─ Medication statement
│  ├─ Allergy intolerance
│  └─ Document reference
├─ Bundle signed with hospital certificate
└─ Pushed to HIE (Health Information Exchange)

STEP 5: HIS Update
├─ Hospital system receives notification
├─ EMR auto-populated with MediKiosk data
├─ Physician sees data in EMR
└─ Ready for consultation
```

**FHIR R4 Bundle Example:**

```json
{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "identifier": {
          "system": "http://abdm.gov.in/abha",
          "value": "XXXX-XXXX-XXXX"
        },
        "name": [{"text": "Raj Kumar"}],
        "gender": "male",
        "birthDate": "1980-05-15"
      }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "subject": {"reference": "Patient/raj-kumar"},
        "code": {
          "coding": [{
            "system": "http://snomed.info/sct",
            "code": "25064002",
            "display": "Headache"
          }]
        },
        "severity": "severe",
        "onsetDateTime": "2024-08-19T00:00:00Z"
      }
    },
    {
      "resource": {
        "resourceType": "Observation",
        "subject": {"reference": "Patient/raj-kumar"},
        "code": {
          "coding": [{
            "system": "http://loinc.org",
            "code": "2085-9",
            "display": "Cholesterol"
          }]
        },
        "valueQuantity": {
          "value": 156,
          "unit": "mg/dL",
          "system": "http://unitsofmeasure.org"
        }
      }
    },
    {
      "resource": {
        "resourceType": "MedicationStatement",
        "subject": {"reference": "Patient/raj-kumar"},
        "medicationCodeableConcept": {
          "coding": [{
            "system": "http://snomed.info/sct",
            "code": "320063000",
            "display": "Amlodipine"
          }]
        },
        "dosage": [{
          "text": "5 mg once daily"
        }]
      }
    }
  ]
}
```

#### D.3: Zero Local Persistence Architecture
**Memory & Data Management:**

```
SESSION LIFECYCLE:

1. SESSION START
   ├─ Create temporary session ID
   ├─ Allocate memory for voice buffer
   ├─ Set Redis TTL: 30 minutes
   └─ Patient starts intake

2. DURING SESSION
   ├─ Voice captured (memory buffer only)
   ├─ Transcript kept in memory
   ├─ Document images in temp folder
   ├─ All data marked "ephemeral"
   └─ Redis TTL refreshes on each action

3. DATA PUSH
   ├─ AI generates structured JSON
   ├─ Create FHIR bundle
   ├─ Push to HIS (webhook)
   ├─ Push to ABHA (via HIE)
   ├─ Receive confirmation
   └─ Data now in permanent systems

4. SESSION END
   ├─ Clear voice buffer from memory
   ├─ Delete transcript from memory
   ├─ Delete temp document images
   ├─ Delete Redis session key (TTL expires)
   ├─ Delete session ID
   └─ Zero data remains on kiosk

5. ISOLATION
   ├─ Next patient gets new session ID
   ├─ No cross-patient data access
   ├─ Memory segregated per session
   └─ Completely isolated workflows
```

**Redis Configuration:**

```javascript
// Redis Session Storage
const sessionKey = `medikiosk:session:${sessionId}`;
const ttl = 1800; // 30 minutes

// When patient arrives
redis.set(sessionKey, JSON.stringify({
  patient: null, // Will be filled
  transcript: "", // Will accumulate
  documents: [], // Will accumulate
  timestamp: Date.now()
}), 'EX', ttl);

// When patient finishes
redis.del(sessionKey); // Complete deletion

// OR automatic expiry after 30 min of inactivity
redis.expire(sessionKey, ttl); // Auto-expires
```

**Deletion Verification:**

```
After session end, verify:
✓ Voice buffer cleared from RAM
✓ Transcript file deleted
✓ Document images deleted
✓ Redis key expired/deleted
✓ Session ID destroyed
✓ No files in /tmp/ directory
✓ Memory usage returned to baseline
✓ Next audit: Zero patient data from previous sessions
```

---

## PART 3: COMPLETE TECHNICAL STACK ARCHITECTURE

### 3.1 Full Technology Stack by Layer

```
┌────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                       │
├────────────────────────────────────────────────────────────────┤
│ React 18 (Component Framework)                                 │
│ TailwindCSS (Utility-First Styling)                            │
│ Electron.js (Desktop Application + Kiosk Mode)                │
│ Web Speech API (Browser Native ASR)                            │
│ Canvas/SVG (Visual Displays)                                   │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER (API Gateway)             │
├────────────────────────────────────────────────────────────────┤
│ Node.js (Runtime Environment)                                 │
│ NestJS or Express.js (Web Framework)                           │
│ WebSocket (Real-time Voice Streaming)                          │
│ REST APIs (Synchronous Requests)                               │
│ Error Handling Middleware                                      │
│ Request/Response Logging                                       │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                      AI & ML SERVICES LAYER                    │
├────────────────────────────────────────────────────────────────┤
│ Python FastAPI (Service Orchestration)                         │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ SPEECH-TO-TEXT PIPELINE                                │  │
│ │ • Bhashini API (Indian languages)                       │  │
│ │ • Google Cloud Speech (fallback)                        │  │
│ │ • Web Speech API (browser, prototype)                   │  │
│ │ → Output: Transcript JSON                              │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ CLINICAL HISTORY STRUCTURING                           │  │
│ │ • Gemini 1.5 API (LLM)                                  │  │
│ │ • LLaMA-3-Medical (alternative)                         │  │
│ │ • SOCRATES Prompt Template                             │  │
│ │ • Dashavidha Prompt Template                           │  │
│ │ → Output: Structured JSON (FHIR-compatible)            │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ OCR & DOCUMENT PROCESSING                              │  │
│ │ • Tesseract.js (protoyype)                              │  │
│ │ • LayoutLMv3 (document understanding)                  │  │
│ │ • Donut Transformer (handwritten text)                 │  │
│ │ • Named Entity Recognition (NER)                       │  │
│ │ → Output: Extracted entities JSON                      │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ RED-FLAG DETECTION                                     │  │
│ │ • Emergency symptom matcher                            │  │
│ │ • Clinical alert rules engine                          │  │
│ │ • Drug interaction checker                             │  │
│ │ • Allergy contraindication checker                     │  │
│ │ → Output: Alerts + Triage priority                     │  │
│ └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                    DATA & PERSISTENCE LAYER                    │
├────────────────────────────────────────────────────────────────┤
│ PostgreSQL (Structured Hospital Data)                          │
│ ├─ Kiosk metadata (serial#, location, status)                  │
│ ├─ Hospital metadata (departments, providers)                  │
│ ├─ Audit logs (all operations, DPDP compliance)               │
│ └─ Session logs (for troubleshooting, NOT patient data)       │
│                                                                │
│ Redis Enterprise (Ephemeral Session Storage)                   │
│ ├─ Session keys (TTL: 30 minutes)                              │
│ ├─ Voice buffer (temporary)                                   │
│ ├─ Transcript storage (temporary)                             │
│ └─ Auto-expiry (zero manual cleanup needed)                   │
│                                                                │
│ S3 / Cloud Storage (Document Image Staging)                    │
│ ├─ Temp folder: /uploads/staging/                             │
│ ├─ Retention: 1 hour (auto-delete)                            │
│ └─ Encrypted at rest                                          │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                  INTEROPERABILITY LAYER                        │
├────────────────────────────────────────────────────────────────┤
│ HL7 FHIR R4 (ABDM Profile)                                     │
│ ├─ Patient Resource                                            │
│ ├─ Condition Resource                                          │
│ ├─ Observation Resource                                        │
│ ├─ MedicationStatement Resource                                │
│ ├─ AllergyIntolerance Resource                                 │
│ └─ DocumentReference Resource                                  │
│                                                                │
│ ABDM Integration                                               │
│ ├─ ABHA Verification (M1 API)                                  │
│ ├─ Consent Artifact (M2/M3 APIs)                               │
│ ├─ HIE Push (Health Information Exchange)                      │
│ └─ Data Notification Service                                   │
│                                                                │
│ Hospital HIS/EMR Integration                                   │
│ ├─ REST API endpoints (ADT feed)                               │
│ ├─ HL7 v2 (fallback for legacy systems)                       │
│ ├─ Webhook delivery (guaranteed)                               │
│ └─ Retry logic (up to 3 attempts)                              │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Deployment Architecture

```
KIOSK DEPLOYMENT (Hospital OPD)

Physical Hardware:
├─ Touchscreen Display (21-27 inch, 1080p+)
├─ Directional Microphone Array (production)
├─ Document Scanner Bed (optional in MVP)
├─ Thermal Printer (for receipt)
├─ Mini PC / Embedded System (NUC, Raspberry Pi 4+, or x86)
├─ 4G/5G Modem (backup connectivity)
└─ UPS Battery (backup power)

Operating System:
├─ Ubuntu Core 20+ (primary)
├─ BalenaOS (alternative)
├─ Immutable, read-only rootfs
├─ Single-app kiosk mode
├─ Over-The-Air (OTA) updates
└─ Auto-recovery on crash

Network:
├─ Primary: Hospital LAN (Ethernet)
├─ Fallback: 4G/5G cellular
├─ DNS: Configured for offline fallback
├─ Firewall: Whitelist only required endpoints
└─ Proxy: Hospital proxy (if required)

Security:
├─ Kiosk lockdown (no USB, no keyboard)
├─ TPM 2.0 (hardware security module)
├─ Full disk encryption
├─ Automatic session logout (15 min idle)
└─ Hardware kill-switch (for maintenance)

Cloud Infrastructure (Hybrid):
├─ Kiosk: Local app only (Electron)
├─ API Gateway: Cloud-hosted (AWS/Azure/GCP)
├─ AI Services: Cloud-hosted (scaled)
├─ Databases: Hospital data center or cloud
└─ Backups: Encrypted cloud storage
```

### 3.3 Prototype Tech Stack (Minimal)

**For 72-hour hackathon build:**

```
FRONTEND:
✓ React.js 18
✓ TailwindCSS
✓ React Router v6
✓ Web Speech API (native browser)
✓ Lucide React (icons)

AI/ML:
✓ Gemini API (free tier)
✓ Tesseract.js (client-side OCR)
✓ No backend ML server needed

STATE:
✓ React Hooks (useState, useContext)
✓ React Context (for history data)
✓ localStorage (optional, for demo)

API:
✓ Fetch API (CORS-enabled)
✓ No backend server needed
✓ Direct API calls from frontend

DEPLOYMENT:
✓ Vercel (free tier)
✓ Or GitHub Pages
✓ Works on kiosk browser

TOTAL COST:
✓ $0 (all free tiers)
✓ No paid APIs
✓ No server rental
```

---

## PART 4: END-TO-END PATIENT JOURNEY WORKFLOW

### 4.1 Complete Patient Flow (5 Steps)

```
╔═══════════════════════════════════════════════════════════════╗
║              STEP 1: IDENTIFICATION & CONSENT                 ║
╚═══════════════════════════════════════════════════════════════╝

SCREEN DISPLAY:
┌─────────────────────────────────────────────────────────────┐
│                    MediKiosk                                 │
│            Welcome to Smart Health Intake                   │
│                                                              │
│  [Select Language]                                          │
│  [हिंदी] [English]                                          │
│                                                              │
│  [SCAN ABHA QR CODE]                                        │
│  or                                                          │
│  [Enter ABHA ID] or [New Patient - Enter Details]          │
│                                                              │
│  [CONSENT & PRIVACY AGREEMENT]                              │
│  ☐ I agree to data capture and sharing                     │
│  [Audio Explanation Available 🔊]                          │
│                                                              │
│  [PROCEED] (disabled until consent checked)                │
└─────────────────────────────────────────────────────────────┘

ACTIONS:
1. Patient scans ABHA QR code (or enters manually)
2. System verifies with ABDM backend
3. Patient selects language
4. Audio explanation plays in selected language
5. Patient checks consent checkbox
6. Patient clicks [PROCEED]

DATA CAPTURED:
- ABHA ID (verified)
- Preferred language
- Consent artifact created
- Timestamp

SYSTEM ACTIONS:
- Create session ID
- Allocate Redis session key (TTL: 30 min)
- Initialize voice buffer
- Prepare AI models
- Status: Ready for voice intake


╔═══════════════════════════════════════════════════════════════╗
║              STEP 2: CONVERSATIONAL INTERVIEW                 ║
╚═══════════════════════════════════════════════════════════════╝

SCREEN DISPLAY:
┌─────────────────────────────────────────────────────────────┐
│           Tell us what's wrong                              │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                           │
│   [🎤 LISTENING] │  OR select symptoms:                      │
│   (pulsing)      │  [Fever] [Cough] [Headache]             │
│                  │  [Chest Pain] [Body Ache]               │
│  Captured:       │  [More...▼]                             │
│  "I have severe  │                                          │
│   headache for   │                                          │
│   3 days..."     │  AI FOLLOW-UPS:                         │
│                  │                                          │
│  [STOP] [CLEAR]  │  "When did it start?"                  │
│                  │  [2 days] [3 days] [1 week] [Other]    │
│                  │                                          │
│                  │  "What type of pain?"                   │
│                  │  [Sharp] [Dull] [Throbbing] [Other]    │
│                  │                                          │
│  [← PREV] [NEXT] │                                          │
└──────────────────┴──────────────────────────────────────────┘

PATIENT ACTIONS:
1. Taps microphone button
2. System requests microphone permission (first time only)
3. Pulsing animation starts (indicates listening)
4. Patient speaks naturally: "I have had a severe headache 
   for 3 days, it's a throbbing pain in my temples, and 
   I feel nauseous..."
5. System captures speech (interim results shown live)
6. Patient pauses for 3 seconds
7. Speech recognition stops automatically
8. Transcript appears in display box

SYSTEM ACTIONS:
1. Capture voice to memory buffer
2. Send audio to STT service (Web Speech API / Bhashini)
3. Receive transcript
4. Send transcript to LLM (Gemini) with SOCRATES prompt
5. LLM analyzes: "Chief complaint = Headache, severity = high"
6. LLM generates follow-up questions
7. AI questions appear on screen

PATIENT CONTINUES:
8. Patient sees AI follow-up: "When did it start?"
9. Patient taps [3 days]
10. Next question appears: "What type of pain?"
11. Patient taps [Throbbing]
12. Questions continue (5-7 follow-ups typical)
13. Accumulated data:
    - Chief complaint: Headache
    - Duration: 3 days
    - Character: Throbbing, bilateral
    - Associated: Nausea, photophobia
    - Severity: 8/10

DATA CAPTURED:
- Raw transcript
- Structured history (SOCRATES format)
- Patient's answers to follow-ups
- Timing of each input

SYSTEM DETECTION:
- Red-flag check: "Headache + nausea + photophobia" 
  → Possible meningitis or migraine
  → Triage priority: URGENT


╔═══════════════════════════════════════════════════════════════╗
║           STEP 3: DOCUMENT UPLOAD (OPTIONAL)                  ║
╚═══════════════════════════════════════════════════════════════╝

SCREEN DISPLAY:
┌─────────────────────────────────────────────────────────────┐
│       Do you have prior medical reports?                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [YES] [NO]                                                 │
│                                                              │
│  If YES:                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Upload prior reports:                              │   │
│  │  • Prescriptions (doctor notes)                     │   │
│  │  • Lab reports (blood work, X-rays)                │   │
│  │  • Discharge summaries                             │   │
│  │                                                     │   │
│  │  [📁 CHOOSE FILES] or [DRAG & DROP]                │   │
│  │                                                     │   │
│  │  Scanning... [███████░░ 70%]                       │   │
│  │                                                     │   │
│  │  Extracted Content:                                 │   │
│  │  ✓ Diabetes (Diagnosis)                            │   │
│  │  ✓ Metformin 500mg BID (Medication)                │   │
│  │  ✓ Glucose 156 mg/dL (Lab - Abnormal)             │   │
│  │                                                     │   │
│  │  [UPLOAD ANOTHER] [SKIP]                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [← PREV] [NEXT →]                                         │
└─────────────────────────────────────────────────────────────┘

PATIENT ACTIONS (if YES):
1. Patient clicks [CHOOSE FILES]
2. Patient selects image(s) of prior reports
3. System processes with Tesseract.js OCR
4. Extraction shows: Diagnoses, Medications, Lab values
5. Patient can upload more or click [SKIP]

SYSTEM ACTIONS:
1. Read image file from patient's device
2. Run Tesseract OCR (client-side, privacy-preserving)
3. Extract text from image
4. Send extracted text to LLM for NER (entity extraction)
5. LLM returns: diagnoses, medications, lab values
6. Display extracted content to patient (verification)
7. Merge with conversational history

DATA CAPTURED:
- OCR extracted text
- Structured entities (diagnoses, meds, labs)
- Document dates (if captured)
- Abnormal value flags

If NO:
Patient clicks [SKIP] → proceed to Step 4


╔═══════════════════════════════════════════════════════════════╗
║               STEP 4: HANDOFF & CONFIRMATION                  ║
╚═══════════════════════════════════════════════════════════════╝

SCREEN DISPLAY:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ✓ Your health history is ready                            │
│                                                              │
│  Summary captured:                                          │
│  ✓ Chief Complaint                                         │
│  ✓ Medical History                                         │
│  ✓ Medications & Allergies                                │
│  ✓ Prior Test Results                                     │
│                                                              │
│  This information will help your doctor understand         │
│  your condition better.                                    │
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │  Proceed to Room 102                            │       │
│  │  for your consultation with Dr. Sharma          │       │
│  │                                                 │       │
│  │  Estimated wait: 2 minutes                      │       │
│  │                                                 │       │
│  │  [GO TO YOUR DOCTOR]                           │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
│  [REVIEW SUMMARY] [PRINT FOR ME]                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

PATIENT ACTIONS:
1. Patient reviews handoff screen
2. Can click [REVIEW SUMMARY] to preview what was captured
3. Can click [PRINT FOR ME] to get a paper copy
4. Clicks [GO TO YOUR DOCTOR]

SYSTEM ACTIONS:
1. Compile all data: voice + documents + red flags
2. Generate FHIR R4 bundle
3. Sign bundle with hospital certificate
4. Push to Hospital HIS (webhook)
5. Push to ABDM HIE
6. Receive confirmation
7. Clear voice buffer from memory
8. Delete temp document images
9. Prepare for data display on physician screen
10. Display confirmation to patient

DATA SUMMARY AT THIS POINT:
✓ Chief Complaint: Severe headache x 3 days
✓ HPI: Throbbing, bilateral, photophobia, nausea
✓ PMH: (if documents uploaded) Hypertension, Diabetes
✓ Meds: (if documents uploaded) Amlodipine, Metformin
✓ Labs: (if documents uploaded) Glucose 156, A1C 8.2%
✓ Triage: URGENT (headache + neuro symptoms)
✓ Red Flags: Migraine vs meningitis vs stroke


╔═══════════════════════════════════════════════════════════════╗
║        STEP 5: PHYSICIAN CONSULTATION & VERIFICATION          ║
╚═══════════════════════════════════════════════════════════════╝

[This happens in the consultation room, not on the kiosk]

PHYSICIAN SCREEN:
┌────────────────────────────────────────────────────────────┐
│ PATIENT SUMMARY | Raj Kumar | ABHA: XXXX-XXXX-XXXX        │
│ Captured: 2:45 PM | Confidence: 92%                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ⚠️  URGENT: Severe headache + photophobia                │
│     → Neurological evaluation recommended                │
│                                                            │
│ CHIEF COMPLAINT                                           │
│ Severe headache x 3 days                                  │
│                                                            │
│ HISTORY OF PRESENT ILLNESS (SOCRATES)                     │
│ Onset:           Gradual, 3 days ago                      │
│ Character:       Throbbing, bilateral temples             │
│ Radiation:       Temples to occipital                     │
│ Associated:      Nausea, photophobia, NO fever            │
│ Duration:        Continuous, no relief                    │
│ Severity:        8/10                                     │
│ Exacerbating:    Movement, light                          │
│ Relieving:       Rest, dark room                          │
│                                                            │
│ PAST MEDICAL HISTORY                                      │
│ • Hypertension (on Amlodipine 5mg)                       │
│ • No surgical history                                     │
│                                                            │
│ MEDICATIONS & ALLERGIES                                   │
│ • Amlodipine 5mg daily (BP control)                      │
│ • NKDA                                                    │
│                                                            │
│ PRIOR LABS                                                │
│ • Hemoglobin: 13.2 g/dL (Normal)                         │
│ • TSH: 2.3 mIU/L (Normal)                                │
│ • BP: 150/90 mmHg (⚠️ ELEVATED)                          │
│                                                            │
│ [EDIT] [CONFIRM & SAVE] [PRINT SUMMARY] [MORE INFO]      │
└────────────────────────────────────────────────────────────┘

PHYSICIAN ACTIONS:
1. Physician enters consultation room
2. Sees complete, structured history on EMR screen
3. Reviews data (typically 5-10 seconds)
4. Can click [EDIT] to update any field in real-time
5. After examination, clicks [CONFIRM & SAVE]
6. Can click [PRINT SUMMARY] if needed
7. Devotes consultation to examination, reasoning, counseling
8. No time spent on history-taking

PHYSICIAN VERIFICATION:
- Checks accuracy of chief complaint ✓
- Verifies SOCRATES structure makes sense ✓
- Confirms medication names/doses ✓
- Notes any corrections needed ✓
- Adds new findings from examination
- Saves complete record

SYSTEM UPDATES:
1. Physician edits saved (timestamped)
2. Final verified history pushed to HIS
3. Data linked to ABHA (patient can access via app)
4. Audit trail created (DPDP compliance)
5. Session data cleared from kiosk memory (zero persistence)
6. Next patient ready to use kiosk

END RESULT:
✓ Physician saved 10-15 minutes on history-taking
✓ Complete, verified history on record
✓ Consultation focused on examination/diagnosis
✓ Better patient outcomes (more time for clinical reasoning)
✓ ABDM integrated (lifelong health record)
✓ Privacy protected (DPDP compliant)
```

---

## PART 5: COMPLETE TEAM TASK ALLOCATION & DEVELOPMENT MATRIX

### 5.1 Four Core Development Tracks

```
╔═════════════════════════════════════════════════════════════════╗
║  TRACK 1: FRONTEND & HARDWARE INTEGRATION                      ║
║  Lead: Frontend Engineer (React/Electron Specialist)            ║
║  Team Size: 2 developers                                        ║
╚═════════════════════════════════════════════════════════════════╝

RESPONSIBILITY:
├─ Build 5 user-facing screens (React components)
├─ Implement voice input UI (Web Speech API integration)
├─ Document upload interface
├─ State management (React Context)
├─ Zero-persistence session lifecycle
├─ Responsive design (kiosk + tablet friendly)
└─ Hardware events (touchscreen, microphone, printer)

DELIVERABLES (72-hour Build):

Day 1 - UI Shells:
├─ Screen 1: Welcome (language, consent, ABHA mock)
├─ Screen 2: Interview (voice + touch buttons)
├─ Screen 3: Upload (drag-drop, OCR preview)
├─ Screen 4: Handoff (confirmation)
├─ Screen 5: Doctor Dashboard (beautiful table layout)
├─ Navigation (React Router)
└─ Design system (TailwindCSS tokens applied)

Day 2 - Voice Integration:
├─ Wire microphone button to Web Speech API
├─ Display live transcript as user speaks
├─ Add [STOP], [CLEAR], [RESTART] controls
├─ Visual feedback (pulsing animation while listening)
├─ Error handling (microphone denied, no support)
├─ Accessibility (ARIA labels, keyboard nav)
└─ Test on actual touchscreen device

Day 3 - Polish & Responsive:
├─ Mobile responsiveness (< 480px)
├─ Tablet responsiveness (480-1024px)
├─ Desktop responsiveness (> 1024px)
├─ Button sizes optimized for touch (48px+ min)
├─ Font sizes accessible (16px+ for body)
├─ Session cleanup (zero data after use)
├─ Loading states & feedback
└─ Error boundary components

TECHNICAL REQUIREMENTS:
├─ React 18 (hooks, context)
├─ TailwindCSS (design tokens)
├─ React Router v6 (page navigation)
├─ Web Speech API (browser native)
├─ Responsive design (mobile-first)
├─ Accessibility (WCAG AA)
└─ localStorage (demo data persistence optional)

SUCCESS CRITERIA:
✓ All 5 screens exist and navigate smoothly
✓ Welcome screen works (no consent = proceed disabled)
✓ Interview screen captures voice
✓ Doctor Dashboard displays beautifully
✓ Responsive on mobile/tablet/desktop
✓ No console errors
✓ Touch-friendly (all buttons 48px+ height)
✓ Clinical aesthetic (not AI-generated look)


╔═════════════════════════════════════════════════════════════════╗
║  TRACK 2: AI PIPELINES & NLP ENGINEERING                       ║
║  Lead: AI/ML Engineer (LLM + OCR Specialist)                    ║
║  Team Size: 1-2 engineers                                       ║
╚═════════════════════════════════════════════════════════════════╝

RESPONSIBILITY:
├─ LLM prompt engineering (SOCRATES + Dashavidha)
├─ OCR processing pipeline (Tesseract.js → text extraction)
├─ Clinical NER (Named Entity Recognition)
├─ Red-flag detection engine
├─ Drug interaction checking
├─ JSON schema validation
└─ AI model coordination

DELIVERABLES (72-hour Build):

Day 1 - Prompt Engineering:
├─ Design SOCRATES prompt template
├─ Design Dashavidha prompt template
├─ Define JSON schema output
├─ Validate with sample inputs
├─ Test with Gemini API (free tier)
└─ Fallback prompts (if API changes)

Day 2 - API Integration:
├─ Implement Gemini API client
├─ Handle API responses (parse JSON)
├─ Implement error handling (timeouts, rate limits)
├─ Implement OCR pipeline (Tesseract.js)
├─ Extract clinical entities from OCR text
├─ Validate extracted data
├─ Log API calls (for testing)
└─ Implement retries & fallbacks

Day 3 - Red-Flag Detection:
├─ Implement red-flag keyword matcher
├─ Implement emergency symptom detector
├─ Implement drug interaction checker
├─ Implement allergy contraindication checker
├─ Create alert output format
├─ Test with sample scenarios
└─ Performance optimization (< 2 sec processing)

TECHNICAL REQUIREMENTS:
├─ Gemini 1.5 API (free tier: 60 req/min)
├─ Tesseract.js (client-side OCR)
├─ Prompt engineering expertise
├─ JSON schema validation
├─ NER (keyword matching + rules engine)
├─ Error handling & timeouts
└─ Performance monitoring

CODE EXAMPLES PROVIDED:
├─ geminiAPI.js (complete Gemini integration)
├─ tesseractOCR.js (complete OCR pipeline)
├─ SOCRATES prompt template
├─ Dashavidha prompt template
├─ Red-flag detection logic
└─ Test cases

SUCCESS CRITERIA:
✓ Gemini API connects and responds
✓ Prompts return valid JSON (100% parseable)
✓ SOCRATES fields populated correctly
✓ OCR extracts medications & diagnoses
✓ Red-flags detected accurately
✓ Processing < 5 seconds per request
✓ Error handling graceful (no crashes)
✓ Confidence scores calculated


╔═════════════════════════════════════════════════════════════════╗
║  TRACK 3: BACKEND SERVICES & GATEWAY                           ║
║  Lead: Backend Engineer (Node.js/API Specialist)                ║
║  Team Size: 1-2 engineers                                       ║
╚═════════════════════════════════════════════════════════════════╝

RESPONSIBILITY:
├─ API gateway (request routing)
├─ WebSocket connection (real-time voice streaming)
├─ Session management (Redis)
├─ API orchestration (call sequence)
├─ Error handling (graceful degradation)
├─ Rate limiting (API quotas)
├─ Webhook delivery (HIS integration)
├─ Audit logging (DPDP compliance)
└─ Monitoring & alerting

DELIVERABLES (72-hour Build):

Day 1 - Backend Setup:
├─ Create Node.js project (NestJS or Express)
├─ Setup Express/NestJS server
├─ Define REST API endpoints
├─ Setup WebSocket connection
├─ Configure Redis client
├─ Setup environment variables
└─ Error handling middleware

Day 2 - API Integration:
├─ Implement /transcribe endpoint (voice → LLM)
├─ Implement /structure endpoint (raw text → structured)
├─ Implement /extract-ocr endpoint (image → entities)
├─ Implement /validate endpoint (data validation)
├─ Implement /push-to-his endpoint (mock HIS delivery)
├─ Implement session lifecycle
├─ Setup Redis TTL management
└─ Implement error retries

Day 3 - Production Readiness:
├─ Add rate limiting (API quota protection)
├─ Add request logging (audit trail)
├─ Add health check endpoint
├─ Add graceful shutdown
├─ Performance testing (concurrent requests)
├─ Load testing (simulate 50 kiosks)
├─ Error response formatting
└─ API documentation (OpenAPI/Swagger)

TECHNICAL REQUIREMENTS:
├─ Node.js 18+
├─ NestJS or Express.js
├─ Redis client
├─ WebSocket (Socket.io or native)
├─ Axios or Fetch for external APIs
├─ Error handling & logging
├─ Rate limiting (express-rate-limit)
└─ Monitoring (optional: New Relic, Datadog)

APIS TO INTEGRATE:
├─ Gemini API (LLM)
├─ Tesseract.js (or cloud OCR)
├─ Hospital HIS (mock in prototype)
├─ ABDM HIE (mock in prototype)
└─ Bhashini STT (mock or real)

SUCCESS CRITERIA:
✓ Backend server starts without errors
✓ All API endpoints respond
✓ Session management works (create/destroy)
✓ Redis TTL working (auto-expiry)
✓ Error handling graceful
✓ Concurrent requests handled
✓ Audit logging complete
✓ Ready for production scaling


╔═════════════════════════════════════════════════════════════════╗
║  TRACK 4: HEALTH INFORMATICS & ABDM INTEGRATION                ║
║  Lead: Health Informatics Specialist (FHIR/ABDM Expert)         ║
║  Team Size: 1 engineer                                          ║
╚═════════════════════════════════════════════════════════════════╝

RESPONSIBILITY:
├─ FHIR R4 bundle construction (patient → condition → medication)
├─ ABDM API integration (ABHA verification, consent)
├─ JSON schema mapping (patient data → FHIR resources)
├─ Data validation (DPDP compliance)
├─ Audit trail creation (compliance logging)
├─ EMR webhook delivery (HIS integration)
├─ ABHA linking (personal health record)
└─ Compliance verification

DELIVERABLES (72-hour Build):

Day 1 - FHIR Mapping:
├─ Design FHIR R4 bundle structure
├─ Create mappers:
│  ├─ Patient resource mapper
│  ├─ Condition resource mapper
│  ├─ Observation resource mapper
│  ├─ MedicationStatement mapper
│  ├─ AllergyIntolerance mapper
│  └─ DocumentReference mapper
├─ Test mappers with sample data
└─ Validate against FHIR spec

Day 2 - ABDM Integration:
├─ Understand ABHA verification flow (M1 API)
├─ Understand consent artifact (M3 API)
├─ Understand HIE data push (notification)
├─ Implement ABHA ID verification (mock for prototype)
├─ Implement consent artifact creation
├─ Implement FHIR bundle signing
├─ Implement HIE push (webhook simulation)
└─ Test with ABDM sandbox

Day 3 - Compliance & Audit:
├─ Implement DPDP Act logging
├─ Track all data access
├─ Create audit trail
├─ Implement data retention policies
├─ Test consent revocation
├─ Test session cleanup (zero persistence)
├─ Generate compliance report
└─ Document all procedures

TECHNICAL REQUIREMENTS:
├─ FHIR R4 specification knowledge
├─ HL7 standards
├─ ABDM API documentation
├─ JSON schema validation
├─ Digital signatures (optional, for production)
├─ Encryption (optional, for production)
└─ Compliance frameworks (DPDP Act 2023)

RESOURCES PROVIDED:
├─ FHIR bundle example JSON
├─ ABDM API endpoints
├─ DPDP compliance checklist
├─ Audit logging template
└─ Testing scenarios

SUCCESS CRITERIA:
✓ FHIR bundle constructs correctly
✓ All required resources included
✓ JSON validates against FHIR schema
✓ ABHA verification works (mock)
✓ Consent artifact created
✓ Data can be pushed to HIE
✓ Audit trail complete
✓ DPDP compliant (consent + encryption)


═══════════════════════════════════════════════════════════════════

CROSS-TRACK DEPENDENCIES:

Frontend (Track 1)
    ↓ sends transcript
AI/ML (Track 2)
    ↓ returns structured JSON
Backend (Track 3)
    ↓ routes to compliance layer
Health Informatics (Track 4)
    ↓ creates FHIR bundle
    ↓ pushes to HIS
Doctor sees summary

DAILY SYNC MEETINGS:
- 9 AM: Stand-up (15 min)
  ├─ What did you complete yesterday?
  ├─ What are you working on today?
  └─ What's blocking you?

- 6 PM: Status check (15 min)
  ├─ Demo what works
  ├─ Identify blockers
  └─ Adjust next day's plan

HANDOFF POINTS:
- Frontend → Backend: API contracts (endpoints, JSON formats)
- Backend → AI/ML: Request format, response format
- AI/ML → Backend: Output JSON schema
- Backend → Health Informatics: Structured data ready
- All → Testing: Demo scenarios ready for testing
```

### 5.2 Team Coordination Framework

```
PROJECT TIMELINE: 72 Hours (Aug 22-24)

┌─────────────────────────────────────────────────────────────────┐
│ FRIDAY, AUGUST 22 - DAY 1: BUILD UI SHELL                      │
├─────────────────────────────────────────────────────────────────┤

TIME | TRACK 1          | TRACK 2           | TRACK 3        | TRACK 4
────────────────────────────────────────────────────────────────────
 9AM | Setup React      | Design SOCRATES   | Setup Node.js   | Design FHIR
     | TailwindCSS      | prompt            | server          | mapping
     | Project init     |                   |                 |
────────────────────────────────────────────────────────────────────
 11AM| Build Screen 1   | Test Gemini API   | REST endpoints  | FHIR bundle
 to  | (Welcome)        | free tier         | definitions     | example
 1PM | Build Screen 2   | Validate JSON     | Error handling  |
     | (Interview)      | response          | middleware      |
────────────────────────────────────────────────────────────────────
 1PM | LUNCH / TEAM SYNC (15 min demo of screens)
────────────────────────────────────────────────────────────────────
 2PM | Build Screen 3   | Design red-flag   | Session        | Implement
 to  | (Upload)         | detection         | management     | ABHA mock
 5PM | Build Screen 4   | Test OCR pipeline | Redis setup    |
     | (Handoff)        | (Tesseract.js)    |                |
────────────────────────────────────────────────────────────────────
 5PM | TEAM CHECK-IN (15 min status)
────────────────────────────────────────────────────────────────────
 5PM | Build Screen 5   | Finalize prompt   | Integration    | Consent
 to  | (Dashboard)      | templates         | endpoints      | framework
 9PM | Polish UI        | Confidence scores | API mocking    | Audit logging
     | Navigation       |                   |                |
────────────────────────────────────────────────────────────────────

END OF DAY 1 CHECKLIST:
✓ All 5 screens exist, navigate smoothly
✓ Doctor Dashboard is beautiful
✓ Gemini API key working
✓ SOCRATES prompt validated
✓ Redis connection working
✓ FHIR bundle structure defined


┌─────────────────────────────────────────────────────────────────┐
│ SATURDAY, AUGUST 23 - DAY 2: INTEGRATE APIS                    │
├─────────────────────────────────────────────────────────────────┤

TIME | TRACK 1          | TRACK 2           | TRACK 3        | TRACK 4
────────────────────────────────────────────────────────────────────
 9AM | Wire microphone  | Connect Gemini    | Implement      | Create mappers
     | to Web Speech API| API calls         | /transcribe    | (Patient →
     | Show live        | Test with demo    | endpoint       | Condition →
     | transcript       | audio             |                | Observation)
────────────────────────────────────────────────────────────────────
 11AM| Voice button     | Implement JSON    | Implement      | Implement FHIR
 to  | feedback (pulse) | parsing           | /structure     | bundle
 1PM | Handle errors    | Confidence scores | endpoint       | constructor
     | (mic denied)     |                   | API mocking    |
────────────────────────────────────────────────────────────────────
 1PM | LUNCH / TEAM SYNC (Full end-to-end flow demo)
────────────────────────────────────────────────────────────────────
 2PM | Wire Interview   | Red-flag          | Wire all APIs  | Implement
 to  | to Gemini API    | detection         | together       | consent &
 5PM | Doctor Dashboard | Drug interaction  | Session        | privacy
     | reads from       | checker           | cleanup        | tracking
     | context          | Test complete     |                |
────────────────────────────────────────────────────────────────────
 5PM | TEAM CHECK-IN (What's working? What's broken?)
────────────────────────────────────────────────────────────────────
 5PM | Responsive       | Performance       | Error handling | Complete
 to  | design           | optimization      | & retries      | DPDP mapping
 9PM | Accessibility    | Batch testing     | Load testing   | Audit trail
     | fixes            | (10 sample intakes| (mock 50 kiosks| testing
────────────────────────────────────────────────────────────────────

END OF DAY 2 CHECKLIST:
✓ Patient can speak, AI structures, physician sees
✓ No crashes during end-to-end flow
✓ Doctor Dashboard updates with real data
✓ Red-flags detected
✓ Session cleanup working
✓ Complete FHIR bundle generated
✓ Audit logging functional


┌─────────────────────────────────────────────────────────────────┐
│ SUNDAY, AUGUST 24 - DAY 3: POLISH & REHEARSAL                  │
├─────────────────────────────────────────────────────────────────┤

TIME | TRACK 1          | TRACK 2           | TRACK 3        | TRACK 4
────────────────────────────────────────────────────────────────────
 9AM | Mobile RWD       | Accuracy testing  | Performance    | Compliance
     | testing          | with sample data  | testing        | verification
     | Button sizes     | Edge cases        | Concurrent     | DPDP checklist
     | Accessibility    |                   | requests       |
────────────────────────────────────────────────────────────────────
 11AM| Fix UI bugs      | Optimize prompts  | Fix API timeouts| Fix data
 to  | Polish UI        | Handle edge cases | Circuit breaker| retention
 1PM | Create backup    | Fallback logic    | Graceful       | Export
     | screenshots      |                   | degradation    | compliance doc
────────────────────────────────────────────────────────────────────
 1PM | LUNCH + TEAM REHEARSAL (Full demo, timing, Q&A prep)
────────────────────────────────────────────────────────────────────
 2PM | Rehearsal #1     | Rehearsal #1      | Rehearsal #1   | Rehearsal #1
 to  | (20 min)         | (20 min)          | (20 min)       | (20 min)
 3PM |                  |                   |                |
────────────────────────────────────────────────────────────────────
 3PM | TEAM FEEDBACK & FIXES (30 min)
────────────────────────────────────────────────────────────────────
 3PM | Rehearsal #2     | Rehearsal #2      | Rehearsal #2   | Rehearsal #2
 to  | (20 min)         | (20 min)          | (20 min)       | (20 min)
 4PM |                  |                   |                |
────────────────────────────────────────────────────────────────────
 4PM | PRESENTER SOLO REHEARSAL (30 min - memorize script, practice voice)
────────────────────────────────────────────────────────────────────
 5PM | Final Polish     | Final optimization| Final testing  | Print materials
 to  | Print backup     | Test edge cases   | Backup configs | Compliance
 7PM | screenshots      | Confidence levels |                | summary
     | Print handouts   |                   |                |
────────────────────────────────────────────────────────────────────
 7PM | DINNER + REST (8 hours sleep)
────────────────────────────────────────────────────────────────────

END OF DAY 3 CHECKLIST:
✓ No crashes during demo
✓ All screens responsive
✓ Microphone works reliably
✓ Presenter knows script cold
✓ Backup screenshots ready
✓ Printed handouts ready
✓ Team confident
✓ Ready to present


┌─────────────────────────────────────────────────────────────────┐
│ MONDAY, AUGUST 25 - PRESENTATION DAY                           │
├─────────────────────────────────────────────────────────────────┤

T-30 min | Arrive early, test all tech
T-20 min | Microphone test
T-10 min | Console hidden, backup ready
T-0      | PRESENT (10-12 minutes)
T+12 min | Q&A (2-4 minutes)
T+17 min | Thank judges, hand over materials
T+20 min | CELEBRATE! 🎉
```

---

## PART 6: SUCCESS CRITERIA & VALIDATION

### 6.1 Functional Requirements (Must-Have)

```
PATIENT INTERFACE:
✓ Welcome screen: Language selection, consent, ABHA mock
✓ Interview screen: Voice capture, live transcript, AI follow-ups
✓ Touch buttons: Large (48px+ height), high contrast
✓ Upload screen (optional): Document upload, OCR preview
✓ Handoff screen: Confirmation, room number
✓ Accessibility: Works for low-literacy, elderly, first-time users

VOICE CAPTURE:
✓ Microphone permission prompt (first use)
✓ Real-time transcript display
✓ Auto-stop after 3-second silence
✓ Error handling (mic denied, no support)
✓ Clear/Restart buttons

AI PROCESSING:
✓ Gemini API integration (working)
✓ SOCRATES structuring (all fields populated)
✓ JSON validation (100% parseable)
✓ Red-flag detection (identifies emergencies)
✓ Response time < 5 seconds

DOCTOR INTERFACE:
✓ Doctor Dashboard loads patient summary
✓ Table format: Chief complaint, HPI, PMH, Meds, Labs
✓ Editable fields (for physician verification)
✓ Red flags highlighted
✓ [EDIT], [CONFIRM], [PRINT] buttons work
✓ Professional appearance (clinical aesthetic)

SYSTEM BEHAVIOR:
✓ No crashes during demo flow
✓ Session data cleared after use (zero persistence)
✓ FHIR bundle can be generated
✓ Audit logging functional
✓ DPDP consent working
```

### 6.2 Non-Functional Requirements (Should-Have)

```
PERFORMANCE:
- Page load: < 2 seconds
- Voice capture to LLM response: < 5 seconds
- Doctor Dashboard render: < 500ms
- Zero lag on button clicks
- Responsive on mobile (< 480px)

USABILITY:
- Button sizes: 48px minimum
- Font sizes: 16px+ for body text
- Contrast ratio: WCAG AA (4.5:1 minimum)
- Touch-friendly (no hover states)
- Audio feedback available

RELIABILITY:
- No uncaught errors
- Graceful error handling (no crashes)
- Fallbacks for API timeouts
- Retry logic for transient failures

SECURITY:
- HTTPS only (production)
- No patient data in browser localStorage (except session)
- Automatic session timeout (15 min idle)
- Zero data persistence on kiosk (after session)
```

### 6.3 Testing Checklist (Before Demo)

```
TECHNICAL TESTING:
- [ ] Microphone works (test in quiet room)
- [ ] Microphone works (test in noisy room)
- [ ] Gemini API responds (test manually)
- [ ] JSON parsing doesn't crash
- [ ] Web Speech API captures audio
- [ ] Transcript displays live
- [ ] Doctor Dashboard renders all fields
- [ ] No console errors (F12 → console is clean)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Navigation works (no broken links)
- [ ] All buttons clickable (touch-friendly sizes)

FLOW TESTING (Complete End-to-End):
- [ ] Welcome → Interview → Dashboard works
- [ ] Voice capture → Structured → Display works
- [ ] Upload (if included) works without crashes
- [ ] Handoff → Doctor Dashboard transition smooth
- [ ] Session cleanup (no data after use)

UI/UX TESTING:
- [ ] Doctor Dashboard looks professional (not AI-generated)
- [ ] Colors match clinical palette
- [ ] Typography readable
- [ ] Contrast acceptable (WCAG AA)
- [ ] Buttons are clearly clickable
- [ ] No gradients or trendy animations
- [ ] Icons are professional

EDGE CASE TESTING:
- [ ] Microphone denied (graceful error)
- [ ] API timeout (fallback message)
- [ ] No internet (test with LTE off)
- [ ] Long patient transcript (handles > 1000 chars)
- [ ] Special characters in names
- [ ] Very fast clicks (no double-submit)
```

---

## PART 7: DEPLOYMENT & LAUNCH CHECKLIST

### 7.1 Prototype Deployment (Post-Hackathon)

```
IMMEDIATE (Hours):
- [ ] Deploy to Vercel (free tier)
- [ ] Test on public URL
- [ ] Verify all APIs work from cloud

FIRST WEEK (Pilot):
- [ ] Install on 1-2 kiosk machines
- [ ] Configure hospital WiFi
- [ ] Test with real patients (10-20)
- [ ] Collect feedback
- [ ] Fix bugs

FIRST MONTH (Scaling):
- [ ] Deploy to 5 hospital locations
- [ ] Monitor uptime & performance
- [ ] Gather usage data
- [ ] Optimize based on real-world usage

PRODUCTION (Months 2-3):
- [ ] Security hardening
- [ ] HIPAA/local compliance audit
- [ ] Scale to 50+ locations
- [ ] Enterprise support structure
- [ ] Training materials
```

### 7.2 Post-Demo Roadmap

```
PHASE 2 (Months 1-3):
├─ Database persistence (replace mock)
├─ Real ABDM integration (not mocked)
├─ Real ABHA verification
├─ Real EMR/HIS APIs
├─ Multi-language support (10+ languages)
├─ AYUSH history mode (full Dashavidha)
├─ Advanced analytics dashboard
└─ Hospital admin portal

PHASE 3 (Months 3-6):
├─ Mobile app (patient access to their records)
├─ Video consultation integration
├─ Prescription generation
├─ Lab ordering from kiosk
├─ Appointment scheduling
├─ Telemedicine support
└─ AI-powered referral suggestions

PHASE 4 (Months 6+):
├─ Predictive analytics (risk scoring)
├─ Drug recommendation engine
├─ Population health monitoring
├─ Insurance integration
├─ Cost estimation
├─ Quality metrics dashboard
└─ National deployment (50,000+ kiosks)
```

---

## CONCLUSION

**MediKiosk is a transformative solution** addressing one of Indian healthcare's most critical bottlenecks. By moving clinical history-taking from the consultation room to the pre-consultation waiting area, powered by AI and integrated with ABDM's national health infrastructure, it:

1. **Solves the Capacity Problem:** 40M+ annual OPD patients served efficiently
2. **Improves Diagnostic Accuracy:** Complete history → 70-80% diagnostic accuracy
3. **Enables Physician Focus:** Doctors spend time on diagnosis, not history-taking
4. **Respects Patient Privacy:** DPDP Act 2023 compliant, zero persistence architecture
5. **Integrates Nationally:** ABDM/ABHA integration for lifelong health records
6. **Scales to India:** Costs ₹5-10 per patient, 50x ROI Year 1

**For the hackathon:** Deliver a polished, functional prototype that demonstrates the golden path. Make judges believe this can actually save lives.

---

**Document Version:** 2.0 (Master Specification)
**Total Length:** ~15,000 words
**Status:** Complete Technical Reference
**Ready for:** Production Build


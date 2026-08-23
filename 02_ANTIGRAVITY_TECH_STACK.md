# MediKiosk Antigravity Technical Stack
## Implementation Specifications

---

## FRONTEND FRAMEWORK

### Primary Stack
- **Framework:** React.js (lightweight, component-based)
- **Styling:** TailwindCSS (utility-first, rapid prototyping)
- **State Management:** React Hooks (useState, useContext for simplicity)
- **Routing:** React Router v6 (page navigation)

### Alternative (Faster)
- **HTML/CSS/JavaScript** with minimal build process
- Can start faster, but less maintainable if iterations needed

**Recommendation:** React.js + TailwindCSS balances speed and professionalism.

---

## VOICE INPUT (ASR)

### Option 1: Web Speech API (RECOMMENDED FOR PROTOTYPE)
- **Built-in:** Works in Chrome, Edge, Safari
- **Cost:** FREE
- **Latency:** ~1-2 seconds
- **Language Support:** Hindi + English
- **Use Case:** Perfect for demo

```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'hi-IN'; // Hindi
// or 'en-US' for English

recognition.onresult = (event) => {
  let transcript = '';
  for (let i = event.resultIndex; i < event.results.length; i++) {
    transcript += event.results[i][0].transcript;
  }
  console.log('Captured:', transcript);
  // Send to LLM API
};

recognition.start();
```

### Option 2: Google Cloud Speech-to-Text (Production Quality)
- **Cost:** $0.06 per 15-second request
- **Quality:** Superior multilingual support
- **Setup:** Requires API key + backend proxy

**For MVP:** Use Web Speech API. Upgrade to Google Cloud if time permits.

---

## AI TEXT PROCESSING (LLM)

### Option 1: Google Gemini API (RECOMMENDED)
- **Cost:** Free tier available (60 requests/minute)
- **Model:** gemini-1.5-flash (faster) or gemini-2.0-flash-exp
- **Language:** Excellent Hindi support
- **Integration:** Simple REST API call

```javascript
const response = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an expert clinical triage assistant...
${systemPrompt}

Raw Patient Voice Transcript:
"${transcription}"

Respond ONLY with valid JSON...`
        }]
      }],
      generationConfig: {
        temperature: 0.2, // Lower = more structured
        maxOutputTokens: 1000,
      }
    })
  }
);

const data = await response.json();
const structuredHistory = JSON.parse(data.candidates[0].content.parts[0].text);
```

### Option 2: OpenAI GPT-4
- **Cost:** $0.01-0.03 per request
- **Quality:** Excellent
- **Setup:** Simple API key

```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4-turbo',
    messages: [{
      role: 'system',
      content: `You are an expert clinical triage assistant...`
    }, {
      role: 'user',
      content: `Raw Patient Voice Transcript:\n"${transcription}"\n\nRespond ONLY with valid JSON...`
    }],
    temperature: 0.2,
    max_tokens: 1000
  })
});
```

**Recommendation:** Gemini API for cost-effectiveness. GPT-4 if you need higher reliability.

---

## DOCUMENT DIGITIZATION (OCR)

### Option 1: Tesseract.js (CLIENT-SIDE) ⭐ RECOMMENDED
- **Cost:** FREE
- **Where:** Runs entirely in browser (no backend needed)
- **Quality:** Good for printed docs, handwriting varies
- **Setup:** NPM package

```javascript
import Tesseract from 'tesseract.js';

async function extractTextFromImage(imageFile) {
  const result = await Tesseract.recognize(
    imageFile,
    'eng+hin', // English + Hindi
    {
      logger: m => console.log(m),
      corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v4/tesseract-core.wasm.js'
    }
  );
  
  return result.data.text;
}
```

**Advantages:**
- No backend required
- Privacy (processing happens client-side)
- Free
- Works offline

**Limitations:**
- Slower than cloud OCR (~5-10 seconds per image)
- Less accurate for handwriting
- For prototype: sufficient

### Option 2: Google Cloud Vision (Production)
- **Cost:** $1.50 per 1000 requests
- **Quality:** Excellent
- **Handwriting:** Near-perfect
- **Setup:** Requires backend + API key

**For MVP:** Stick with Tesseract.js. Easy to upgrade.

---

## BACKEND REQUIREMENTS (Minimal)

### Option 1: NO BACKEND (RECOMMENDED FOR SPEED)
- **Storage:** Browser localStorage
- **Authentication:** Mock (no real auth)
- **API Calls:** Frontend directly calls LLM APIs (using CORS-proxy if needed)

**Limitations:**
- Data lost on browser clear
- Not suitable for multi-device/session persistence
- But fine for a 72-hour demo

### Option 2: Simple Node.js Backend
- **Framework:** Express.js or Next.js API Routes
- **Database:** Firebase Realtime DB (free tier) or simple in-memory array
- **Purpose:**
  - Securely handle API keys (don't expose keys on frontend)
  - Persist patient history
  - Log audit trail

**Minimal Backend Setup:**
```
project/
├── frontend/          (React app)
├── backend/           (Express.js)
│   ├── routes/
│   │   ├── history.js (POST history → LLM → return JSON)
│   │   ├── documents.js (POST image → Tesseract → extract text)
│   │   └── dashboard.js (GET structured history)
│   ├── .env           (API keys)
│   └── server.js
└── package.json
```

**For 72-hour build:** Recommend Option 1 (no backend). Add backend if time permits.

---

## DATA FLOW ARCHITECTURE

### Happy Path: Patient Speaks → Doctor Sees Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    PATIENT JOURNEY                          │
├─────────────────────────────────────────────────────────────┤

STEP 1: PATIENT LOGS IN
├─ Frontend: Welcome screen
├─ Action: Select language, "Simulate ABHA Login"
└─ Storage: sessionStorage.set('language', 'hi')

STEP 2: PATIENT SPEAKS
├─ Frontend: Interview screen
├─ Tech: window.SpeechRecognition
├─ Captures: "I have severe headache for 3 days..."
└─ Variable: const rawTranscription = "I have severe..."

STEP 3: LLM STRUCTURING
├─ Frontend: POST to Gemini API
├─ Payload: {
│    systemPrompt: "You are clinical triage...",
│    rawTranscript: "I have severe..."
│  }
├─ LLM Response: {
│    chief_complaint: "Severe headache",
│    history_of_present_illness: { ... },
│    triage_priority: "Urgent"
│  }
└─ Storage: setState(structuredHistory)

STEP 4 (Optional): DOCUMENT UPLOAD
├─ Frontend: Upload screen
├─ Tech: Tesseract.js
├─ Action: Extract text from prescription image
├─ LLM: "Extract medications from this text: ..."
├─ Response: {
│    diagnoses: ["Hypertension"],
│    medications: [{ name: "Amlodipine", dose: "5mg" }]
│  }
└─ Merge: structuredHistory.prior_medications = [...]

STEP 5: HANDOFF
├─ Frontend: Confirmation screen
├─ Action: "Proceed to Room 102"
└─ Navigation: Go to Doctor Dashboard

STEP 6: DOCTOR SEES SUMMARY
├─ Frontend: Doctor Dashboard screen
├─ Data: Display structuredHistory in clinical format
├─ UI: Clean table with sections
│    - Chief Complaint
│    - HPI (SOCRATES breakdown)
│    - Past History
│    - Medications
│    - Labs
│    - Triage Flag
└─ Action: Doctor clicks [CONFIRM] to save

└─────────────────────────────────────────────────────────────┘
```

---

## ENVIRONMENT VARIABLES & API KEYS

### Required (Add to `.env`)
```
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
REACT_APP_OPENAI_API_KEY=optional_openai_key
```

### Getting Keys (Free Tiers)

**Google Gemini:**
1. Go to: https://aistudio.google.com/apikey
2. Click "Get API Key"
3. Create new project
4. Copy key → paste in `.env`
5. Free tier: 60 requests/minute, 1500 requests/day

**OpenAI (Optional):**
1. Go to: https://platform.openai.com/api/keys
2. Create new key
3. Add credit or billing
4. Copy key → paste in `.env`

---

## DEPENDENCIES (npm packages)

### Core
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "axios": "^1.6.0",
    "tailwindcss": "^3.x"
  },
  "devDependencies": {
    "tesseract.js": "^4.0.0"
  }
}
```

### Install Command
```bash
npm install react react-dom react-router-dom axios tailwindcss tesseract.js
```

---

## FOLDER STRUCTURE

```
medikiosk-prototype/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── WelcomeScreen.jsx
│   │   ├── InterviewScreen.jsx
│   │   ├── DocumentUploadScreen.jsx
│   │   ├── HandoffScreen.jsx
│   │   ├── DoctorDashboard.jsx
│   │   └── VoiceButton.jsx
│   ├── utils/
│   │   ├── speechRecognition.js
│   │   ├── geminiAPI.js
│   │   ├── tesseractOCR.js
│   │   └── formatters.js
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.config.js
│   ├── context/
│   │   └── HistoryContext.js (for state management)
│   ├── App.jsx
│   └── index.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## BUILD & DEPLOYMENT

### Local Development
```bash
npm install
npm start
# Runs on http://localhost:3000
```

### Build for Production
```bash
npm run build
# Creates optimized build in build/
```

### Deployment Options (Free)
1. **Vercel** (recommended for React)
   - Connect GitHub repo
   - Auto-deploys on push
   - Free tier included

2. **Netlify**
   - Drag-and-drop deployment
   - Free tier included

3. **GitHub Pages** (static only)
   - Free hosting
   - Limited to static sites

**For hackathon:** Deploy on Vercel (easiest).

---

## TESTING CHECKLIST (Before Demo)

- [ ] Microphone captures voice (test in quiet room)
- [ ] LLM API responds within 5 seconds
- [ ] JSON parsing doesn't crash on edge cases
- [ ] Doctor dashboard displays all fields
- [ ] UI responsive on different screen sizes
- [ ] No console errors
- [ ] Smooth navigation between screens
- [ ] Language selection works (Hindi + English)
- [ ] Document upload (if included) shows OCR progress

---

## PERFORMANCE TARGETS

- **Time to interactive:** < 2 seconds
- **Voice capture to LLM response:** < 5 seconds
- **Page navigation:** < 500ms
- **OCR processing (Tesseract):** 5-10 seconds (acceptable)

---

## NICE-TO-HAVES (If Time Permits)

1. **Error Boundaries** - graceful error handling
2. **Loading Animations** - better UX feedback
3. **Local Storage Persistence** - save history across sessions
4. **Print Functionality** - export summary as PDF
5. **Dark Mode** - accessibility feature
6. **Offline Support** - PWA (Progressive Web App)
7. **Analytics** - track which symptoms are common
8. **Red Flag Alerts** - animation for urgent symptoms

# Program End


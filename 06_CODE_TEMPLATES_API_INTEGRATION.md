# MediKiosk Code Templates & API Integration
## Copy-Paste Ready Code for Antigravity Build

---

## SETUP: Environment & Dependencies

### `.env.local` Template
```bash
# Gemini API
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: OpenAI (if using as backup)
REACT_APP_OPENAI_API_KEY=your_openai_key_here

# App Config
REACT_APP_HOSPITAL_NAME=Demo Hospital
REACT_APP_MAX_UPLOAD_SIZE=5242880
```

### `package.json` Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.383.0"
  },
  "devDependencies": {
    "tesseract.js": "^4.1.1"
  }
}
```

---

## GEMINI API INTEGRATION

### Complete API Utility

**File: `src/utils/geminiAPI.js`**

```javascript
/**
 * Gemini API Integration for MediKiosk
 * Structures unstructured patient history into clinical format
 */

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const MODEL_NAME = 'gemini-1.5-flash';

/**
 * System prompt for clinical history structuring
 * Provides context for the LLM
 */
const CLINICAL_SYSTEM_PROMPT = `You are an expert clinical triage assistant operating in an Indian hospital OPD.
Your task is to take the unstructured raw transcript of a patient's spoken history 
and convert it into a highly structured JSON object following standard clinical formats.

Follow these rules:
1. Use the SOCRATES framework: Site, Onset, Character, Radiation, Associated symptoms, Time course, Exacerbating/relieving factors, Severity
2. If a detail is not mentioned, output "Not specified"
3. For severity: estimate on 0-10 scale if mentioned
4. For triage priority: assess as Routine, Urgent, or Emergency based on red-flag symptoms
5. Red flag symptoms (Emergency): chest pain with dyspnea, stroke symptoms, severe bleeding, acute respiratory distress, altered consciousness
6. Maintain medical accuracy
7. Be concise but complete

Language: Use English in the JSON output regardless of patient's language`;

/**
 * Main function to structure patient history
 * @param {string} transcription - Raw patient voice transcript
 * @param {string} ocrText - Extracted text from medical documents (optional)
 * @returns {Promise<Object>} Structured history JSON
 */
export async function structureHistory(transcription, ocrText = '') {
  if (!GEMINI_API_KEY) {
    throw new Error('REACT_APP_GEMINI_API_KEY not configured');
  }

  if (!transcription || transcription.trim().length === 0) {
    throw new Error('Transcription cannot be empty');
  }

  try {
    console.log('[Gemini] Sending request to structure history...');
    
    const payload = {
      contents: [{
        parts: [
          {
            text: CLINICAL_SYSTEM_PROMPT
          },
          {
            text: `Raw Patient Voice Transcript:
"${transcription.trim()}"

${ocrText ? `Extracted OCR Text from Prior Reports:
"${ocrText}"` : 'No prior documents provided'}

Please structure this into the following JSON schema. Respond ONLY with valid JSON, no other text:
{
  "patient_demographics": {
    "status": "Verified via ABHA (Mock)",
    "capture_method": "Voice + Touch",
    "timestamp": "${new Date().toISOString()}"
  },
  "chief_complaint": "Main reason for visit in 5-10 words",
  "history_of_present_illness": {
    "onset": "When and how did it start",
    "character": "Describe the symptom (sharp, dull, throbbing, etc)",
    "radiation": "Does it spread or radiate anywhere",
    "associated_symptoms": ["symptom1", "symptom2"],
    "duration": "How long has it been going on",
    "severity": "0-10 scale if mentioned, or 'Not specified'",
    "aggravating_relieving_factors": "What makes it worse/better"
  },
  "past_medical_history": {
    "conditions": ["Condition1", "Condition2"],
    "surgeries": ["Surgery1"]
  },
  "medications_and_allergies": {
    "current_medications": [
      {
        "name": "Medicine name",
        "dose": "Dose if mentioned",
        "indication": "Why taking"
      }
    ],
    "allergies": "NKDA or specific allergies"
  },
  "extracted_lab_values": [
    {
      "test_name": "Test",
      "value": "Value",
      "unit": "Unit if mentioned",
      "status": "Normal or Abnormal"
    }
  ],
  "red_flags_detected": ["flag1", "flag2"],
  "triage_priority": "Routine | Urgent | Emergency",
  "confidence_score": 0.95
}`
          }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2000,
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('Unexpected Gemini response format');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log('[Gemini] Response received:', responseText);

    // Extract JSON from response (in case of markdown wrapping)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const structuredData = JSON.parse(jsonMatch[0]);
    
    console.log('[Gemini] Successfully parsed:', structuredData);
    return structuredData;

  } catch (error) {
    console.error('[Gemini] Error:', error);
    throw new Error(`Failed to structure history: ${error.message}`);
  }
}

/**
 * Alternative function to extract info from documents
 * @param {string} ocrText - Extracted text from OCR
 * @returns {Promise<Object>} Extracted clinical entities
 */
export async function extractClinicalEntities(ocrText) {
  if (!ocrText) {
    throw new Error('OCR text cannot be empty');
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Extract clinical entities from this medical document text:
"${ocrText}"

Return ONLY JSON:
{
  "diagnoses": ["diagnosis1", "diagnosis2"],
  "medications": [
    {
      "name": "Medicine",
      "dose": "Dose",
      "frequency": "Times per day"
    }
  ],
  "lab_results": [
    {
      "test": "Test name",
      "value": "Value",
      "reference_range": "Normal range",
      "status": "Normal/Abnormal"
    }
  ],
  "document_type": "Prescription/Lab Report/Discharge Summary",
  "document_date": "Date if mentioned"
}`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000
          }
        })
      }
    );

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error extracting entities:', error);
    throw error;
  }
}
```

### Usage Example in Component

```jsx
import { structureHistory } from '../utils/geminiAPI';
import { useState } from 'react';

export function MyComponent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleStructureHistory = async (transcript) => {
    setLoading(true);
    setError(null);
    
    try {
      const structured = await structureHistory(transcript);
      setResult(structured);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Analyzing...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

---

## SPEECH RECOGNITION INTEGRATION

### Complete Speech Utility

**File: `src/utils/speechRecognition.js`**

```javascript
/**
 * Web Speech API Integration for MediKiosk
 * Handles voice input capture with real-time transcription
 */

export function initiateSpeechRecognition(onTranscript, onError, onStart, onEnd) {
  // Check browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    const error = 'Speech Recognition not supported in this browser. Please use Chrome, Edge, or Safari.';
    onError(error);
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    
    // Configuration
    recognition.continuous = false; // Stop after pause
    recognition.interimResults = true; // Show results as speaking
    recognition.language = 'en-US'; // Can be changed to 'hi-IN' for Hindi

    let finalTranscript = '';
    let isProcessing = false;

    /**
     * Fired when speech recognition starts
     */
    recognition.onstart = () => {
      console.log('[Speech] Recognition started');
      if (onStart) onStart();
    };

    /**
     * Fired when speech is recognized
     */
    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // Final result (confidence is high)
          finalTranscript += transcript + ' ';
        } else {
          // Interim result (user is still speaking)
          interimTranscript += transcript;
        }
      }

      // Send combined (final + interim) to callback
      const combined = finalTranscript + interimTranscript;
      console.log('[Speech] Interim:', combined);
      onTranscript(combined);
    };

    /**
     * Fired when recognition ends
     */
    recognition.onend = () => {
      console.log('[Speech] Recognition ended');
      if (onEnd) onEnd(finalTranscript);
    };

    /**
     * Fired on error
     */
    recognition.onerror = (event) => {
      const errorMessages = {
        'no-speech': 'No speech detected. Please try again.',
        'network': 'Network error. Check your connection.',
        'not-allowed': 'Microphone permission denied. Allow access in browser settings.',
        'service-not-allowed': 'Speech recognition service not available.',
        'bad-grammar': 'Speech recognition error. Please try again.'
      };

      const errorMsg = errorMessages[event.error] || `Error: ${event.error}`;
      console.error('[Speech] Error:', errorMsg);
      onError(errorMsg);
    };

    // Return object with control methods
    return {
      start: () => {
        finalTranscript = '';
        console.log('[Speech] Starting recognition...');
        recognition.start();
      },
      
      stop: () => {
        console.log('[Speech] Stopping recognition...');
        recognition.stop();
        return finalTranscript;
      },
      
      abort: () => {
        console.log('[Speech] Aborting recognition...');
        recognition.abort();
      },
      
      setLanguage: (lang) => {
        recognition.language = lang; // 'en-US', 'hi-IN', etc.
      }
    };

  } catch (error) {
    onError(`Failed to initialize speech recognition: ${error.message}`);
    return null;
  }
}

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = {
  'en-US': 'English (US)',
  'en-IN': 'English (India)',
  'hi-IN': 'हिंदी (Hindi)',
  'ta-IN': 'தமிழ் (Tamil)',
  'te-IN': 'తెలుగు (Telugu)',
  'kn-IN': 'ಕನ್ನಡ (Kannada)',
  'mr-IN': 'मराठी (Marathi)',
  'bn-IN': 'বাংলা (Bengali)',
};
```

### Usage in Component

```jsx
import { initiateSpeechRecognition, SUPPORTED_LANGUAGES } from '../utils/speechRecognition';
import { useState, useEffect } from 'react';
import { Mic, Stop } from 'lucide-react';

export function VoiceInput() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [language, setLanguage] = useState('en-US');

  useEffect(() => {
    const rec = initiateSpeechRecognition(
      setTranscript,  // onTranscript callback
      (error) => alert(error),  // onError callback
      () => setIsListening(true),  // onStart callback
      () => setIsListening(false)  // onEnd callback
    );
    
    if (rec) {
      rec.setLanguage(language);
      setRecognition(rec);
    }
  }, [language]);

  const handleToggleMic = () => {
    if (!recognition) {
      alert('Speech recognition not available');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div>
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>

      <button
        onClick={handleToggleMic}
        className={`w-24 h-24 rounded-full flex items-center justify-center ${
          isListening ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
        }`}
      >
        {isListening ? <Stop /> : <Mic />}
      </button>

      <p>{isListening ? 'Listening...' : 'Click to speak'}</p>

      {transcript && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}
```

---

## TESSERACT OCR INTEGRATION

### OCR Utility

**File: `src/utils/tesseractOCR.js`**

```javascript
/**
 * Tesseract.js Integration for Document OCR
 * Extracts text from images of medical documents
 */

import Tesseract from 'tesseract.js';

/**
 * Extract text from an image file
 * @param {File} imageFile - Image file from upload
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromImage(imageFile, onProgress = null) {
  if (!imageFile) {
    throw new Error('No file provided');
  }

  // Validate file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (imageFile.size > MAX_SIZE) {
    throw new Error('File size exceeds 5MB limit');
  }

  // Validate file type
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!ALLOWED_TYPES.includes(imageFile.type)) {
    throw new Error('Invalid file type. Please upload an image.');
  }

  try {
    console.log('[OCR] Starting Tesseract on file:', imageFile.name);
    
    const result = await Tesseract.recognize(
      imageFile,
      'eng+hin', // English + Hindi (can add more languages)
      {
        logger: (message) => {
          console.log('[OCR] Progress:', message);
          if (onProgress) {
            onProgress(message);
          }
        },
        // Use CDN for faster loading
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v4/tesseract-core.wasm.js'
      }
    );

    const extractedText = result.data.text;
    const confidence = result.data.confidence;

    console.log('[OCR] Complete. Confidence:', confidence);
    
    // Clean up
    await Tesseract.terminate();

    return {
      text: extractedText,
      confidence: confidence,
      language: result.data.psm
    };

  } catch (error) {
    console.error('[OCR] Error:', error);
    throw new Error(`OCR extraction failed: ${error.message}`);
  }
}

/**
 * Extract text from base64 encoded image
 * @param {string} base64String - Base64 encoded image
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromBase64(base64String, onProgress = null) {
  try {
    console.log('[OCR] Starting Tesseract on base64 image');
    
    const result = await Tesseract.recognize(
      base64String,
      'eng+hin',
      {
        logger: (message) => {
          if (onProgress) onProgress(message);
        },
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v4/tesseract-core.wasm.js'
      }
    );

    const extractedText = result.data.text;
    await Tesseract.terminate();

    return extractedText;

  } catch (error) {
    console.error('[OCR] Error:', error);
    throw error;
  }
}
```

### Usage in Component

```jsx
import { extractTextFromImage } from '../utils/tesseractOCR';
import { extractClinicalEntities } from '../utils/geminiAPI';
import { useState } from 'react';

export function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [clinicalData, setClinicalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setLoading(true);
    setProgress('Starting OCR...');

    try {
      // Step 1: OCR extraction
      const ocr = await extractTextFromImage(uploadedFile, setProgress);
      setExtractedText(ocr.text);
      setProgress('Extracting clinical entities...');

      // Step 2: Clinical entity extraction via Gemini
      const entities = await extractClinicalEntities(ocr.text);
      setClinicalData(entities);
      setProgress('');

    } catch (error) {
      alert(`Error: ${error.message}`);
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {loading && <p>Processing: {progress}</p>}

      {extractedText && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3>Extracted Text</h3>
          <p className="text-sm">{extractedText}</p>
        </div>
      )}

      {clinicalData && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <h3>Clinical Entities</h3>
          <pre>{JSON.stringify(clinicalData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## STATE MANAGEMENT (CONTEXT)

### History Context

**File: `src/context/HistoryContext.js`**

```javascript
import React, { createContext, useState, useCallback } from 'react';

export const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState({
    // Demographics
    abhaId: '',
    language: 'en-US',
    timestamp: new Date().toISOString(),

    // Captured Data
    rawTranscript: '',
    chiefComplaint: '',
    
    // HPI (History of Present Illness)
    hpi: {
      onset: 'Not specified',
      character: 'Not specified',
      radiation: 'Not specified',
      associatedSymptoms: [],
      duration: 'Not specified',
      severity: 'Not specified',
      aggravatingRelievingFactors: 'Not specified'
    },

    // Past Medical History
    pastMedicalHistory: {
      conditions: [],
      surgeries: []
    },

    // Medications & Allergies
    medicationsAndAllergies: {
      currentMedications: [],
      allergies: 'NKDA'
    },

    // Lab Values
    priorLabValues: [],

    // Documents
    uploadedDocuments: [],

    // Triage
    triagePriority: 'Routine',
    redFlags: [],
    confidenceScore: 0
  });

  // Reset history
  const resetHistory = useCallback(() => {
    setHistory({
      abhaId: '',
      language: 'en-US',
      timestamp: new Date().toISOString(),
      rawTranscript: '',
      chiefComplaint: '',
      hpi: {
        onset: 'Not specified',
        character: 'Not specified',
        radiation: 'Not specified',
        associatedSymptoms: [],
        duration: 'Not specified',
        severity: 'Not specified',
        aggravatingRelievingFactors: 'Not specified'
      },
      pastMedicalHistory: { conditions: [], surgeries: [] },
      medicationsAndAllergies: { currentMedications: [], allergies: 'NKDA' },
      priorLabValues: [],
      uploadedDocuments: [],
      triagePriority: 'Routine',
      redFlags: [],
      confidenceScore: 0
    });
  }, []);

  // Update history with LLM structured data
  const updateWithStructuredData = useCallback((structuredData) => {
    setHistory(prev => ({
      ...prev,
      chiefComplaint: structuredData.chief_complaint || '',
      hpi: structuredData.history_of_present_illness || prev.hpi,
      pastMedicalHistory: structuredData.past_medical_history || prev.pastMedicalHistory,
      medicationsAndAllergies: structuredData.medications_and_allergies || prev.medicationsAndAllergies,
      priorLabValues: structuredData.extracted_lab_values || prev.priorLabValues,
      triagePriority: structuredData.triage_priority || prev.triagePriority,
      redFlags: structuredData.red_flags_detected || prev.redFlags,
      confidenceScore: structuredData.confidence_score || 0
    }));
  }, []);

  return (
    <HistoryContext.Provider value={{
      history,
      setHistory,
      resetHistory,
      updateWithStructuredData
    }}>
      {children}
    </HistoryContext.Provider>
  );
}
```

---

## COMPLETE INTERVIEW SCREEN COMPONENT

**File: `src/pages/InterviewScreen.jsx`** (Full, production-ready)

```jsx
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, StopCircle, Loader } from 'lucide-react';
import { initiateSpeechRecognition } from '../utils/speechRecognition';
import { structureHistory } from '../utils/geminiAPI';
import { HistoryContext } from '../context/HistoryContext';

export default function InterviewScreen() {
  const navigate = useNavigate();
  const { history, updateWithStructuredData } = useContext(HistoryContext);

  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  useEffect(() => {
    const rec = initiateSpeechRecognition(
      setTranscript,
      (err) => setError(err),
      () => setIsListening(true),
      () => setIsListening(false)
    );
    setRecognition(rec);
  }, []);

  const handleMicClick = () => {
    if (!recognition) {
      setError('Speech Recognition not available in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setError('');
      recognition.start();
    }
  };

  const handleSymptomClick = (symptom) => {
    const updated = transcript + (transcript ? ', ' : '') + symptom;
    setTranscript(updated);

    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleClearTranscript = () => {
    setTranscript('');
    setSelectedSymptoms([]);
    setError('');
  };

  const handleNext = async () => {
    if (!transcript.trim()) {
      setError('Please speak or select at least one symptom');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const structuredData = await structureHistory(transcript);
      updateWithStructuredData(structuredData);
      navigate('/upload');
    } catch (err) {
      setError(`Processing Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const COMMON_SYMPTOMS = [
    'Fever', 'Cough', 'Headache', 'Chest Pain',
    'Body Ache', 'Nausea', 'Vomiting', 'Diarrhea',
    'Breathing Difficulty', 'Fatigue'
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 pb-6 border-b-2 border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-clinical">Tell us what's wrong</h1>
            <p className="text-sm text-gray-600 mt-2">Speak naturally or select from common symptoms</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Step 2 of 5</p>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Left: Voice Input */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-clinical mb-8">Speak your concern</h2>

            {/* Microphone Button */}
            <div className="flex flex-col items-center mb-8">
              <button
                onClick={handleMicClick}
                disabled={isProcessing}
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all mb-6 ${
                  isListening
                    ? 'bg-medical text-white animate-pulse shadow-lg'
                    : 'bg-gray-100 text-clinical hover:bg-gray-200'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isListening ? <StopCircle className="w-16 h-16" /> : <Mic className="w-16 h-16" />}
              </button>

              <p className="text-sm font-semibold text-clinical">
                {isListening ? '🎙️ LISTENING...' : '👂 TAP TO SPEAK'}
              </p>
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border-2 border-gray-200 min-h-20">
                <p className="text-sm text-gray-800 leading-relaxed">{transcript}</p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 p-4 rounded-lg mb-6 border-2 border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleClearTranscript}
                className="flex-1 py-2 px-4 bg-gray-100 text-clinical font-semibold rounded-lg hover:bg-gray-200 transition-all"
              >
                CLEAR
              </button>
              <button
                onClick={handleMicClick}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-gray-100 text-clinical font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                {isListening ? 'STOP' : 'RESTART'}
              </button>
            </div>
          </div>

          {/* Right: Quick Symptoms */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-clinical mb-8">Or select symptoms</h2>

            {/* Symptom Buttons Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {COMMON_SYMPTOMS.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => handleSymptomClick(symptom)}
                  className={`py-3 px-3 font-semibold rounded-lg transition-all ${
                    selectedSymptoms.includes(symptom)
                      ? 'bg-medical text-white'
                      : 'bg-gray-100 text-clinical hover:bg-gray-200'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex gap-4 pt-8 border-t-2 border-gray-200">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 px-4 bg-gray-100 text-clinical font-bold rounded-lg hover:bg-gray-200 transition-all"
          >
            ← PREVIOUS
          </button>
          <button
            onClick={handleNext}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 bg-medical text-white font-bold rounded-lg hover:bg-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                ANALYZING...
              </>
            ) : (
              'NEXT →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## TESTING CHECKLIST

### Unit Tests (If Time)

**File: `src/utils/__tests__/geminiAPI.test.js`**

```javascript
import { structureHistory } from '../geminiAPI';

describe('Gemini API', () => {
  it('should return structured JSON for patient transcript', async () => {
    const transcript = 'I have a severe headache for 3 days';
    const result = await structureHistory(transcript);
    
    expect(result).toHaveProperty('chief_complaint');
    expect(result).toHaveProperty('history_of_present_illness');
    expect(result).toHaveProperty('triage_priority');
  });

  it('should handle empty transcript', async () => {
    const transcript = '';
    expect(() => structureHistory(transcript)).toThrow();
  });
});
```

### Manual Testing Checklist

```
SPEECH RECOGNITION:
- [ ] Microphone permission prompts correctly
- [ ] Captures speech in quiet environment
- [ ] Captures speech in noisy environment (hospital simulation)
- [ ] Handles background noise gracefully
- [ ] Stops after 3-second silence
- [ ] Displays interim results while speaking

GEMINI API:
- [ ] Connects to API successfully
- [ ] Returns valid JSON response
- [ ] Handles timeouts gracefully
- [ ] Extracts SOCRATES correctly
- [ ] Identifies triage priority
- [ ] Detects red flags

UI/UX:
- [ ] Buttons are tappable (48px+ size)
- [ ] Text is readable (16px+ font)
- [ ] No crashes during navigation
- [ ] Transitions are smooth
- [ ] Responsive on mobile (< 480px)
- [ ] Responsive on tablet (480-1024px)
- [ ] Responsive on desktop (> 1024px)

PERFORMANCE:
- [ ] Page loads in < 2 seconds
- [ ] Microphone starts in < 500ms
- [ ] LLM response in < 5 seconds
- [ ] No lag when typing/scrolling
```

---

## DEPLOYMENT CHECKLIST

```bash
# Build for production
npm run build

# Test build locally
npm install -g serve
serve -s build

# Deploy to Vercel
npm install -g vercel
vercel

# Or deploy to Netlify
# Connect GitHub repo to Netlify (auto-deploy on push)
```

---

## COMMON ERRORS & FIXES

### Error: "REACT_APP_GEMINI_API_KEY not configured"
- **Fix:** Add key to `.env.local` and restart dev server

### Error: "Speech Recognition not supported"
- **Fix:** Test in Chrome/Edge/Safari (not Firefox)

### Error: "Gemini API rate limit exceeded"
- **Fix:** Use free tier quota carefully; implement request caching

### Error: "OCR timeout"
- **Fix:** Reduce image size before upload; use CORS proxy for Tesseract

### Build Error: "Unexpected token }"
- **Fix:** Check for syntax errors in JSX; run `npm run build` to see full error

---

## QUICK START SCRIPT

```bash
# 1. Setup
git clone your-repo
cd medikiosk-prototype
npm install

# 2. Create .env.local
echo 'REACT_APP_GEMINI_API_KEY=your_key_here' > .env.local

# 3. Run dev server
npm start

# 4. Test in browser
# Open http://localhost:3000

# 5. Test microphone
# Click interview screen mic button

# 6. Deploy
npm run build
vercel --prod
```

---

**Ready to build? Start with Task 1.1 from the 72-hour roadmap!**

/**
 * Gemini API Integration for MediKiosk
 * Structures unstructured patient history into clinical SOCRATES format
 * Includes automated offline mock fallback system for demo resilience
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = 'gemini-3.6-flash';

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
 * Generate intelligent offline clinical mock data based on input symptoms
 * @param {string} input - Patient voice transcript or symptom description
 * @returns {Object} Structured clinical JSON
 */
function getOfflineMockHistory(input, socratesData = null) {
  const lower = (input || '').toLowerCase();
  const timestamp = new Date().toISOString();
  let result;

  // Scenario 1: Chest Pain / Cardiac Emergency
  if (lower.includes('chest') || lower.includes('heart') || lower.includes('angina') || lower.includes('cardiac')) {
    result = {
      patient_demographics: {
        status: "Verified via ABHA (Offline Mock)",
        capture_method: "Voice + Touch (Simulated)",
        timestamp,
      },
      chief_complaint: "Acute retrosternal chest pain radiating to left arm",
      history_of_present_illness: {
        onset: "Sudden onset 45 minutes ago during moderate exertion",
        character: "Crushing, heavy pressure-like retrosternal pain",
        radiation: "Radiates down the medial aspect of the left arm and jaw",
        associated_symptoms: [
          "Severe shortness of breath (dyspnea)",
          "Profuse diaphoresis (cold sweats)",
          "Nausea"
        ],
        duration: "Persistent for 45 minutes without relief",
        severity: "9",
        aggravating_relieving_factors: "Worsens with movement, no relief with rest",
      },
      past_medical_history: {
        conditions: [
          "Primary Hypertension (diagnosed 6 years ago)",
          "Hypercholesterolemia (diagnosed 3 years ago)"
        ],
        surgeries: [
          "No prior cardiac interventions"
        ],
      },
      medications_and_allergies: {
        current_medications: [
          { name: "Amlodipine", dose: "5mg OD", indication: "Hypertension control" },
          { name: "Atorvastatin", dose: "20mg HS", indication: "Dyslipidemia" }
        ],
        allergies: "NKDA (No Known Drug Allergies)",
      },
      extracted_lab_values: [
        { test_name: "Blood Pressure", value: "165/100", unit: "mmHg", status: "Abnormal" },
        { test_name: "Heart Rate", value: "108", unit: "bpm", status: "Abnormal" },
        { test_name: "SpO2", value: "94", unit: "%", status: "Abnormal" }
      ],
      red_flags_detected: [
        "Acute crushing chest pain with radiation to left arm and jaw",
        "Shortness of breath with profuse sweating (diaphoresis)",
        "High cardiovascular risk profile requiring immediate ECG & Troponin triage"
      ],
      triage_priority: "Emergency",
      confidence_score: 0.98,
    };
  } else if (lower.includes('fever') || lower.includes('cough') || lower.includes('throat') || lower.includes('chills')) {
    // Scenario 2: Fever / Respiratory / Infection
    result = {
      patient_demographics: {
        status: "Verified via ABHA (Offline Mock)",
        capture_method: "Voice + Touch (Simulated)",
        timestamp,
      },
      chief_complaint: "High grade fever with productive cough for 3 days",
      history_of_present_illness: {
        onset: "Gradual onset over the past 72 hours, worsening at night",
        character: "High-grade fever with chills and productive yellow sputum cough",
        radiation: "Localized to upper chest and throat region",
        associated_symptoms: [
          "Generalized body ache and fatigue",
          "Mild throat irritation",
          "Reduced appetite"
        ],
        duration: "3 days continuously",
        severity: "6",
        aggravating_relieving_factors: "Worsens with cold exposure; temporary relief with antipyretics",
      },
      past_medical_history: {
        conditions: [
          "Type 2 Diabetes Mellitus (controlled on oral hypoglycemics)"
        ],
        surgeries: [
          "Appendectomy (2018)"
        ],
      },
      medications_and_allergies: {
        current_medications: [
          { name: "Metformin", dose: "500mg BD", indication: "Glycemic control" },
          { name: "Paracetamol", dose: "650mg SOS", indication: "Fever relief" }
        ],
        allergies: "Penicillin (Moderate rash reported)",
      },
      extracted_lab_values: [
        { test_name: "Body Temperature", value: "102.4", unit: "°F", status: "Abnormal" },
        { test_name: "Fasting Blood Glucose", value: "142", unit: "mg/dL", status: "Abnormal" },
        { test_name: "SpO2", value: "97", unit: "%", status: "Normal" }
      ],
      red_flags_detected: [
        "Persistent high-grade fever in diabetic patient requiring CBC and chest auscultation"
      ],
      triage_priority: "Urgent",
      confidence_score: 0.94,
    };
  } else {
    // Scenario 3: Headache / Migraine / Standard default
    result = {
      patient_demographics: {
        status: "Verified via ABHA (Offline Mock)",
        capture_method: "Voice + Touch (Simulated)",
        timestamp,
      },
      chief_complaint: "Severe throbbing bilateral headache for 3 days",
      history_of_present_illness: {
        onset: "Gradual onset 3 days ago, progressive worsening",
        character: "Throbbing, pulsating bilateral temporal pain",
        radiation: "Radiates from temples to occipital and neck region",
        associated_symptoms: [
          "Nausea without active vomiting",
          "Photophobia (sensitivity to bright light)",
          "Absence of high fever"
        ],
        duration: "Continuous for 3 days with minimal respite",
        severity: "8",
        aggravating_relieving_factors: "Aggravated by bright light and movement; relieved in dark quiet room",
      },
      past_medical_history: {
        conditions: [
          "Essential Hypertension (diagnosed 5 years ago)"
        ],
        surgeries: [
          "No prior surgical history"
        ],
      },
      medications_and_allergies: {
        current_medications: [
          { name: "Amlodipine", dose: "5mg OD", indication: "Blood pressure management" }
        ],
        allergies: "NKDA (No Known Drug Allergies)",
      },
      extracted_lab_values: [
        { test_name: "Blood Pressure", value: "150/90", unit: "mmHg", status: "Abnormal" },
        { test_name: "Hemoglobin", value: "13.4", unit: "g/dL", status: "Normal" },
        { test_name: "TSH", value: "2.4", unit: "mIU/L", status: "Normal" }
      ],
      red_flags_detected: [
        "Severe persistent headache with photophobia and elevated BP (150/90 mmHg)"
      ],
      triage_priority: "Urgent",
      confidence_score: 0.92,
    };
  }

  // If patient provided direct interactive SOCRATES responses, apply them seamlessly
  if (socratesData) {
    if (socratesData.severity !== undefined && socratesData.severity !== null) {
      result.history_of_present_illness.severity = String(socratesData.severity);
      if (Number(socratesData.severity) >= 9 && result.triage_priority !== 'Emergency') {
        result.triage_priority = 'Emergency';
        result.red_flags_detected.push(`High pain severity rating (${socratesData.severity}/10) requiring prompt triage`);
      }
    }
    if (socratesData.onset) result.history_of_present_illness.onset = socratesData.onset;
    if (socratesData.character) result.history_of_present_illness.character = socratesData.character;
    if (socratesData.radiation) result.history_of_present_illness.radiation = socratesData.radiation;
    if (socratesData.duration) result.history_of_present_illness.duration = socratesData.duration;
    if (socratesData.associated && socratesData.associated.length > 0) {
      result.history_of_present_illness.associated_symptoms = [
        ...new Set([...result.history_of_present_illness.associated_symptoms, ...socratesData.associated])
      ];
    }
    if (socratesData.aggravatingRelieving) {
      result.history_of_present_illness.aggravating_relieving_factors = socratesData.aggravatingRelieving;
    }
  }

  return result;
}

/**
 * Generate intelligent offline clinical entity mock data for OCR
 * @param {string} ocrText - Raw OCR text
 * @returns {Object} Extracted clinical entities
 */
function getOfflineMockEntities(ocrText) {
  const lower = (ocrText || '').toLowerCase();

  // If OCR text mentions diabetes or glucose
  if (lower.includes('diabetes') || lower.includes('glucose') || lower.includes('sugar') || lower.includes('metformin')) {
    return {
      diagnoses: [
        "Type 2 Diabetes Mellitus",
        "Essential Hypertension"
      ],
      medications: [
        { name: "Metformin Hydrochloride", dose: "500mg", frequency: "Twice daily after meals" },
        { name: "Amlodipine Besylate", dose: "5mg", frequency: "Once daily in morning" },
        { name: "Atorvastatin Calcium", dose: "10mg", frequency: "Once daily at bedtime" }
      ],
      lab_results: [
        { test: "Fasting Blood Sugar (FBS)", value: "156 mg/dL", reference_range: "70-100 mg/dL", status: "Abnormal" },
        { test: "HbA1c (Glycated Hemoglobin)", value: "8.2%", reference_range: "< 5.7%", status: "Abnormal" },
        { test: "Blood Pressure", value: "148/92 mmHg", reference_range: "< 120/80 mmHg", status: "Abnormal" }
      ],
      document_type: "Hospital OPD Prescription & Diagnostic Report",
      document_date: "15 Jan 2026"
    };
  }

  // Default standard prescription OCR mock
  return {
    diagnoses: [
      "Essential Hypertension (Grade 1)",
      "Mild Tension-Type Cephalea"
    ],
    medications: [
      { name: "Amlodipine", dose: "5mg", frequency: "1 tablet OD (Morning)" },
      { name: "Paracetamol", dose: "650mg", frequency: "SOS (Pain/Fever)" }
    ],
    lab_results: [
      { test: "Blood Pressure (Sitting)", value: "150/90 mmHg", reference_range: "120/80 mmHg", status: "Abnormal" },
      { test: "Hemoglobin (Hb)", value: "13.2 g/dL", reference_range: "12.0 - 15.5 g/dL", status: "Normal" },
      { test: "Serum TSH", value: "2.3 mIU/L", reference_range: "0.4 - 4.5 mIU/L", status: "Normal" }
    ],
    document_type: "Prescription Slip & Vitals Chart",
    document_date: "2026-02-10"
  };
}

/**
 * Structure raw patient transcript into clinical JSON via Gemini or Offline Fallback
 * @param {string} transcription - Raw voice transcript or symptom string
 * @param {string} ocrText - Extracted text from uploaded documents (optional)
 * @param {Object} socratesData - Direct patient SOCRATES probing responses (optional)
 * @returns {Promise<Object>} Structured clinical history
 */
export async function structureHistory(transcription, ocrText = '', socratesData = null) {
  if (!transcription || transcription.trim().length === 0) {
    throw new Error('Patient input cannot be empty');
  }

  // If no API key configured, use instant intelligent mock fallback
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '' || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.info('[Gemini API] No valid VITE_GEMINI_API_KEY found. Utilizing offline clinical mock fallback.');
    // Simulated realistic delay for authentic UX
    await new Promise((resolve) => setTimeout(resolve, 800));
    return getOfflineMockHistory(transcription, socratesData);
  }

  let socratesSection = '';
  if (socratesData) {
    socratesSection = `
Direct Patient Interactive SOCRATES Probing Responses:
- Pain / Severity Rating: ${socratesData.severity !== undefined ? `${socratesData.severity}/10` : 'Not specified'}
- Reported Onset: ${socratesData.onset || 'Not specified'}
- Symptom Character: ${socratesData.character || 'Not specified'}
- Radiation / Spread: ${socratesData.radiation || 'Not specified'}
- Duration: ${socratesData.duration || 'Not specified'}
- Associated Symptoms: ${socratesData.associated?.length ? socratesData.associated.join(', ') : 'None'}
- Aggravating / Relieving Factors: ${socratesData.aggravatingRelieving || 'Not specified'}
`;
  }

  const prompt = `${CLINICAL_SYSTEM_PROMPT}

Raw Patient Voice Transcript:
"${transcription.trim()}"

${socratesSection}
${ocrText ? `Extracted OCR Text from Prior Reports:\n"${ocrText}"` : 'No prior documents provided'}

Please structure this into the following JSON schema. Respond ONLY with valid JSON, no markdown, no other text:
{
  "patient_demographics": {
    "status": "Verified via ABHA (Mock)",
    "capture_method": "Voice + Touch",
    "timestamp": "${new Date().toISOString()}"
  },
  "chief_complaint": "Main reason for visit in 5-10 words",
  "history_of_present_illness": {
    "onset": "When and how did it start",
    "character": "Describe the symptom",
    "radiation": "Does it spread or radiate anywhere",
    "associated_symptoms": ["symptom1", "symptom2"],
    "duration": "How long has it been going on",
    "severity": "0-10 scale if mentioned, or Not specified",
    "aggravating_relieving_factors": "What makes it worse or better"
  },
  "past_medical_history": {
    "conditions": ["Condition1"],
    "surgeries": ["Surgery1"]
  },
  "medications_and_allergies": {
    "current_medications": [
      { "name": "Medicine name", "dose": "Dose if mentioned", "indication": "Why taking" }
    ],
    "allergies": "NKDA or specific allergies"
  },
  "extracted_lab_values": [
    { "test_name": "Test", "value": "Value", "unit": "Unit", "status": "Normal or Abnormal" }
  ],
  "red_flags_detected": ["flag1"],
  "triage_priority": "Routine | Urgent | Emergency",
  "confidence_score": 0.95
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn(`[Gemini API] Request failed (${response.status}): ${err.error?.message || response.statusText}. Falling back to offline clinical mock.`);
      return getOfflineMockHistory(transcription);
    }

    const data = await response.json();
    if (!data.candidates?.[0]) {
      console.warn('[Gemini API] Unexpected response structure. Falling back to offline clinical mock.');
      return getOfflineMockHistory(transcription, socratesData);
    }

    const responseText = data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('[Gemini API] No valid JSON block parsed. Falling back to offline clinical mock.');
      return getOfflineMockHistory(transcription, socratesData);
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.warn('[Gemini API] Network or execution error:', error.message, 'Falling back to offline clinical mock.');
    return getOfflineMockHistory(transcription);
  }
}

/**
 * Extract clinical entities from OCR text via Gemini or Offline Fallback
 * @param {string} ocrText - Raw text extracted from medical document
 * @returns {Promise<Object>} Diagnoses, medications, lab results
 */
export async function extractClinicalEntities(ocrText) {
  if (!ocrText || ocrText.trim().length === 0) {
    throw new Error('OCR text cannot be empty');
  }

  // If no API key configured, use instant intelligent mock fallback
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '' || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.info('[Gemini API] No valid VITE_GEMINI_API_KEY. Utilizing offline OCR entity extraction mock.');
    await new Promise((resolve) => setTimeout(resolve, 600));
    return getOfflineMockEntities(ocrText);
  }

  const prompt = `Extract clinical entities from this medical document text:
"${ocrText}"

Return ONLY valid JSON, no markdown:
{
  "diagnoses": ["diagnosis1"],
  "medications": [
    { "name": "Medicine", "dose": "Dose", "frequency": "Times per day" }
  ],
  "lab_results": [
    { "test": "Test name", "value": "Value", "reference_range": "Normal range", "status": "Normal or Abnormal" }
  ],
  "document_type": "Prescription or Lab Report or Discharge Summary",
  "document_date": "Date if mentioned"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1000 },
        }),
      }
    );

    if (!response.ok) {
      console.warn('[Gemini API] OCR entity request failed. Falling back to offline entity mock.');
      return getOfflineMockEntities(ocrText);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return getOfflineMockEntities(ocrText);
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.warn('[Gemini API] Error extracting entities via API. Falling back to offline entity mock:', error.message);
    return getOfflineMockEntities(ocrText);
  }
}

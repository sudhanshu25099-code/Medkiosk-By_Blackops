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
  // Return an empty extraction baseline to prevent hallucinating lab values, 
  // medications, or diagnoses that aren't actually in the document.
  return {
    diagnoses: [],
    medications: [],
    lab_results: [],
    clinical_notes: null,
    document_type: null,
    document_date: null
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

  const prompt = `You are an expert medical information extraction assistant for an Indian hospital OPD system.
Extract ALL clinical entities from the following medical document text with maximum accuracy.

Document Text:
"""${ocrText}"""

Extraction Rules:
1. Extract every diagnosis, condition, and clinical finding mentioned
2. For medications: capture full name, dose, frequency, route (oral/IV/etc.), and duration if stated
3. For lab results: include test name, value, unit, reference range, and flag as Normal/Abnormal
4. Capture vital signs as lab results (BP, HR, SpO2, Temperature, Weight, BMI)
5. Identify the document type accurately (Prescription, Lab Report, Discharge Summary, Radiology Report, OPD Visit Note)
6. Extract the document date or visit date if present
7. Include any doctor's notes, follow-up instructions, or special advice in "clinical_notes"
8. If data is missing or unclear, use null — do NOT hallucinate values

Return ONLY valid JSON with no markdown or extra text:
{
  "diagnoses": ["Full diagnosis name with ICD context if mentioned"],
  "medications": [
    { "name": "Medicine name", "dose": "Dose with unit", "frequency": "e.g. Once daily (OD)", "route": "Oral/IV/Topical", "duration": "e.g. 5 days" }
  ],
  "lab_results": [
    { "test": "Test name", "value": "Result value", "unit": "Unit", "reference_range": "Normal range", "status": "Normal or Abnormal" }
  ],
  "clinical_notes": "Any doctor instructions, follow-up dates, lifestyle advice, or special notes",
  "document_type": "Prescription | Lab Report | Discharge Summary | Radiology Report | OPD Note",
  "document_date": "Detected date or null"
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

// ─────────────────────────────────────────────────────────────────────────────
// AYUSH DASHAWIDHA PARIKSHA MODE
// ─────────────────────────────────────────────────────────────────────────────

const AYUSH_SYSTEM_PROMPT = `You are an expert Ayurvedic clinical historian operating in an AYUSH OPD in India.
Your task is to take the patient's spoken complaint and their Dashawidha Pariksha responses, 
and structure them into a comprehensive Ayurvedic clinical record.

Follow these rules:
1. Use the Dashawidha Pariksha (10-Factor Ayurvedic Assessment) framework
2. Identify Prakriti (constitutional type: Vata/Pitta/Kapha or combination)
3. Identify Vikriti (current imbalance/disease pattern)
4. Assess Agni (digestive fire: Sama/Vishama/Tikshna/Manda)
5. Assess Koshtha (bowel nature: Krura/Mridu/Madhyama)
6. If a factor is not mentioned, output "Not specified"
7. Provide a gentle, holistic triage priority (Routine/Urgent/Emergency)
8. Always output valid JSON only`;

/**
 * Generate offline mock AYUSH Dashawidha assessment based on prakriti
 * @param {string} transcript - Patient voice transcript
 * @param {Object} dashawidha - Dashawidha Pariksha form responses
 * @returns {Object} Structured AYUSH clinical JSON
 */
function getOfflineMockAyush(transcript, dashawidha = {}) {
  const lower = (transcript || '').toLowerCase();
  const prakriti = (dashawidha.prakriti || '').toLowerCase();
  const timestamp = new Date().toISOString();

  // Pitta-dominant scenario (Heat, inflammation, anger, burning symptoms)
  if (
    prakriti.includes('pitta') ||
    lower.includes('burning') || lower.includes('acid') ||
    lower.includes('anger') || lower.includes('inflammation') || lower.includes('fever')
  ) {
    return {
      chief_complaint: 'Burning gastric discomfort with irritability and heat sensitivity',
      ayush_assessment: {
        prakriti: dashawidha.prakriti || 'Pitta-Kapha Dominant',
        vikriti: 'Elevated Pitta — Hyperacidity, Pittaja Jvara (Inflammatory fever pattern)',
        agni: dashawidha.agni || 'Tikshna Agni (Sharp, hyperactive digestive fire)',
        koshtha: dashawidha.koshtha || 'Mridu Koshtha (Soft, loose bowel tendency)',
        bala: dashawidha.bala || 'Moderate — Madhyama Bala',
        sara: dashawidha.sara || 'Mamsa Sara (Muscular constitution)',
        samhanana: dashawidha.samhanana || 'Compact, medium frame (Madhyama Samhanana)',
        satmya: dashawidha.satmya || 'Partial tolerance — Pitta-aggravating foods contraindicated',
        sattva: dashawidha.sattva || 'Madhyama Sattva — moderate mental resilience',
        vaya: dashawidha.vaya || 'Madhya Vaya (Middle age — 35-55 years)',
        nidana: [
          'Excessive intake of spicy, sour, and fermented foods',
          'Irregular meal timing',
          'Exposure to excessive heat and direct sunlight',
          'Suppressed anger and emotional stress',
        ],
        samprapti: 'Pitta aggravation → Hyperacidity → Amlapitta (Gastritis) pathway. Pitta vitiation affecting Pakwashaya (colon) and Amashaya (stomach).',
        chikitsa_sutra: [
          'Pitta Shamaka diet: sweet, bitter, astringent tastes',
          'Avoid spicy, sour, fermented, and processed foods',
          'Recommended: Amalaki Churna, Shatavari, Yashtimadhu (Licorice)',
          'Avoid Virechana until inflammatory phase subsides',
          'Sheetali Pranayama and cooling lifestyle modifications',
        ],
        triage_priority: 'Routine',
        confidence_score: 0.91,
        timestamp,
      },
      history_of_present_illness: {
        onset: 'Gradual onset over the past 2 weeks, worsening with diet irregularity',
        character: 'Burning retrosternal and epigastric discomfort with acid regurgitation',
        radiation: 'Localized to epigastric region with occasional referred throat burning',
        associated_symptoms: ['Acid belching', 'Irritability', 'Low-grade fever', 'Loss of appetite'],
        duration: '2 weeks progressively worsening',
        severity: '5',
        aggravating_relieving_factors: 'Worsened by spicy food, alcohol, stress; relieved by cool water and rest',
      },
      past_medical_history: { conditions: ['Recurrent Hyperacidity (Amlapitta)'], surgeries: [] },
      medications_and_allergies: {
        current_medications: [{ name: 'Avipattikar Churna', dose: '5g BD', indication: 'Hyperacidity control' }],
        allergies: 'NKDA',
      },
      extracted_lab_values: [],
      red_flags_detected: ['Monitor for Pittaja Prameha (diabetic tendency) given chronic dietary pattern'],
      triage_priority: 'Routine',
      confidence_score: 0.91,
    };
  }

  // Kapha-dominant scenario (Lethargy, congestion, heaviness, weight gain)
  if (
    prakriti.includes('kapha') ||
    lower.includes('lethargy') || lower.includes('weight') ||
    lower.includes('congestion') || lower.includes('cough') || lower.includes('heavy')
  ) {
    return {
      chief_complaint: 'Heaviness, lethargy, and chronic nasal congestion with low appetite',
      ayush_assessment: {
        prakriti: dashawidha.prakriti || 'Kapha Dominant',
        vikriti: 'Kapha Vata aggravation — Shlaishmika Pratishyaya (Allergic Rhinitis), Sthaulya (Obesity tendency)',
        agni: dashawidha.agni || 'Manda Agni (Slow, weak digestive fire)',
        koshtha: dashawidha.koshtha || 'Krura Koshtha (Constipated, hard bowel tendency)',
        bala: dashawidha.bala || 'Madhyama Bala with Kapha excess',
        sara: dashawidha.sara || 'Meda Sara (Fatty constitution)',
        samhanana: dashawidha.samhanana || 'Heavy, compact, broad frame (Sthula Samhanana)',
        satmya: dashawidha.satmya || 'Tolerates cold and damp environments poorly',
        sattva: dashawidha.sattva || 'Avara Sattva — prone to emotional lethargy',
        vaya: dashawidha.vaya || 'Madhya Vaya (30-50 years)',
        nidana: [
          'Excessive daytime sleep (Divasvapna)',
          'Sedentary lifestyle with minimal physical activity',
          'Heavy, oily, cold, and sweet food excess',
          'Exposure to cold and damp weather',
        ],
        samprapti: 'Kapha aggravation → Srotovarodha (channel blockage) → Meda Dhatu vitiation → Sthaulya and Pratishyaya.',
        chikitsa_sutra: [
          'Kapha Shamaka: pungent, bitter, astringent tastes recommended',
          'Avoid cold, heavy, sweet, and oily foods',
          'Recommended: Trikatu Churna, Guggulu, Punarnava',
          'Udvartana (dry powder massage) to stimulate metabolism',
          'Kapalbhati Pranayama and vigorous morning exercise',
        ],
        triage_priority: 'Routine',
        confidence_score: 0.88,
        timestamp,
      },
      history_of_present_illness: {
        onset: 'Gradual onset over the past 1-2 months with progressive worsening',
        character: 'Persistent heaviness, lethargy, nasal congestion with sticky mucus discharge',
        radiation: 'Diffuse body heaviness, particularly lower limbs',
        associated_symptoms: ['Low appetite', 'Excess sleep', 'Mild weight gain', 'Morning congestion'],
        duration: '1-2 months progressively worsening',
        severity: '4',
        aggravating_relieving_factors: 'Worsened by cold and damp weather; improved with warmth and activity',
      },
      past_medical_history: { conditions: ['Obesity tendency', 'Seasonal allergic rhinitis'], surgeries: [] },
      medications_and_allergies: {
        current_medications: [{ name: 'Sitopaladi Churna', dose: '3g TDS', indication: 'Respiratory mucus clearance' }],
        allergies: 'NKDA',
      },
      extracted_lab_values: [],
      red_flags_detected: [],
      triage_priority: 'Routine',
      confidence_score: 0.88,
    };
  }

  // Default: Vata-dominant scenario (Pain, anxiety, dryness, irregular symptoms)
  return {
    chief_complaint: 'Variable joint pain, anxiety, dry skin and irregular digestion — Vata imbalance',
    ayush_assessment: {
      prakriti: dashawidha.prakriti || 'Vata Dominant',
      vikriti: 'Vata aggravation — Vataja Sandhishoola (Joint pain), Chittodvega (Anxiety)',
      agni: dashawidha.agni || 'Vishama Agni (Irregular, variable digestive fire)',
      koshtha: dashawidha.koshtha || 'Krura Koshtha (Dry, constipated tendency)',
      bala: dashawidha.bala || 'Avara-Madhyama Bala — low to moderate strength',
      sara: dashawidha.sara || 'Asthi Sara (Bone constitution dominant)',
      samhanana: dashawidha.samhanana || 'Lean, thin frame (Hina Samhanana)',
      satmya: dashawidha.satmya || 'Warm, unctuous (Snigdha) foods well-tolerated',
      sattva: dashawidha.sattva || 'Madhyama Sattva — moderate anxiety tendency',
      vaya: dashawidha.vaya || 'Jara Vaya (60+ years) or Vata-aggravated youth',
      nidana: [
        'Excessive physical and mental exertion (Ativyayama)',
        'Dry, cold, light, and rough food intake',
        'Irregular sleep patterns and late nights',
        'Suppressed natural urges (Vegadharana)',
        'Excessive stress and worry',
      ],
      samprapti: 'Vata aggravation → Vata Prakopa → Sandhishoola and Dhatukshaya (tissue depletion). Pranic imbalance affecting Shleshaka Kapha in joints.',
      chikitsa_sutra: [
        'Vata Shamaka: sweet, sour, salty tastes and warm unctuous foods',
        'Abhyanga (oil massage) with Mahanarayana or Bala Taila',
        'Recommended: Ashwagandha, Bala, Shatavari for Rasayana therapy',
        'Basti (medicated enema) — prime treatment for Vata disorders',
        'Nadi Shodhana Pranayama and gentle yoga (Yin yoga)',
      ],
      triage_priority: 'Routine',
      confidence_score: 0.89,
      timestamp,
    },
    history_of_present_illness: {
      onset: 'Variable and intermittent onset over several months',
      character: 'Migratory joint pain with crackling sounds, anxiety, and insomnia',
      radiation: 'Migratory — shifting between knees, lower back, and fingers',
      associated_symptoms: ['Dry skin', 'Constipation', 'Insomnia', 'Anxiety'],
      duration: 'Several months, waxing and waning',
      severity: '5',
      aggravating_relieving_factors: 'Worsened by cold, dry weather and stress; relieved by warmth and rest',
    },
    past_medical_history: { conditions: ['Vataja Sandhivata (Osteoarthritis tendency)'], surgeries: [] },
    medications_and_allergies: {
      current_medications: [{ name: 'Ashwagandha Churna', dose: '5g OD with warm milk', indication: 'Vata Shamaka Rasayana' }],
      allergies: 'NKDA',
    },
    extracted_lab_values: [],
    red_flags_detected: [],
    triage_priority: 'Routine',
    confidence_score: 0.89,
  };
}

/**
 * Structure AYUSH patient history using Dashawidha Pariksha via Gemini or offline mock
 * @param {string} transcription - Raw voice transcript
 * @param {Object} dashawidhaData - Dashawidha Pariksha form responses from InterviewScreen
 * @returns {Promise<Object>} Structured AYUSH clinical history
 */
export async function structureAyushHistory(transcription, dashawidhaData = {}) {
  if (!transcription || transcription.trim().length === 0) {
    throw new Error('Patient input cannot be empty');
  }

  // Offline fallback if no API key
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '' || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.info('[Gemini AYUSH] No valid API key. Using offline Dashawidha mock.');
    await new Promise((resolve) => setTimeout(resolve, 900));
    return getOfflineMockAyush(transcription, dashawidhaData);
  }

  const dashawidhaContext = Object.entries(dashawidhaData)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
    .join('\n');

  const prompt = `${AYUSH_SYSTEM_PROMPT}

Patient's Spoken Complaint:
"${transcription.trim()}"

Dashawidha Pariksha Responses (10-Factor Ayurvedic Assessment):
${dashawidhaContext || 'Not provided by patient'}

Structure this into the following JSON schema. Respond ONLY with valid JSON, no markdown:
{
  "chief_complaint": "Main Ayurvedic complaint in clinical terms",
  "ayush_assessment": {
    "prakriti": "Body constitution (Vata/Pitta/Kapha dominant or combination)",
    "vikriti": "Current imbalance / disease pattern in Ayurvedic terms",
    "agni": "Digestive fire assessment (Sama/Vishama/Tikshna/Manda Agni)",
    "koshtha": "Bowel nature (Krura/Mridu/Madhyama Koshtha)",
    "bala": "Physical strength assessment",
    "sara": "Tissue quality / constitution",
    "samhanana": "Body frame and compactness",
    "satmya": "Tolerance / adaptability",
    "sattva": "Mental strength and emotional constitution",
    "vaya": "Age and life-stage assessment",
    "nidana": ["causative factor 1", "causative factor 2"],
    "samprapti": "Pathogenesis / disease progression in Ayurvedic terms",
    "chikitsa_sutra": ["treatment principle 1", "treatment principle 2"],
    "triage_priority": "Routine | Urgent | Emergency",
    "confidence_score": 0.90
  },
  "history_of_present_illness": {
    "onset": "When and how it started",
    "character": "Nature of symptom",
    "radiation": "Spread pattern",
    "associated_symptoms": ["symptom1"],
    "duration": "Duration",
    "severity": "0-10 or Not specified",
    "aggravating_relieving_factors": "What worsens or relieves"
  },
  "past_medical_history": { "conditions": [], "surgeries": [] },
  "medications_and_allergies": {
    "current_medications": [{ "name": "", "dose": "", "indication": "" }],
    "allergies": "NKDA"
  },
  "extracted_lab_values": [],
  "red_flags_detected": [],
  "triage_priority": "Routine | Urgent | Emergency",
  "confidence_score": 0.90
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, topK: 40, topP: 0.95, maxOutputTokens: 2500 },
        }),
      }
    );

    if (!response.ok) {
      console.warn(`[Gemini AYUSH] Request failed (${response.status}). Falling back to offline mock.`);
      return getOfflineMockAyush(transcription, dashawidhaData);
    }

    const data = await response.json();
    if (!data.candidates?.[0]) {
      return getOfflineMockAyush(transcription, dashawidhaData);
    }

    const responseText = data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return getOfflineMockAyush(transcription, dashawidhaData);
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.warn('[Gemini AYUSH] Network error. Falling back to offline mock:', error.message);
    return getOfflineMockAyush(transcription, dashawidhaData);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLINICAL DOCUMENT SUMMARIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate offline document summary fallback from extracted entities
 * @param {Object} entities - Output from extractClinicalEntities
 * @param {string} rawOcrText - Raw OCR text
 * @returns {string} Formatted summary paragraph
 */
function getOfflineSummary(entities, rawOcrText) {
  const parts = [];

  if (entities?.document_type) {
    parts.push(`This is a ${entities.document_type}${entities.document_date ? ` dated ${entities.document_date}` : ''}.`);
  } else {
    parts.push('This medical document has been analysed.');
  }

  if (entities?.diagnoses?.length > 0) {
    parts.push(`Diagnoses recorded: ${entities.diagnoses.join(', ')}.`);
  }

  if (entities?.medications?.length > 0) {
    const medList = entities.medications
      .map((m) => `${m.name}${m.dose ? ` ${m.dose}` : ''}${m.frequency ? ` (${m.frequency})` : ''}`)
      .join(', ');
    parts.push(`Current medications: ${medList}.`);
  }

  const abnormal = (entities?.lab_results || []).filter(
    (l) => l.status?.toLowerCase() === 'abnormal'
  );
  const normal = (entities?.lab_results || []).filter(
    (l) => l.status?.toLowerCase() !== 'abnormal'
  );

  if (abnormal.length > 0) {
    const flags = abnormal.map((l) => `${l.test}: ${l.value}${l.unit ? ` ${l.unit}` : ''}`).join(', ');
    parts.push(`⚠ Abnormal findings require clinical attention: ${flags}.`);
  }
  if (normal.length > 0) {
    parts.push(`Normal results: ${normal.map((l) => l.test).join(', ')}.`);
  }

  if (entities?.clinical_notes) {
    parts.push(`Clinical notes: ${entities.clinical_notes}`);
  }

  if (parts.length === 0 && rawOcrText) {
    return `Document analysed. Extracted text: "${rawOcrText.substring(0, 200)}${rawOcrText.length > 200 ? '…' : ''}"`;
  }

  return parts.join(' ');
}

/**
 * Summarize an extracted medical document into a concise clinical paragraph.
 * Uses Gemini API when available; falls back to structured offline summary.
 *
 * @param {Object} entities   - Structured entities from extractClinicalEntities
 * @param {string} rawOcrText - Original OCR text for context
 * @param {string} [mode]     - 'allopathy' | 'ayush' — affects summary framing
 * @returns {Promise<string>} Clinical summary paragraph
 */
export async function summarizeClinicalDocument(entities, rawOcrText = '', mode = 'allopathy') {
  // Offline fallback — no API key
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '' || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.info('[Gemini Summary] No API key — using structured offline summary.');
    await new Promise((r) => setTimeout(r, 400));
    return getOfflineSummary(entities, rawOcrText);
  }

  const entitiesJson = JSON.stringify(entities, null, 2);
  const isAyush = mode === 'ayush';

  const prompt = isAyush
    ? `You are an Ayurvedic clinical assistant summarizing a medical document for a Vaidya (AYUSH physician) in India.
Given the structured extracted data from a patient's medical document, write a concise, holistic clinical summary paragraph (3–5 sentences).
Include any diagnoses, medications, and notable findings. Frame findings in both modern and Ayurvedic context where applicable.
IMPORTANT: Do NOT hallucinate or mention any diagnoses, lab values, or medications that are not explicitly present in the data.
Do not add any headings, bullet points, or JSON — plain paragraph text only.

Extracted Data:
${entitiesJson}

Raw Document Text (for context):
"${rawOcrText?.substring(0, 800) || 'Not available'}"

Write the Ayurvedic clinical summary now:`
    : `You are a clinical documentation assistant summarizing a medical document for an attending physician in an Indian hospital OPD.
Given the structured extracted data from a patient's prior medical document, write a concise, professional clinical summary paragraph (3–5 sentences).
Highlight key diagnoses, active medications with doses, abnormal lab findings, and any follow-up instructions.
IMPORTANT: Do NOT hallucinate or mention any diagnoses, lab values, or medications that are not explicitly present in the data.
Use standard medical terminology. Do not add headings, bullet points, or JSON — plain paragraph only.

Extracted Structured Data:
${entitiesJson}

Raw Document Text (for additional context):
"${rawOcrText?.substring(0, 800) || 'Not available'}"

Write the clinical summary now:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn(`[Gemini Summary] Request failed (${response.status}). Using offline summary.`);
      return getOfflineSummary(entities, rawOcrText);
    }

    const data = await response.json();
    const summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!summaryText) {
      return getOfflineSummary(entities, rawOcrText);
    }

    console.info('[Gemini Summary] Summary generated successfully.');
    return summaryText;
  } catch (error) {
    console.warn('[Gemini Summary] Network error. Using offline summary:', error.message);
    return getOfflineSummary(entities, rawOcrText);
  }
}

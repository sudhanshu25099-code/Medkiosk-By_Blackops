/**
 * Gemini API Integration for MediKiosk
 * Structures unstructured patient history into clinical SOCRATES format
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = 'gemini-1.5-flash';

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
 * Structure raw patient transcript into clinical JSON via Gemini
 * @param {string} transcription - Raw voice transcript or symptom string
 * @param {string} ocrText - Extracted text from uploaded documents (optional)
 * @returns {Promise<Object>} Structured clinical history
 */
export async function structureHistory(transcription, ocrText = '') {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env.local');
  }
  if (!transcription || transcription.trim().length === 0) {
    throw new Error('Patient input cannot be empty');
  }

  const prompt = `${CLINICAL_SYSTEM_PROMPT}

Raw Patient Voice Transcript:
"${transcription.trim()}"

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
  "triage_priority": "Routine",
  "confidence_score": 0.9
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
      const err = await response.json();
      throw new Error(`Gemini API error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.candidates?.[0]) {
      throw new Error('Unexpected response format from Gemini');
    }

    const responseText = data.candidates[0].content.parts[0].text;

    // Strip markdown code fences if present
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('[Gemini] Error:', error);
    throw new Error(`Failed to structure history: ${error.message}`);
  }
}

/**
 * Extract clinical entities from OCR text
 * @param {string} ocrText - Raw text extracted from medical document
 * @returns {Promise<Object>} Diagnoses, medications, lab results
 */
export async function extractClinicalEntities(ocrText) {
  if (!ocrText) throw new Error('OCR text cannot be empty');

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

  const data = await response.json();
  const responseText = data.candidates[0].content.parts[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in Gemini entity response');
  return JSON.parse(jsonMatch[0]);
}

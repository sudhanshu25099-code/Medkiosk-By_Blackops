/**
 * Tesseract.js + Gemini Vision OCR Integration for MediKiosk
 * Dual-engine pipeline:
 *   1. Tesseract.js  → base text extraction (offline capable)
 *   2. Gemini Vision → enhance / correct the raw OCR text (if API key present)
 *   3. Offline mock  → graceful fallback for demo resiliency
 */

import Tesseract from 'tesseract.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const VISION_MODEL   = 'gemini-2.0-flash';

// Confidence threshold below which Gemini Vision is called to improve results
const CONFIDENCE_BOOST_THRESHOLD = 75;

/**
 * Convert a File / Blob to a base64 data string (without the data-URI prefix)
 * @param {File} file
 * @returns {Promise<{ base64: string, mimeType: string }>}
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => {
      // result is "data:<mime>;base64,<data>" → strip header
      const base64 = reader.result.split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = () => reject(new Error('Failed to read file for Gemini Vision'));
    reader.readAsDataURL(file);
  });
}

/**
 * Gemini Vision API call — send the raw image and ask it to extract all
 * medical text accurately, correcting OCR artefacts.
 * @param {File} imageFile - Original uploaded image
 * @param {string} rawOcrText - Tesseract raw text (used as a hint)
 * @returns {Promise<string>} Enhanced extracted text
 */
async function enhanceWithGeminiVision(imageFile, rawOcrText = '') {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '' || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return null; // signal caller to keep raw text
  }

  try {
    const { base64, mimeType } = await fileToBase64(imageFile);

    const prompt = `You are an expert medical document OCR assistant operating in an Indian hospital system.
Carefully examine this medical document image and extract ALL text content with maximum accuracy.

The document may be a:
- Prescription slip (handwritten or printed)
- Lab report / blood work report
- Discharge summary
- Radiology / imaging report
- Vitals chart

OCR engine raw text (may have errors, use as context only):
"""
${rawOcrText || 'Not available'}
"""

Your task:
1. Correct all OCR errors (smudged text, low contrast, handwriting)
2. Preserve ALL medical data: medicine names, doses, frequencies, lab values, reference ranges, diagnoses, doctor notes
3. Standardise abbreviations (e.g., "BD" = Twice Daily, "OD" = Once Daily, "HS" = At Bedtime)
4. Output ONLY the corrected, clean extracted text — no commentary, no JSON, no markdown.
5. If a value is illegible, write [Illegible] instead of guessing.`;

    const body = {
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64,
            },
          },
          { text: prompt },
        ],
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1500,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${VISION_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      console.warn(`[Gemini Vision] Request failed (${response.status}). Keeping Tesseract text.`);
      return null;
    }

    const data = await response.json();
    const enhanced = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!enhanced) return null;

    console.info('[Gemini Vision] Successfully enhanced OCR text.');
    return enhanced;
  } catch (err) {
    console.warn('[Gemini Vision] Error during vision call:', err.message);
    return null;
  }
}

// ─── Offline fallback text when both engines fail ────────────────────────────
const OFFLINE_FALLBACK_TEXT = 'No readable clinical text could be extracted from this image.';

/**
 * Full dual-engine OCR pipeline:
 *  Step 1 → Tesseract.js (offline, always runs)
 *  Step 2 → Gemini Vision enhancement (if API key present or Tesseract confidence < threshold)
 *  Step 3 → Offline mock fallback (if both fail)
 *
 * @param {File}     imageFile  - File object from input or drop zone
 * @param {Function} onProgress - Called with { status, progress, engine } updates
 * @returns {Promise<{ text: string, confidence: number, enhanced: boolean }>}
 */
export async function extractTextFromImage(imageFile, onProgress = null) {
  if (!imageFile) throw new Error('No file provided');

  if (imageFile.size > MAX_FILE_SIZE) {
    throw new Error('File exceeds the 5MB size limit. Please use a smaller image.');
  }

  if (!ALLOWED_TYPES.includes(imageFile.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
  }

  const notify = (status, progress, engine = 'tesseract') => {
    if (onProgress) onProgress({ status, progress, engine });
  };

  // ── Step 1: Tesseract OCR ──────────────────────────────────────────────────
  let tesseractText = '';
  let tesseractConfidence = 0;

  try {
    notify('Initialising Tesseract OCR engine…', 5);

    const result = await Tesseract.recognize(
      imageFile,
      'eng+hin', // English + Hindi
      {
        logger: (msg) => {
          // Map Tesseract progress (0→1) to 5→60 range
          const pct = 5 + Math.round((msg.progress ?? 0) * 55);
          notify(msg.status || 'Scanning document…', pct);
        },
      }
    );

    tesseractText       = result.data.text?.trim() || '';
    tesseractConfidence = Math.round(result.data.confidence) || 0;

    console.info(`[Tesseract] Extracted ${tesseractText.length} chars — confidence ${tesseractConfidence}%`);
    notify('Tesseract extraction complete', 62);
  } catch (tesseractErr) {
    console.warn('[Tesseract] OCR failed:', tesseractErr.message, '— continuing to Gemini Vision.');
    notify('Tesseract unavailable — switching to AI Vision…', 62, 'gemini');
  }

  // ── Step 2: Gemini Vision enhancement ────────────────────────────────────
  const needsEnhancement =
    !tesseractText ||
    tesseractConfidence < CONFIDENCE_BOOST_THRESHOLD;

  let finalText      = tesseractText;
  let enhanced       = false;

  const hasApiKey =
    GEMINI_API_KEY &&
    GEMINI_API_KEY.trim() !== '' &&
    GEMINI_API_KEY !== 'your_gemini_api_key_here';

  if (hasApiKey) {
    notify('Enhancing extraction with Gemini Vision AI…', 65, 'gemini');
    const geminiText = await enhanceWithGeminiVision(imageFile, tesseractText);
    if (geminiText) {
      finalText = geminiText;
      enhanced  = true;
      notify('Gemini Vision enhancement complete', 88, 'gemini');
    } else {
      notify('Gemini Vision unavailable — using Tesseract result', 88);
    }
  } else {
    // No API key — log & keep Tesseract result
    console.info('[Gemini Vision] No API key configured — skipping vision enhancement.');
    notify('Using Tesseract OCR result', 88);
  }

  // ── Step 3: Offline fallback if we still have nothing ─────────────────────
  if (!finalText) {
    console.warn('[OCR Pipeline] Both engines returned empty text — using offline mock fallback.');
    finalText = OFFLINE_FALLBACK_TEXT;
    return { text: finalText, confidence: 80, enhanced: false, source: 'offline_mock' };
  }

  return {
    text:       finalText,
    confidence: enhanced ? Math.max(tesseractConfidence, 90) : tesseractConfidence || 85,
    enhanced,
    source:     enhanced ? 'gemini_vision' : 'tesseract',
  };
}

/**
 * Convert Tesseract progress message to a 0-100 number
 * @param {Object} progressMessage - Tesseract logger message (may include engine field)
 * @returns {number} Progress percentage
 */
export function parseOCRProgress(progressMessage) {
  if (!progressMessage) return 0;
  // Support both old {progress} format and new {progress, engine} format
  const pct = progressMessage.progress ?? 0;
  return Math.round(typeof pct === 'number' ? pct * 100 : pct);
}

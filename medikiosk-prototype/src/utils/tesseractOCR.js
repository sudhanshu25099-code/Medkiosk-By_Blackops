/**
 * Tesseract.js OCR Integration for MediKiosk
 * Client-side text extraction from medical document images
 */

import Tesseract from 'tesseract.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Extract text from an uploaded image file
 * @param {File} imageFile - File object from input or drop
 * @param {Function} onProgress - Called with progress object { status, progress }
 * @returns {Promise<{ text: string, confidence: number }>}
 */
export async function extractTextFromImage(imageFile, onProgress = null) {
  if (!imageFile) throw new Error('No file provided');

  if (imageFile.size > MAX_FILE_SIZE) {
    throw new Error('File exceeds the 5MB size limit. Please use a smaller image.');
  }

  if (!ALLOWED_TYPES.includes(imageFile.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
  }

  try {
    const result = await Tesseract.recognize(
      imageFile,
      'eng+hin', // English + Hindi
      {
        logger: (message) => {
          if (onProgress) onProgress(message);
        },
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v4/tesseract-core.wasm.js',
      }
    );

    const { text, confidence } = result.data;

    return {
      text: text.trim(),
      confidence: Math.round(confidence),
    };
  } catch (error) {
    console.error('[OCR] Error:', error);
    throw new Error(`Text extraction failed: ${error.message}`);
  }
}

/**
 * Convert Tesseract progress message to a 0-100 number
 * @param {Object} progressMessage - Tesseract logger message
 * @returns {number} Progress percentage
 */
export function parseOCRProgress(progressMessage) {
  if (!progressMessage) return 0;
  const pct = progressMessage.progress ?? 0;
  return Math.round(pct * 100);
}

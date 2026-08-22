/**
 * Web Speech API Integration for MediKiosk
 * Real-time voice capture with interim + final transcript updates
 */

/**
 * Initialize speech recognition instance
 * @param {Function} onTranscript - Called with current transcript string (interim + final)
 * @param {Function} onError - Called with error message string
 * @param {Function} onStart - Called when recognition starts
 * @param {Function} onEnd - Called with final transcript when recognition ends
 * @returns {Object|null} Control object { start, stop, abort, setLanguage } or null
 */
export function initiateSpeechRecognition(onTranscript, onError, onStart, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError(
      'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
    );
    return null;
  }

  try {
    const recognition = new SpeechRecognition();

    recognition.continuous = false;     // Stop after user pauses
    recognition.interimResults = true;  // Stream words as they're spoken
    recognition.language = 'en-IN';     // Default: Indian English

    let finalTranscript = '';

    recognition.onstart = () => {
      if (onStart) onStart();
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const segment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += segment + ' ';
        } else {
          interimTranscript += segment;
        }
      }

      onTranscript((finalTranscript + interimTranscript).trim());
    };

    recognition.onend = () => {
      if (onEnd) onEnd(finalTranscript.trim());
    };

    recognition.onerror = (event) => {
      const errorMessages = {
        'no-speech': 'No speech detected. Please try again.',
        'network': 'Network error. Check your internet connection.',
        'not-allowed': 'Microphone access denied. Please allow microphone permission in your browser.',
        'service-not-allowed': 'Speech recognition service not available.',
        'audio-capture': 'No microphone found. Please check your microphone is connected.',
        'aborted': null, // Intentional abort, not an error
      };

      const msg = errorMessages[event.error];
      if (msg !== null && onError) {
        onError(msg || `Speech error: ${event.error}`);
      }
    };

    return {
      start: () => {
        finalTranscript = '';
        recognition.start();
      },
      stop: () => {
        recognition.stop();
        return finalTranscript.trim();
      },
      abort: () => {
        recognition.abort();
      },
      setLanguage: (lang) => {
        recognition.language = lang;
      },
    };
  } catch (error) {
    onError(`Failed to initialize speech recognition: ${error.message}`);
    return null;
  }
}

export const SUPPORTED_LANGUAGES = {
  'en-IN': 'English (India)',
  'en-US': 'English (US)',
  'hi-IN': 'हिंदी (Hindi)',
  'ta-IN': 'தமிழ் (Tamil)',
  'te-IN': 'తెలుగు (Telugu)',
  'kn-IN': 'ಕನ್ನಡ (Kannada)',
  'mr-IN': 'मराठी (Marathi)',
  'bn-IN': 'বাংলা (Bengali)',
};

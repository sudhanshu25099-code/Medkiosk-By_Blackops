import React, { createContext, useState, useEffect, useCallback } from 'react';

export const HistoryContext = createContext();

const STORAGE_KEY = 'medikiosk_session_history';

const INITIAL_STATE = {
  // Patient info
  abhaId: '',
  patientName: '',
  language: 'en-IN',
  timestamp: new Date().toISOString(),

  // Captured voice/touch data
  rawTranscript: '',
  selectedSymptoms: [],

  // Structured clinical data (populated by Gemini or offline mock)
  chiefComplaint: '',

  hpi: {
    onset: 'Not specified',
    character: 'Not specified',
    radiation: 'Not specified',
    associated_symptoms: [],
    duration: 'Not specified',
    severity: 'Not specified',
    aggravating_relieving_factors: 'Not specified',
  },

  pastMedicalHistory: {
    conditions: [],
    surgeries: [],
  },

  medicationsAndAllergies: {
    current_medications: [],
    allergies: 'NKDA',
  },

  priorLabValues: [],

  // Documents
  uploadedDocuments: [],
  ocrExtractedEntities: null,

  // Triage
  triagePriority: 'Routine',
  redFlags: [],
  confidenceScore: 0,
};

/** Helper to retrieve persisted session data */
function getInitialStoredState() {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_STATE, ...parsed };
    }
  } catch (err) {
    console.warn('[HistoryContext] Failed to load session storage:', err);
  }
  return INITIAL_STATE;
}

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState(getInitialStoredState);

  // Sync state changes to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
      console.warn('[HistoryContext] Failed to save to session storage:', err);
    }
  }, [history]);

  /** Reset to initial empty state (new patient) and clear session */
  const resetHistory = useCallback(() => {
    const freshState = { ...INITIAL_STATE, timestamp: new Date().toISOString() };
    setHistory(freshState);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('[HistoryContext] Failed to remove session storage:', err);
    }
  }, []);

  /** Merge structured Gemini response into history state */
  const updateWithStructuredData = useCallback((structuredData) => {
    setHistory((prev) => ({
      ...prev,
      chiefComplaint: structuredData.chief_complaint || prev.chiefComplaint,
      hpi: structuredData.history_of_present_illness || prev.hpi,
      pastMedicalHistory: structuredData.past_medical_history || prev.pastMedicalHistory,
      medicationsAndAllergies:
        structuredData.medications_and_allergies || prev.medicationsAndAllergies,
      priorLabValues: structuredData.extracted_lab_values || prev.priorLabValues,
      triagePriority: structuredData.triage_priority || prev.triagePriority,
      redFlags: structuredData.red_flags_detected || prev.redFlags,
      confidenceScore: structuredData.confidence_score || 0,
    }));
  }, []);

  /** Merge OCR-extracted entities into existing structured data */
  const mergeOCRData = useCallback((ocrEntities) => {
    setHistory((prev) => ({
      ...prev,
      ocrExtractedEntities: ocrEntities,
      pastMedicalHistory: {
        ...prev.pastMedicalHistory,
        conditions: [
          ...new Set([...prev.pastMedicalHistory.conditions, ...(ocrEntities.diagnoses || [])]),
        ],
      },
      medicationsAndAllergies: {
        ...prev.medicationsAndAllergies,
        current_medications: [
          ...prev.medicationsAndAllergies.current_medications,
          ...(ocrEntities.medications || []),
        ],
      },
      priorLabValues: [
        ...prev.priorLabValues,
        ...(ocrEntities.lab_results || []).map((l) => ({
          test_name: l.test,
          value: l.value,
          unit: l.reference_range || '',
          status: l.status,
        })),
      ],
    }));
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        history,
        setHistory,
        resetHistory,
        updateWithStructuredData,
        mergeOCRData,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

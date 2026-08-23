import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, Loader2, RotateCcw, X } from 'lucide-react';
import { HistoryContext } from '../context/HistoryContext';
import { initiateSpeechRecognition } from '../utils/speechRecognition';
import { structureHistory } from '../utils/geminiAPI';

const COMMON_SYMPTOMS = [
  'Fever', 'Cough', 'Headache', 'Chest Pain',
  'Shortness of Breath', 'Body Ache', 'Nausea / Vomiting',
  'Diarrhoea', 'Dizziness', 'Fatigue',
];

export default function InterviewScreen() {
  const navigate = useNavigate();
  const { history, setHistory, updateWithStructuredData } = useContext(HistoryContext);

  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [micError, setMicError] = useState('');
  const [apiError, setApiError] = useState('');
  const [micSupported, setMicSupported] = useState(true);

  const recognitionRef = useRef(null);

  // Initialise speech recognition once
  useEffect(() => {
    const rec = initiateSpeechRecognition(
      (t) => setTranscript(t),
      (err) => {
        setMicError(err);
        setIsListening(false);
        if (err.includes('not supported')) setMicSupported(false);
      },
      () => setIsListening(true),
      () => setIsListening(false)
    );

    if (rec) {
      rec.setLanguage(history.language || 'en-IN');
      recognitionRef.current = rec;
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, []); // eslint-disable-line

  const handleMicToggle = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setMicError('');
      setApiError('');
      recognitionRef.current.start();
    }
  };

  const handleSymptomClick = (symptom) => {
    setApiError('');
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms((prev) => prev.filter((s) => s !== symptom));
      setTranscript((prev) => {
        const parts = prev.split(', ').filter((s) => s !== symptom);
        return parts.join(', ');
      });
    } else {
      setSelectedSymptoms((prev) => [...prev, symptom]);
      setTranscript((prev) => (prev ? `${prev}, ${symptom}` : symptom));
    }
  };

  const handleClear = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    setTranscript('');
    setSelectedSymptoms([]);
    setMicError('');
    setApiError('');
  };

  const handleNext = async () => {
    const input = transcript.trim();
    if (!input) {
      setApiError('Please speak or select at least one symptom before continuing.');
      return;
    }

    setIsProcessing(true);
    setApiError('');

    try {
      setHistory((prev) => ({ ...prev, rawTranscript: input, selectedSymptoms }));
      const structured = await structureHistory(input);
      updateWithStructuredData(structured);
      navigate('/upload');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const combinedInput = transcript.trim();

  return (
    <div className="w-full flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-clinical-gray">Tell us what's wrong</h1>
          <p className="text-sm text-neutral-gray mt-1">
            Speak naturally into the microphone, or tap the symptoms below.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── LEFT: Voice Input ── */}
          <div className="card flex flex-col gap-5">
            <h2 className="text-base font-semibold text-clinical-gray border-b border-bg-light pb-2">
              Voice Input
            </h2>

            {/* Mic button */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleMicToggle}
                disabled={isProcessing || !micSupported}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed
                  ${isListening
                    ? 'bg-medical-blue border-medical-blue text-white animate-mic-pulse'
                    : 'bg-bg-light border-bg-light text-clinical-gray hover:border-medical-blue hover:text-medical-blue'
                  }`}
              >
                {isListening
                  ? <Square className="w-10 h-10" />
                  : <Mic className="w-10 h-10" />
                }
              </button>

              <p className="text-sm font-semibold text-clinical-gray tracking-wide">
                {isListening ? '🎙 LISTENING…' : micSupported ? 'TAP TO SPEAK' : 'MIC UNAVAILABLE'}
              </p>
            </div>

            {/* Live transcript */}
            {combinedInput && (
              <div className="bg-bg-light border border-neutral-gray/30 rounded-md p-3 min-h-[72px] animate-fade-in">
                <p className="text-sm text-clinical-gray leading-relaxed">"{combinedInput}"</p>
              </div>
            )}

            {/* Mic error */}
            {micError && !micSupported && (
              <div className="alert-box border-warning-red bg-warning-red-light text-sm text-warning-red-border">
                <p className="font-semibold mb-1">🎤 Microphone not available</p>
                <ul className="list-disc ml-4 space-y-1 text-xs">
                  <li>Check microphone is plugged in</li>
                  <li>Allow browser microphone permission</li>
                  <li>Use Chrome, Edge, or Safari</li>
                </ul>
                <p className="mt-2">You can still use the symptom buttons.</p>
              </div>
            )}

            {/* Control buttons */}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={handleClear}
                disabled={isProcessing}
                className="btn-secondary flex-1 text-sm gap-1"
                aria-label="Clear transcript"
              >
                <X className="w-4 h-4" /> CLEAR
              </button>
              <button
                onClick={handleMicToggle}
                disabled={isProcessing || !micSupported}
                className="btn-secondary flex-1 text-sm gap-1"
                aria-label={isListening ? 'Stop recording' : 'Restart recording'}
              >
                <RotateCcw className="w-4 h-4" /> {isListening ? 'STOP' : 'RESTART'}
              </button>
            </div>
          </div>

          {/* ── RIGHT: Touch Symptoms ── */}
          <div className="card flex flex-col gap-5">
            <h2 className="text-base font-semibold text-clinical-gray border-b border-bg-light pb-2">
              Or select from common symptoms
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {COMMON_SYMPTOMS.map((symptom) => {
                const active = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    onClick={() => handleSymptomClick(symptom)}
                    aria-pressed={active}
                    className={`min-h-touch py-2 px-3 rounded-md border text-sm font-medium text-left transition-colors duration-100
                      ${active
                        ? 'bg-medical-blue border-medical-blue text-white'
                        : 'bg-white border-bg-light text-clinical-gray hover:border-medical-blue hover:text-medical-blue'
                      }`}
                  >
                    {symptom}
                  </button>
                );
              })}
            </div>

            {selectedSymptoms.length > 0 && (
              <p className="text-xs text-neutral-gray mt-auto">
                {selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>

        {/* API error */}
        {apiError && (
          <div
            role="alert"
            className="alert-box border-warning-red bg-warning-red-light text-warning-red-border text-sm animate-fade-in"
          >
            <p className="font-semibold mb-1">⚠ Processing error</p>
            <p>{apiError}</p>
            <p className="mt-2 text-xs">
              Check that <code className="bg-white px-1 rounded">VITE_GEMINI_API_KEY</code> is set in <code className="bg-white px-1 rounded">.env.local</code>
            </p>
          </div>
        )}

        {/* Navigation footer */}
        <div className="flex gap-3 pt-4 border-t border-bg-light mt-auto">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary flex-1"
            disabled={isProcessing}
          >
            ← BACK
          </button>
          <button
            onClick={handleNext}
            disabled={isProcessing || !combinedInput}
            className="btn-primary flex-1 gap-2"
            aria-label="Proceed to document upload"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                ANALYSING…
              </>
            ) : (
              'NEXT →'
            )}
          </button>
        </div>
    </div>
  );
}

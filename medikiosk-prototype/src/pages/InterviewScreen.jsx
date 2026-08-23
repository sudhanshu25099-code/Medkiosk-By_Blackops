import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Square, 
  Loader2, 
  RotateCcw, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Activity, 
  AlertCircle, 
  Clock, 
  Compass, 
  HelpCircle, 
  Layers,
  Sparkles,
  Flame
} from 'lucide-react';
import { HistoryContext } from '../context/HistoryContext';
import { initiateSpeechRecognition } from '../utils/speechRecognition';
import { structureHistory } from '../utils/geminiAPI';

const COMMON_SYMPTOMS = [
  'Fever', 'Cough', 'Headache', 'Chest Pain',
  'Shortness of Breath', 'Abdominal Pain', 'Body Ache', 
  'Nausea / Vomiting', 'Diarrhoea', 'Dizziness', 
  'Joint Pain', 'Fatigue'
];

// Adaptive SOCRATES Question Banks based on symptom group
const ONSET_OPTIONS = [
  { label: 'Sudden onset (< 1 hr)', value: 'Sudden onset within the past hour' },
  { label: 'Gradual (few hours ago)', value: 'Gradual onset over several hours' },
  { label: '1 – 3 days ago', value: 'Started 1 to 3 days ago' },
  { label: 'More than a week', value: 'Persistent for more than a week' },
  { label: 'Chronic / Recurring', value: 'Chronic condition with recurrent episodes' },
];

const CHARACTER_OPTIONS = [
  { label: 'Crushing / Heavy Pressure', value: 'Crushing, heavy retrosternal pressure' },
  { label: 'Throbbing / Pulsating', value: 'Throbbing and pulsating sensation' },
  { label: 'Sharp / Stabbing', value: 'Sharp, piercing, and stabbing' },
  { label: 'Dull / Constant Aching', value: 'Dull, persistent, deep aching discomfort' },
  { label: 'Burning / Acidic', value: 'Burning sensation' },
  { label: 'Productive / Spasmodic', value: 'Productive cough or spasmodic discomfort' },
];

const RADIATION_OPTIONS = [
  { label: 'Localized (No Spread)', value: 'Localized to primary site, no radiation' },
  { label: 'To Left Arm & Jaw', value: 'Radiates down the left arm and up to the jaw' },
  { label: 'To Neck & Back', value: 'Radiates towards the posterior neck and upper back' },
  { label: 'To Abdomen / Groin', value: 'Radiates downwards to lower abdomen and groin' },
  { label: 'Diffuse / Generalized', value: 'Diffuse and spread generalized throughout the body' },
];

const ASSOCIATED_OPTIONS = [
  'Shortness of Breath (Dyspnea)',
  'Profuse Sweating (Diaphoresis)',
  'Nausea / Vomiting',
  'Dizziness / Vertigo',
  'Photophobia (Light sensitivity)',
  'High Fever with Chills',
  'Loss of Appetite',
  'Generalized Weakness'
];

const FACTORS_OPTIONS = [
  { label: 'Worse with physical exertion', value: 'Aggravated by movement and physical exertion' },
  { label: 'Relieved by resting in dark room', value: 'Relieved by quiet rest in dark room' },
  { label: 'Worse after meals / cold food', value: 'Worsens following meal intake or cold exposure' },
  { label: 'Relieved by antipyretic / paracetamol', value: 'Temporarily relieved by painkillers/antipyretics' },
  { label: 'Constant (No relieving factors)', value: 'Constant intensity with no identifiable relieving factors' },
];

// Helper for severity color & emoji description
function getSeverityDescriptor(val) {
  const num = Number(val);
  if (num === 0) return { label: 'No Pain / Discomfort', color: 'text-emerald-600 bg-emerald-50 border-emerald-300', emoji: '😊', barColor: 'bg-emerald-500' };
  if (num <= 3) return { label: 'Mild Discomfort', color: 'text-emerald-700 bg-emerald-100 border-emerald-300', emoji: '🙂', barColor: 'bg-emerald-500' };
  if (num <= 6) return { label: 'Moderate Pain / Discomfort', color: 'text-amber-700 bg-amber-100 border-amber-300', emoji: '😐', barColor: 'bg-amber-500' };
  if (num <= 8) return { label: 'Severe Pain', color: 'text-orange-700 bg-orange-100 border-orange-300', emoji: '😣', barColor: 'bg-orange-500' };
  return { label: 'Critical / Unbearable Pain', color: 'text-red-700 bg-red-100 border-red-300 animate-pulse', emoji: '😫', barColor: 'bg-red-600' };
}

export default function InterviewScreen() {
  const navigate = useNavigate();
  const { history, setHistory, updateWithStructuredData } = useContext(HistoryContext);

  // Stage state: 'complaint' (Stage 1) -> 'socrates' (Stage 2)
  const [stage, setStage] = useState('complaint');

  // Stage 1 State: Chief Complaint & Voice
  const [transcript, setTranscript] = useState(history.rawTranscript || '');
  const [selectedSymptoms, setSelectedSymptoms] = useState(history.selectedSymptoms || []);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [micError, setMicError] = useState('');
  const [apiError, setApiError] = useState('');
  const [micSupported, setMicSupported] = useState(true);

  // Stage 2 State: SOCRATES Probing
  const [severity, setSeverity] = useState(history.socratesResponses?.severity || 5);
  const [onset, setOnset] = useState(history.socratesResponses?.onset || '');
  const [character, setCharacter] = useState(history.socratesResponses?.character || '');
  const [radiation, setRadiation] = useState(history.socratesResponses?.radiation || '');
  const [associated, setAssociated] = useState(history.socratesResponses?.associated || []);
  const [aggravatingRelieving, setAggravatingRelieving] = useState(history.socratesResponses?.aggravatingRelieving || '');
  const [voiceAddendum, setVoiceAddendum] = useState('');

  const recognitionRef = useRef(null);

  // Initialize speech recognition once
  useEffect(() => {
    const rec = initiateSpeechRecognition(
      (t) => {
        if (stage === 'complaint') {
          setTranscript(t);
        } else {
          setVoiceAddendum(t);
        }
      },
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
  }, [stage, history.language]);

  const handleMicToggle = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
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

  const handleProceedToProbing = () => {
    const input = transcript.trim();
    if (!input && selectedSymptoms.length === 0) {
      setApiError('Please speak your symptoms or select from the symptom buttons.');
      return;
    }
    setApiError('');
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    setStage('socrates');
  };

  const handleAssociatedToggle = (item) => {
    if (associated.includes(item)) {
      setAssociated((prev) => prev.filter((x) => x !== item));
    } else {
      setAssociated((prev) => [...prev, item]);
    }
  };

  const handleFinalSubmit = async () => {
    const mainInput = transcript.trim() || selectedSymptoms.join(', ');
    const fullTranscript = voiceAddendum.trim() 
      ? `${mainInput}. Additional notes: ${voiceAddendum.trim()}` 
      : mainInput;

    const socratesData = {
      severity: Number(severity),
      onset: onset || (severity >= 8 ? 'Sudden onset' : 'Gradual onset'),
      character: character || 'Aching discomfort',
      radiation: radiation || 'Localized',
      duration: onset || '1-3 days',
      associated,
      aggravatingRelieving: aggravatingRelieving || 'Not specified',
    };

    setIsProcessing(true);
    setApiError('');

    try {
      setHistory((prev) => ({
        ...prev,
        rawTranscript: fullTranscript,
        selectedSymptoms,
        socratesResponses: socratesData,
      }));

      const structured = await structureHistory(fullTranscript, '', socratesData);
      updateWithStructuredData(structured);
      navigate('/upload');
    } catch (err) {
      setApiError(err.message || 'Failed to process clinical history.');
    } finally {
      setIsProcessing(false);
    }
  };

  const severityDesc = getSeverityDescriptor(severity);
  const combinedInput = transcript.trim();

  return (
    <div className="w-full flex flex-col gap-5">
      
      {/* ================= STAGE 1: CHIEF COMPLAINT CAPTURE ================= */}
      {stage === 'complaint' && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#3B52E1] text-xs font-bold mb-1 border border-blue-200">
                <span>Step 2.1 of 5</span> • Chief Complaint
              </div>
              <h1 className="text-xl font-bold text-slate-800">What brings you in today?</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Speak into the mic in your own words, or tap symptom tags below.
              </p>
            </div>
          </div>

          {/* Two-Column Grid: Voice & Symptoms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* ── LEFT: Voice Input Node ── */}
            <div className="card flex flex-col gap-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-[#3B52E1]" /> Voice ASR Input
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {history.language === 'hi-IN' ? 'हिंदी' : 'English'}
                </span>
              </div>

              {/* Mic Central Button */}
              <div className="flex flex-col items-center justify-center py-2 gap-3">
                <button
                  onClick={handleMicToggle}
                  disabled={isProcessing || !micSupported}
                  aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                  className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-200 shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                    ${isListening
                      ? 'bg-rose-600 border-rose-200 text-white animate-pulse shadow-rose-300/50'
                      : 'bg-[#3B52E1] border-blue-100 text-white hover:bg-blue-700 hover:scale-105 shadow-blue-500/20'
                    }`}
                >
                  {isListening ? (
                    <Square className="w-9 h-9 fill-current" />
                  ) : (
                    <Mic className="w-9 h-9" />
                  )}
                </button>

                <div className="text-center">
                  <p className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    {isListening ? '🎙 Listening to you… Tap to stop' : micSupported ? 'Tap Mic to Speak' : 'Mic Unavailable'}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Supports Hindi & English speech
                  </span>
                </div>
              </div>

              {/* Live transcript display */}
              {combinedInput ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[64px] animate-fade-in relative">
                  <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                    "{combinedInput}"
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50/70 border border-dashed border-slate-200 rounded-xl p-3 text-center min-h-[64px] flex items-center justify-center">
                  <span className="text-xs text-slate-400">
                    Your speech transcript will appear here in real-time...
                  </span>
                </div>
              )}

              {/* Mic Error */}
              {micError && !micSupported && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Microphone unavailable</p>
                    <p className="text-[11px] mt-0.5">Please allow microphone permissions or use the symptom buttons on the right.</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100">
                <button
                  onClick={handleClear}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
                <button
                  onClick={handleMicToggle}
                  disabled={!micSupported}
                  className="flex-1 py-2 px-3 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-[#3B52E1] hover:bg-blue-100 flex items-center justify-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> {isListening ? 'Stop' : 'Restart'}
                </button>
              </div>
            </div>

            {/* ── RIGHT: Symptom Chips Grid ── */}
            <div className="card flex flex-col gap-3 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#3B52E1]" /> Common Symptoms
                </span>
                {selectedSymptoms.length > 0 && (
                  <span className="text-[11px] font-bold text-[#3B52E1] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {selectedSymptoms.length} Selected
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500">
                Tap all symptoms that match how you feel right now:
              </p>

              <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[260px] pr-1">
                {COMMON_SYMPTOMS.map((symptom) => {
                  const active = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => handleSymptomClick(symptom)}
                      aria-pressed={active}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all duration-150 flex items-center justify-between
                        ${active
                          ? 'bg-[#3B52E1] border-[#3B52E1] text-white shadow-sm scale-[1.02]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-[#3B52E1] hover:bg-blue-50/50'
                        }`}
                    >
                      <span>{symptom}</span>
                      {active && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">✓</span>}
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-3 border-t border-slate-100">
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Or type / edit your complaint:
                </label>
                <input
                  type="text"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="e.g. Severe chest tightness with breathlessness"
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#3B52E1]"
                />
              </div>
            </div>

          </div>

          {/* API error */}
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              onClick={() => navigate('/')}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Welcome
            </button>

            <button
              onClick={handleProceedToProbing}
              disabled={!combinedInput && selectedSymptoms.length === 0}
              className="py-2.5 px-6 rounded-xl bg-[#3B52E1] text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue to Clinical Probing</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}


      {/* ================= STAGE 2: ADAPTIVE SOCRATES PROBING ================= */}
      {stage === 'socrates' && (
        <div className="flex flex-col gap-5 animate-fade-in">
          
          {/* Header & Complaint Summary Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3B52E1] text-white text-[11px] font-bold mb-1 shadow-sm">
                <Sparkles className="w-3 h-3" /> Step 2.2 • SOCRATES Clinical Probing
              </div>
              <h1 className="text-lg font-extrabold text-slate-800">
                Detailed Symptom Assessment
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Chief Complaint: <span className="font-bold text-[#3B52E1]">"{combinedInput || selectedSymptoms.join(', ')}"</span>
              </p>
            </div>

            <button
              onClick={() => setStage('complaint')}
              className="text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              ← Edit Complaint
            </button>
          </div>

          {/* ── 1. VISUAL 0–10 SEVERITY & PAIN SLIDER ── */}
          <div className="card border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Severity & Pain Scale (0 – 10)
                </span>
              </div>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${severityDesc.color} flex items-center gap-1.5 shadow-sm`}>
                <span className="text-sm">{severityDesc.emoji}</span>
                <span>{severity} / 10 • {severityDesc.label}</span>
              </span>
            </div>

            {/* Touch Slider */}
            <div className="py-2 px-1">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3B52E1]"
                aria-label="Severity rating from 0 to 10"
              />
              
              {/* Slider Scale Numbers */}
              <div className="flex justify-between text-[11px] font-bold text-slate-400 px-1 mt-2">
                <span className={severity === 0 ? 'text-emerald-600 font-extrabold' : ''}>0 (None)</span>
                <span className={severity === 2 ? 'text-emerald-600 font-extrabold' : ''}>2</span>
                <span className={severity === 4 ? 'text-amber-600 font-extrabold' : ''}>4 (Moderate)</span>
                <span className={severity === 6 ? 'text-amber-600 font-extrabold' : ''}>6</span>
                <span className={severity === 8 ? 'text-orange-600 font-extrabold' : ''}>8 (Severe)</span>
                <span className={severity === 10 ? 'text-red-600 font-extrabold' : ''}>10 (Unbearable)</span>
              </div>
            </div>
          </div>

          {/* ── 2. ADAPTIVE SOCRATES PROBING CARDS ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Onset Card */}
            <div className="card border border-slate-200 p-4 shadow-sm flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#3B52E1]" /> Onset & Duration
              </span>
              <p className="text-[11px] text-slate-500">When did this symptom start?</p>
              <div className="flex flex-col gap-1.5">
                {ONSET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setOnset(opt.value)}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg border transition-all ${
                      onset === opt.value
                        ? 'bg-[#3B52E1] border-[#3B52E1] text-white font-bold shadow-sm'
                        : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Character Card */}
            <div className="card border border-slate-200 p-4 shadow-sm flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#3B52E1]" /> Symptom Character / Type
              </span>
              <p className="text-[11px] text-slate-500">How would you describe the feeling?</p>
              <div className="flex flex-col gap-1.5">
                {CHARACTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setCharacter(opt.value)}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg border transition-all ${
                      character === opt.value
                        ? 'bg-[#3B52E1] border-[#3B52E1] text-white font-bold shadow-sm'
                        : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Radiation Card */}
            <div className="card border border-slate-200 p-4 shadow-sm flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#3B52E1]" /> Radiation / Spread
              </span>
              <p className="text-[11px] text-slate-500">Does the pain spread anywhere else?</p>
              <div className="flex flex-col gap-1.5">
                {RADIATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRadiation(opt.value)}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg border transition-all ${
                      radiation === opt.value
                        ? 'bg-[#3B52E1] border-[#3B52E1] text-white font-bold shadow-sm'
                        : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aggravating & Relieving Factors */}
            <div className="card border border-slate-200 p-4 shadow-sm flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#3B52E1]" /> Relieving / Aggravating Factors
              </span>
              <p className="text-[11px] text-slate-500">What makes it feel better or worse?</p>
              <div className="flex flex-col gap-1.5">
                {FACTORS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAggravatingRelieving(opt.value)}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg border transition-all ${
                      aggravatingRelieving === opt.value
                        ? 'bg-[#3B52E1] border-[#3B52E1] text-white font-bold shadow-sm'
                        : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ── 3. ASSOCIATED SYMPTOMS MULTI-SELECT ── */}
          <div className="card border border-slate-200 p-4 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#3B52E1]" /> Associated Symptoms (Select all that apply)
              </span>
              {associated.length > 0 && (
                <span className="text-[11px] text-[#3B52E1] font-bold">
                  {associated.length} selected
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {ASSOCIATED_OPTIONS.map((item) => {
                const active = associated.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => handleAssociatedToggle(item)}
                    className={`text-xs py-1.5 px-3 rounded-full border transition-all ${
                      active
                        ? 'bg-[#3B52E1] border-[#3B52E1] text-white font-bold shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}{item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 4. OPTIONAL VOICE ADDENDUM ── */}
          <div className="card border border-slate-200 p-4 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-[#3B52E1]" /> Anything else to add for your doctor?
              </span>
              <button
                onClick={handleMicToggle}
                className={`text-xs px-2.5 py-1 rounded-full border font-bold flex items-center gap-1 transition-all ${
                  isListening
                    ? 'bg-rose-600 border-rose-200 text-white animate-pulse'
                    : 'bg-blue-50 border-blue-200 text-[#3B52E1] hover:bg-blue-100'
                }`}
              >
                <Mic className="w-3 h-3" />
                {isListening ? 'Recording…' : 'Speak extra details'}
              </button>
            </div>

            <input
              type="text"
              value={voiceAddendum}
              onChange={(e) => setVoiceAddendum(e.target.value)}
              placeholder="e.g. Took 650mg paracetamol 2 hours ago; pain is aggravated when bending over"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#3B52E1]"
            />
          </div>

          {/* API error */}
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              onClick={() => setStage('complaint')}
              disabled={isProcessing}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Symptoms
            </button>

            <button
              onClick={handleFinalSubmit}
              disabled={isProcessing}
              className="py-3 px-7 rounded-xl bg-[#3B52E1] text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Structuring Clinical History with AI…</span>
                </>
              ) : (
                <>
                  <span>Analyze & Proceed to Document Upload</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

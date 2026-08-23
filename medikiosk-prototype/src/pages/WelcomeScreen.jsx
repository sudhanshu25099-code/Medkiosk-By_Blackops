import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HistoryContext } from '../context/HistoryContext';

const LANGUAGES = [
  { code: 'hi-IN', label: 'हिंदी', sublabel: 'Hindi' },
  { code: 'en-IN', label: 'English', sublabel: 'English (India)' },
];

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const { setHistory, history } = useContext(HistoryContext);

  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [abhaId, setAbhaId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState('');

  const handleLanguageSelect = (code) => {
    setSelectedLang(code);
    setHistory((prev) => ({ ...prev, language: code }));
  };

  const handleProceed = () => {
    if (!consentChecked) {
      setError('Please accept the consent to continue.');
      return;
    }
    setError('');
    setHistory((prev) => ({
      ...prev,
      abhaId: abhaId.trim(),
      patientName: patientName.trim() || 'Patient',
      language: selectedLang,
      timestamp: new Date().toISOString(),
    }));
    navigate('/interview');
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Welcome copy */}
        <div className="card">
          <h1 className="text-xl font-semibold text-clinical-gray mb-2">
            Welcome to your health check-in
          </h1>
          <p className="text-base text-clinical-gray-light leading-relaxed">
            We will capture your medical history in your own words, before your
            doctor's appointment. It takes about 5 minutes.
          </p>
        </div>

        {/* Language Selection */}
        <div>
          <p className="field-label mb-2">Select your preferred language:</p>
          <div className="flex gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                aria-pressed={selectedLang === lang.code}
                className={`flex-1 min-h-touch py-3 px-4 rounded-md border-2 font-semibold text-base transition-colors duration-100
                  ${
                    selectedLang === lang.code
                      ? 'bg-medical-blue border-medical-blue text-white'
                      : 'bg-white border-bg-light text-clinical-gray hover:border-medical-blue hover:text-medical-blue'
                  }`}
              >
                <div>{lang.label}</div>
                <div className="text-xs font-normal opacity-75">{lang.sublabel}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ABHA Authentication (Simulated) */}
        <div className="card">
          <h2 className="text-base font-semibold text-clinical-gray mb-1">
            Patient Identification
            <span className="ml-2 text-xs text-neutral-gray font-normal">(Simulated for Demo)</span>
          </h2>

          <div className="flex flex-col gap-3 mt-3">
            <div>
              <label htmlFor="patientName" className="field-label">
                Patient Name
              </label>
              <input
                id="patientName"
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Raj Kumar"
                className="field-input"
                aria-label="Patient Name"
              />
            </div>

            <div>
              <label htmlFor="abhaId" className="field-label">
                ABHA ID / Aadhaar Number
              </label>
              <input
                id="abhaId"
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="Leave blank to continue without login"
                className="field-input"
                aria-label="ABHA ID or Aadhaar Number"
              />
            </div>
          </div>
        </div>

        {/* Consent */}
        <div className="card">
          <h2 className="text-base font-semibold text-clinical-gray mb-3">
            Consent &amp; Privacy
          </h2>

          <label className="flex gap-3 cursor-pointer items-start">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => {
                setConsentChecked(e.target.checked);
                if (e.target.checked) setError('');
              }}
              className="w-5 h-5 mt-0.5 accent-medical-blue shrink-0 cursor-pointer"
              aria-label="Consent to health history capture"
            />
            <span className="text-sm text-clinical-gray-light leading-relaxed">
              I agree that MediKiosk will:
              <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                <li>Capture my health history</li>
                <li>Digitize my medical documents</li>
                <li>Share with my attending doctor</li>
                <li>Store securely per the DPDP Act, 2023</li>
              </ul>
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="alert-box border-warning-red bg-warning-red-light text-warning-red-border text-sm"
          >
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleProceed}
          className="btn-primary w-full min-h-cta text-base font-bold"
          aria-label="Proceed to history intake"
        >
          PROCEED TO HISTORY INTAKE
        </button>

        <p className="text-center text-xs text-neutral-gray">
          Step 1 of 5 — Identification &amp; Consent
        </p>
    </div>
  );
}

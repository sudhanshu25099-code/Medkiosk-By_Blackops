import React, { useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, Loader2, CheckCircle } from 'lucide-react';
import { HistoryContext } from '../context/HistoryContext';
import { extractTextFromImage, parseOCRProgress } from '../utils/tesseractOCR';
import { extractClinicalEntities } from '../utils/geminiAPI';

export default function DocumentUploadScreen() {
  const navigate = useNavigate();
  const { mergeOCRData } = useContext(HistoryContext);

  const [hasDocuments, setHasDocuments] = useState(null); // null | true | false
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const processFile = async (uploadedFile) => {
    setFile(uploadedFile);
    setExtracted(null);
    setError('');
    setOcrProgress(0);
    setOcrStatus('Initialising OCR engine…');
    setIsProcessing(true);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(uploadedFile);

    try {
      // Step 1: OCR
      const ocr = await extractTextFromImage(uploadedFile, (msg) => {
        setOcrStatus(msg.status || 'Processing…');
        setOcrProgress(parseOCRProgress(msg));
      });

      setOcrStatus('Extracting clinical entities…');
      setOcrProgress(90);

      // Step 2: Gemini entity extraction
      const entities = await extractClinicalEntities(ocr.text);

      setOcrProgress(100);
      setOcrStatus('Done');
      setExtracted(entities);
      mergeOCRData(entities);
    } catch (err) {
      setError(err.message);
      setOcrStatus('');
      setOcrProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) processFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setExtracted(null);
    setOcrProgress(0);
    setOcrStatus('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-medical-blue text-white px-6 py-3 flex items-center justify-between">
        <span className="text-lg font-bold">MediKiosk</span>
        <span className="text-sm text-blue-200">Step 3 of 5 — Prior Reports</span>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-6 py-6 flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-bold text-clinical-gray">Upload Prior Reports</h1>
          <p className="text-sm text-neutral-gray mt-1">
            Optionally upload prescriptions, lab reports, or discharge summaries.
          </p>
        </div>

        {/* Yes / No toggle */}
        <div>
          <p className="field-label mb-2">Do you have prior medical reports with you?</p>
          <div className="flex gap-3">
            {[{ val: true, label: 'Yes, I have reports' }, { val: false, label: 'No, skip this step' }].map(
              ({ val, label }) => (
                <button
                  key={String(val)}
                  onClick={() => { setHasDocuments(val); if (!val) { setFile(null); setExtracted(null); } }}
                  aria-pressed={hasDocuments === val}
                  className={`flex-1 min-h-touch py-3 px-4 rounded-md border-2 font-semibold text-sm transition-colors duration-100
                    ${hasDocuments === val
                      ? 'bg-medical-blue border-medical-blue text-white'
                      : 'bg-white border-bg-light text-clinical-gray hover:border-medical-blue hover:text-medical-blue'
                    }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Upload area — only if hasDocuments === true */}
        {hasDocuments === true && (
          <div className="flex flex-col gap-4 animate-fade-in">

            {/* Drop zone */}
            {!file && (
              <div
                ref={dropRef}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-gray/60 rounded-md p-8
                           flex flex-col items-center gap-3 cursor-pointer
                           hover:border-medical-blue transition-colors duration-150"
                role="button"
                tabIndex={0}
                aria-label="Click or drag to upload document"
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <FileText className="w-10 h-10 text-neutral-gray" />
                <div className="text-center">
                  <p className="text-base font-semibold text-clinical-gray">
                    Click to upload or drag &amp; drop
                  </p>
                  <p className="text-xs text-neutral-gray mt-1">
                    JPEG, PNG, WebP — max 5MB
                  </p>
                  <p className="text-xs text-neutral-gray">
                    Prescriptions · Lab Reports · Discharge Summaries
                  </p>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              aria-hidden="true"
            />

            {/* File selected — show preview + progress */}
            {file && (
              <div className="card flex flex-col gap-4">
                {/* File header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-medical-blue shrink-0" />
                    <span className="text-sm font-medium text-clinical-gray truncate max-w-[220px]">
                      {file.name}
                    </span>
                  </div>
                  <button
                    onClick={handleRemove}
                    disabled={isProcessing}
                    className="text-neutral-gray hover:text-warning-red transition-colors disabled:opacity-40"
                    aria-label="Remove uploaded file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Image preview */}
                {preview && (
                  <img
                    src={preview}
                    alt="Uploaded document preview"
                    className="w-full max-h-40 object-contain border border-bg-light rounded-md"
                  />
                )}

                {/* OCR progress */}
                {isProcessing && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-gray capitalize">{ocrStatus}</span>
                      <span className="text-xs text-neutral-gray font-mono">{ocrProgress}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${ocrProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Done */}
                {!isProcessing && ocrProgress === 100 && (
                  <div className="flex items-center gap-2 text-success-green text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" /> Extraction complete
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="alert-box border-warning-red bg-warning-red-light text-warning-red-border text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Extracted entities */}
            {extracted && (
              <div className="card animate-slide-up">
                <div className="card-heading">Extracted Information</div>

                {extracted.diagnoses?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-neutral-gray uppercase mb-1">Diagnoses</p>
                    <ul className="space-y-1">
                      {extracted.diagnoses.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-clinical-gray">
                          <span className="text-base leading-tight">📋</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {extracted.medications?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-neutral-gray uppercase mb-1">Medications</p>
                    <ul className="space-y-1">
                      {extracted.medications.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-clinical-gray">
                          <span className="text-base leading-tight">💊</span>
                          {m.name} {m.dose && `— ${m.dose}`} {m.frequency && `(${m.frequency})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {extracted.lab_results?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-neutral-gray uppercase mb-1">Lab Results</p>
                    <ul className="space-y-1">
                      {extracted.lab_results.map((l, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-base leading-tight">🧪</span>
                          <span className={l.status?.toLowerCase() === 'abnormal' ? 'text-warning-red-border font-medium' : 'text-clinical-gray'}>
                            {l.test}: {l.value}
                            {l.status?.toLowerCase() === 'abnormal' && (
                              <span className="ml-1 text-xs font-semibold text-warning-red-border">⚠ Abnormal</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {extracted.document_type && (
                  <p className="mt-3 text-xs text-neutral-gray">
                    Document type: <span className="font-medium">{extracted.document_type}</span>
                    {extracted.document_date && ` · ${extracted.document_date}`}
                  </p>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleRemove}
                    className="btn-secondary text-sm flex-1"
                  >
                    REMOVE
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary text-sm flex-1"
                  >
                    UPLOAD ANOTHER
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4 border-t border-bg-light mt-auto">
          <button onClick={() => navigate('/interview')} className="btn-secondary flex-1">
            ← BACK
          </button>
          <button
            onClick={() => navigate('/handoff')}
            disabled={isProcessing}
            className="btn-primary flex-1 gap-2"
          >
            {isProcessing
              ? <><Loader2 className="w-4 h-4 animate-spin" /> PROCESSING…</>
              : hasDocuments === true && !extracted
                ? 'SKIP →'
                : 'NEXT →'
            }
          </button>
        </div>
      </main>
    </div>
  );
}

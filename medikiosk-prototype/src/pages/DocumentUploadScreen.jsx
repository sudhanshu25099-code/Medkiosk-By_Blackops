import React, { useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, Loader2, CheckCircle, Sparkles, Brain, Eye } from 'lucide-react';
import { HistoryContext } from '../context/HistoryContext';
import { extractTextFromImage, parseOCRProgress } from '../utils/tesseractOCR';
import { extractClinicalEntities, summarizeClinicalDocument } from '../utils/geminiAPI';

export default function DocumentUploadScreen() {
  const navigate  = useNavigate();
  const { mergeOCRData, history } = useContext(HistoryContext);

  const [hasDocuments, setHasDocuments] = useState(null); // null | true | false
  const [file,         setFile]         = useState(null);
  const [preview,      setPreview]      = useState(null);
  const [ocrProgress,  setOcrProgress]  = useState(0);
  const [ocrStatus,    setOcrStatus]    = useState('');
  const [ocrEngine,    setOcrEngine]    = useState('tesseract'); // 'tesseract' | 'gemini'
  const [isProcessing, setIsProcessing] = useState(false);
  const [extracted,    setExtracted]    = useState(null);
  const [rawOcrText,   setRawOcrText]   = useState('');
  const [summary,      setSummary]      = useState('');
  const [error,        setError]        = useState('');

  const fileInputRef = useRef(null);
  const dropRef      = useRef(null);

  const processFile = async (uploadedFile) => {
    setFile(uploadedFile);
    setExtracted(null);
    setSummary('');
    setRawOcrText('');
    setError('');
    setOcrProgress(0);
    setOcrStatus('Initialising dual-engine OCR pipeline…');
    setOcrEngine('tesseract');
    setIsProcessing(true);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(uploadedFile);

    try {
      // ── Step 1 + 2: Tesseract OCR → Gemini Vision enhance ──
      const ocr = await extractTextFromImage(uploadedFile, (msg) => {
        setOcrStatus(msg.status || 'Processing…');
        setOcrEngine(msg.engine || 'tesseract');
        // parseOCRProgress handles the raw {progress} value from Tesseract
        const rawPct = msg.progress ?? 0;
        const pct = typeof rawPct === 'number' && rawPct <= 1
          ? Math.round(rawPct * 100)
          : Math.round(rawPct);
        // Cap at 88 during OCR — gemini steps use 88–100
        setOcrProgress(Math.min(pct, 88));
      });

      setRawOcrText(ocr.text);

      // ── Step 3: Gemini entity extraction ──
      setOcrStatus('Extracting clinical entities with Gemini AI…');
      setOcrEngine('gemini');
      setOcrProgress(90);

      const entities = await extractClinicalEntities(ocr.text);

      // ── Step 4: Gemini document summarization ──
      setOcrStatus('Generating AI clinical summary…');
      setOcrProgress(95);

      const docSummary = await summarizeClinicalDocument(
        entities,
        ocr.text,
        history?.mode || 'allopathy'
      );

      setOcrProgress(100);
      setOcrStatus('Done');
      setExtracted(entities);
      setSummary(docSummary);
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
    setSummary('');
    setRawOcrText('');
    setOcrProgress(0);
    setOcrStatus('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Engine badge helper
  const EngineTag = ({ engine }) => {
    if (engine === 'gemini') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] bg-purple-100 border border-purple-300 text-purple-700 font-bold px-1.5 py-0.5 rounded-full">
          <Sparkles className="w-2.5 h-2.5" /> Gemini AI
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] bg-blue-100 border border-blue-300 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">
        <Eye className="w-2.5 h-2.5" /> Tesseract OCR
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-clinical-gray">Upload Prior Reports</h1>
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
                  onClick={() => { setHasDocuments(val); if (!val) { setFile(null); setExtracted(null); setSummary(''); } }}
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

                {/* Pipeline info */}
                <div className="mt-1 flex items-center gap-2 text-[10px] text-neutral-gray">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Tesseract OCR
                  </span>
                  <span className="text-neutral-gray">→</span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500" /> Gemini Vision
                  </span>
                  <span className="text-neutral-gray">→</span>
                  <span className="flex items-center gap-1">
                    <Brain className="w-3 h-3 text-indigo-500" /> Gemini Summarize
                  </span>
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
                      <span className="text-xs text-neutral-gray capitalize flex items-center gap-1.5">
                        <EngineTag engine={ocrEngine} />
                        {ocrStatus}
                      </span>
                      <span className="text-xs text-neutral-gray font-mono">{ocrProgress}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className={`progress-fill transition-all duration-500 ${
                          ocrEngine === 'gemini' ? 'bg-purple-500' : ''
                        }`}
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                    {/* Step indicator */}
                    <div className="flex justify-between mt-1.5 text-[10px] text-neutral-gray px-0.5">
                      <span className={ocrProgress >= 5  ? 'text-blue-600 font-bold' : ''}>① Tesseract</span>
                      <span className={ocrProgress >= 65 ? 'text-purple-600 font-bold' : ''}>② Gemini Vision</span>
                      <span className={ocrProgress >= 90 ? 'text-indigo-600 font-bold' : ''}>③ Entity Extract</span>
                      <span className={ocrProgress >= 95 ? 'text-emerald-600 font-bold' : ''}>④ Summarize</span>
                    </div>
                  </div>
                )}

                {/* Done */}
                {!isProcessing && ocrProgress === 100 && (
                  <div className="flex items-center gap-2 text-success-green text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" /> Extraction complete — all 4 AI pipeline stages succeeded
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

            {/* ── AI Summary ── */}
            {summary && !isProcessing && (
              <div className="card animate-slide-up border border-purple-200 bg-gradient-to-br from-purple-50/40 to-white">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-100">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-extrabold text-purple-800 uppercase tracking-wide">
                    AI Clinical Summary
                  </span>
                  <span className="ml-auto text-[10px] bg-purple-100 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                    Gemini Generated
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
              </div>
            )}

            {/* ── Extracted entities ── */}
            {extracted && (
              <div className="card animate-slide-up">
                <div className="card-heading flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  Extracted Clinical Information
                </div>

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
                          <span>
                            <span className="font-medium">{m.name}</span>
                            {m.dose      && ` — ${m.dose}`}
                            {m.frequency && ` (${m.frequency})`}
                            {m.route     && ` · ${m.route}`}
                            {m.duration  && ` · ${m.duration}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {extracted.lab_results?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-neutral-gray uppercase mb-1">Lab Results</p>
                    <ul className="space-y-1">
                      {extracted.lab_results.map((l, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-base leading-tight">🧪</span>
                          <span className={l.status?.toLowerCase() === 'abnormal' ? 'text-warning-red-border font-medium' : 'text-clinical-gray'}>
                            {l.test}: {l.value}{l.unit ? ` ${l.unit}` : ''}
                            {l.reference_range && (
                              <span className="text-xs text-neutral-gray ml-1">
                                (Ref: {l.reference_range})
                              </span>
                            )}
                            {l.status?.toLowerCase() === 'abnormal' && (
                              <span className="ml-1 text-xs font-semibold text-warning-red-border">⚠ Abnormal</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {extracted.clinical_notes && (
                  <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-800 uppercase mb-1">Clinical Notes</p>
                    <p className="text-xs text-amber-900 leading-relaxed">{extracted.clinical_notes}</p>
                  </div>
                )}

                {extracted.document_type && (
                  <p className="mt-2 text-xs text-neutral-gray">
                    Document type: <span className="font-medium">{extracted.document_type}</span>
                    {extracted.document_date && ` · ${extracted.document_date}`}
                  </p>
                )}

                <div className="flex gap-2 mt-4">
                  <button onClick={handleRemove} className="btn-secondary text-sm flex-1">
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
    </div>
  );
}

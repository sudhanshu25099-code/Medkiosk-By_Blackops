import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Edit2, Check, Save, AlertTriangle, RotateCcw } from 'lucide-react';
import { HistoryContext } from '../context/HistoryContext';
import { getTriageBadge, getLabStatusClass, formatTimestamp, bulletList } from '../utils/formatters';

// Reusable section card
function Section({ title, children }) {
  return (
    <div className="card animate-slide-up">
      <div className="card-heading">{title}</div>
      {children}
    </div>
  );
}

// Label-value row
function InfoRow({ label, value }) {
  const display = value && String(value).trim() && String(value) !== 'Not specified'
    ? value
    : <span className="text-neutral-gray italic">Not specified</span>;
  return (
    <div className="flex gap-3 py-1.5 border-b border-bg-light last:border-0">
      <span className="text-sm font-semibold text-clinical-gray w-40 shrink-0">{label}</span>
      <span className="text-sm text-clinical-gray-light flex-1">{display}</span>
    </div>
  );
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { history, setHistory, resetHistory } = useContext(HistoryContext);

  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [saved, setSaved] = useState(false);

  const triage = getTriageBadge(history.triagePriority);
  const hasRedFlags =
    history.redFlags && history.redFlags.length > 0 && history.redFlags[0] !== 'None';
  const isEmergency = history.triagePriority?.toLowerCase() === 'emergency';
  const isUrgent = history.triagePriority?.toLowerCase() === 'urgent';

  const hpi = history.hpi || {};
  const pmh = history.pastMedicalHistory || {};
  const meds = history.medicationsAndAllergies || {};
  const labs = history.priorLabValues || [];

  // ---------- Edit mode ----------
  const handleEditToggle = () => {
    if (!isEditing) {
      setEditDraft({ chiefComplaint: history.chiefComplaint });
    } else {
      // Cancel
      setEditDraft(null);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (editDraft) {
      setHistory((prev) => ({ ...prev, ...editDraft }));
    }
    setIsEditing(false);
    setEditDraft(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleNewPatient = () => {
    resetHistory();
    navigate('/');
  };

  // ---------- Render ----------
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Patient header */}
        <div className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-clinical-gray">
                {history.patientName || 'Patient'}
              </h1>
              <div className="flex flex-wrap gap-4 mt-1 text-xs text-neutral-gray">
                {history.abhaId && (
                  <span>ABHA: <span className="font-mono">{history.abhaId}</span></span>
                )}
                <span>Captured: {formatTimestamp(history.timestamp)}</span>
                <span>
                  Method: {history.selectedSymptoms?.length > 0 ? 'Voice + Touch' : 'Voice'}
                </span>
              </div>
            </div>
            <span className={`badge ${triage.bg} ${triage.text} ${triage.border}`}>
              {triage.label}
            </span>
          </div>
        </div>

        {/* Red flag alert */}
        {(hasRedFlags || isEmergency || isUrgent) && (
          <div className={`alert-box animate-fade-in ${
            isEmergency
              ? 'border-warning-red bg-warning-red-light'
              : 'border-yellow-500 bg-yellow-50'
          }`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${isEmergency ? 'text-warning-red-border' : 'text-yellow-700'}`} />
              <div>
                <p className={`text-sm font-bold ${isEmergency ? 'text-warning-red-border' : 'text-yellow-800'}`}>
                  {isEmergency ? 'EMERGENCY' : 'URGENT'}: {history.chiefComplaint || 'Review required'}
                </p>
                {hasRedFlags && (
                  <ul className={`mt-1 ml-3 list-disc text-xs space-y-0.5 ${isEmergency ? 'text-warning-red-border' : 'text-yellow-800'}`}>
                    {history.redFlags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                )}
                {isEmergency && (
                  <p className="text-xs mt-1 text-warning-red-border font-medium">
                    → Consider immediate specialist consult
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chief complaint */}
        <Section title="Chief Complaint">
          {isEditing ? (
            <textarea
              className="field-input text-sm resize-none h-16"
              value={editDraft?.chiefComplaint ?? history.chiefComplaint}
              onChange={(e) =>
                setEditDraft((d) => ({ ...d, chiefComplaint: e.target.value }))
              }
              aria-label="Edit chief complaint"
            />
          ) : (
            <p className="text-base font-semibold text-clinical-gray">
              {history.chiefComplaint || <span className="text-neutral-gray italic font-normal">Not captured</span>}
            </p>
          )}
          {history.rawTranscript && (
            <div className="mt-3 pt-3 border-t border-bg-light">
              <p className="text-xs text-neutral-gray uppercase font-semibold mb-1">Patient's own words</p>
              <p className="text-sm text-clinical-gray-light italic">
                "{history.rawTranscript}"
              </p>
            </div>
          )}
        </Section>

        {/* HPI — SOCRATES */}
        <Section title="History of Present Illness (SOCRATES)">
          <InfoRow label="Onset" value={hpi.onset} />
          <InfoRow label="Character" value={hpi.character} />
          <InfoRow label="Radiation" value={hpi.radiation} />
          <InfoRow
            label="Associated symptoms"
            value={
              hpi.associated_symptoms?.length > 0
                ? hpi.associated_symptoms.join(', ')
                : 'None reported'
            }
          />
          <InfoRow label="Duration" value={hpi.duration} />
          <InfoRow label="Severity" value={hpi.severity ? `${hpi.severity}/10` : null} />
          <InfoRow label="Aggravating / Relieving" value={hpi.aggravating_relieving_factors} />
        </Section>

        {/* Two-column: PMH + Medications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Past medical history */}
          <Section title="Past Medical History">
            {pmh.conditions?.length > 0 ? (
              <ul className="space-y-1.5 mb-3">
                {pmh.conditions.map((c, i) => (
                  <li key={i} className="text-sm text-clinical-gray flex items-start gap-2">
                    <span className="text-neutral-gray">•</span> {c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-gray italic mb-3">No known conditions</p>
            )}

            <p className="text-xs font-semibold text-neutral-gray uppercase mb-1">Surgical History</p>
            {pmh.surgeries?.length > 0 ? (
              <ul className="space-y-1">
                {pmh.surgeries.map((s, i) => (
                  <li key={i} className="text-sm text-clinical-gray flex items-start gap-2">
                    <span className="text-neutral-gray">•</span> {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-gray italic">No surgical history</p>
            )}
          </Section>

          {/* Medications & Allergies */}
          <Section title="Medications &amp; Allergies">
            <p className="text-xs font-semibold text-neutral-gray uppercase mb-2">Current Medications</p>
            {meds.current_medications?.length > 0 ? (
              <ul className="space-y-2 mb-3">
                {meds.current_medications.map((m, i) => (
                  <li key={i} className="text-sm text-clinical-gray flex items-start gap-2">
                    <span className="text-base leading-tight">💊</span>
                    <span>
                      <span className="font-medium">{m.name}</span>
                      {m.dose && ` ${m.dose}`}
                      {m.indication && <span className="text-neutral-gray"> — {m.indication}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-gray italic mb-3">No medications listed</p>
            )}

            <div className="pt-2 border-t border-bg-light">
              <p className="text-xs font-semibold text-neutral-gray uppercase mb-1">Drug Allergies</p>
              <p className="text-sm text-clinical-gray font-medium">
                {meds.allergies || 'NKDA (No Known Drug Allergies)'}
              </p>
            </div>
          </Section>
        </div>

        {/* Lab Values */}
        {labs.length > 0 && (
          <Section title="Prior Lab Values">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-neutral-gray uppercase border-b border-bg-light">
                    <th className="text-left py-1.5 pr-4 font-semibold">Test</th>
                    <th className="text-left py-1.5 pr-4 font-semibold">Value</th>
                    <th className="text-left py-1.5 pr-4 font-semibold">Unit</th>
                    <th className="text-left py-1.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {labs.map((lab, i) => (
                    <tr
                      key={i}
                      className={`border-b border-bg-light last:border-0 ${getLabStatusClass(lab.status)}`}
                    >
                      <td className="py-2 pr-4">{lab.test_name || lab.test}</td>
                      <td className="py-2 pr-4 font-mono">{lab.value}</td>
                      <td className="py-2 pr-4 text-neutral-gray">{lab.unit || '—'}</td>
                      <td className="py-2">
                        {lab.status?.toLowerCase() === 'abnormal' ? (
                          <span className="text-warning-red-border font-semibold text-xs">⚠ Abnormal</span>
                        ) : (
                          <span className="text-success-green text-xs font-semibold">✓ Normal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Action bar */}
        {saved && (
          <div className="flex items-center gap-2 text-success-green text-sm font-semibold animate-fade-in">
            <Check className="w-4 h-4" /> History saved successfully
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2 no-print">
          <button
            onClick={handleEditToggle}
            className="btn-secondary flex-1 min-w-[120px] text-sm gap-1"
            aria-label={isEditing ? 'Cancel editing' : 'Edit patient history'}
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? 'CANCEL EDIT' : 'EDIT'}
          </button>

          {isEditing && (
            <button
              onClick={handleSave}
              className="btn-primary flex-1 min-w-[160px] text-sm gap-1"
              aria-label="Save changes"
            >
              <Save className="w-4 h-4" /> SAVE CHANGES
            </button>
          )}

          {!isEditing && (
            <button
              onClick={handleSave}
              className="btn-primary flex-1 min-w-[160px] text-sm gap-1"
              aria-label="Confirm and save history"
            >
              <Check className="w-4 h-4" /> CONFIRM &amp; SAVE
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="btn-secondary flex-1 min-w-[120px] text-sm gap-1"
            aria-label="Print summary"
          >
            <Printer className="w-4 h-4" /> PRINT SUMMARY
          </button>
        </div>

        {/* Confidence note */}
        {history.confidenceScore > 0 && (
          <p className="text-xs text-neutral-gray text-right">
            AI confidence: {Math.round(history.confidenceScore * 100)}% · Always verify with patient
          </p>
        )}
    </div>
  );
}

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Printer, ClipboardList } from 'lucide-react';
import { HistoryContext } from '../context/HistoryContext';
import { getTriageBadge, formatTimestamp } from '../utils/formatters';

const CAPTURED_ITEMS = [
  'Chief complaint & symptom description',
  'History of present illness (SOCRATES)',
  'Past medical history & surgical history',
  'Current medications & allergies',
  'Prior test and lab results (if uploaded)',
];

export default function HandoffScreen() {
  const navigate = useNavigate();
  const { history } = useContext(HistoryContext);

  const triage = getTriageBadge(history.triagePriority);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Success indicator */}
      <div className="flex flex-col items-center text-center gap-2 py-2">
          <CheckCircle className="w-14 h-14 text-success-green" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold text-clinical-gray">
            Your health history is ready
          </h1>
          <p className="text-sm text-neutral-gray">
            Captured on {formatTimestamp(history.timestamp)}
          </p>

          {/* Triage badge */}
          <span className={`badge ${triage.bg} ${triage.text} ${triage.border}`}>
            Triage: {triage.label}
          </span>
        </div>

        {/* What was captured */}
        <div className="card">
          <div className="card-heading">Information captured</div>
          <ul className="space-y-2">
            {CAPTURED_ITEMS.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-clinical-gray">
                <CheckCircle className="w-4 h-4 text-success-green mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {history.chiefComplaint && (
            <div className="mt-4 pt-3 border-t border-bg-light">
              <p className="text-xs font-semibold text-neutral-gray uppercase mb-1">Chief Complaint</p>
              <p className="text-sm text-clinical-gray font-medium">{history.chiefComplaint}</p>
            </div>
          )}
        </div>

        {/* Summary notice */}
        <div className="card bg-bg-light border-bg-light">
          <p className="text-sm text-clinical-gray leading-relaxed">
            This summary will help your doctor understand your condition before your
            consultation begins, saving time and improving accuracy.
          </p>
        </div>

        {/* Next steps */}
        <div className="card border-medical-blue">
          <div className="card-heading">Next steps</div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl font-bold text-medical-blue">Room 102</span>
          </div>
          <p className="text-sm text-clinical-gray mb-4">Your doctor is ready for you.</p>

          <button
            onClick={() => navigate('/doctor')}
            className="btn-primary w-full min-h-cta font-bold"
            aria-label="View doctor dashboard"
          >
            GO TO DOCTOR'S DASHBOARD →
          </button>

          <p className="text-xs text-neutral-gray text-center mt-3">
            Estimated wait: 2 minutes
          </p>
        </div>

        {/* Secondary actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/doctor')}
            className="btn-secondary flex-1 text-sm gap-1"
            aria-label="Review the captured summary"
          >
            <ClipboardList className="w-4 h-4" /> REVIEW SUMMARY
          </button>
          <button
            onClick={() => window.print()}
            className="btn-secondary flex-1 text-sm gap-1"
            aria-label="Print summary"
          >
            <Printer className="w-4 h-4" /> PRINT FOR ME
          </button>
        </div>
    </div>
  );
}

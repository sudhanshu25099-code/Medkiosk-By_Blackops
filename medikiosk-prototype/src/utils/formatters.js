/**
 * Formatting helpers for MediKiosk clinical display
 */

/**
 * Format ISO timestamp to readable clinical format
 * e.g. "22 Aug 2026, 14:30"
 */
export function formatTimestamp(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Return triage badge config based on priority string
 */
export function getTriageBadge(priority) {
  switch ((priority || '').toLowerCase()) {
    case 'emergency':
      return { label: 'EMERGENCY', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' };
    case 'urgent':
      return { label: 'URGENT', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400' };
    default:
      return { label: 'ROUTINE', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400' };
  }
}

/**
 * Return CSS classes for lab value status
 */
export function getLabStatusClass(status) {
  if (!status) return '';
  return status.toLowerCase() === 'abnormal'
    ? 'bg-red-50 text-red-800 font-medium'
    : 'text-gray-700';
}

/**
 * Join array items with bullet separator, or return fallback
 */
export function bulletList(arr, fallback = 'None reported') {
  if (!arr || arr.length === 0) return fallback;
  return arr.join(' • ');
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

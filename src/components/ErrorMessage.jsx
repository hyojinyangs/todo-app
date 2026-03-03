/**
 * ErrorMessage Component
 *
 * Displays error messages with:
 * - Auto-dismiss capability
 * - Accessible alert role
 * - Dismissible by user
 */

import { useEffect, useCallback } from 'react';
import './ErrorMessage.css';

/**
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {() => void} props.onDismiss - Callback when error is dismissed
 * @param {number} [props.autoDismissMs=5000] - Auto-dismiss timeout in ms (0 to disable)
 */
export function ErrorMessage({ message, onDismiss, autoDismissMs = 5000 }) {
  // Auto-dismiss after timeout
  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(onDismiss, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onDismiss]);

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    },
    [onDismiss]
  );

  if (!message) {
    return null;
  }

  return (
    <div
      className="error-message"
      role="alert"
      aria-live="assertive"
      onKeyDown={handleKeyDown}
    >
      <span className="error-message-icon" aria-hidden="true">
        <ErrorIcon />
      </span>
      <span className="error-message-text">{message}</span>
      <button
        type="button"
        className="error-message-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss error"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

/**
 * Error icon
 */
function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/**
 * Close icon
 */
function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

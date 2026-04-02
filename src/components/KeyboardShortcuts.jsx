import React, { useState, useEffect } from 'react';
import '../styles/KeyboardShortcuts.css';

const KeyboardShortcuts = ({ onAddClick, onSearchFocus }) => {
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + N = New Event
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onAddClick();
      }

      // Ctrl/Cmd + / = Show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
      }

      // Ctrl/Cmd + K or Ctrl/Cmd + F = Focus search
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'f')) {
        e.preventDefault();
        onSearchFocus();
      }

      // Escape = Close shortcuts
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts, onAddClick, onSearchFocus]);

  return (
    <>
      <button
        className="shortcuts-help-button"
        onClick={() => setShowShortcuts(!showShortcuts)}
        title="Show keyboard shortcuts (Ctrl+/)"
      >
        ⌨️
      </button>

      {showShortcuts && (
        <div className="shortcuts-modal">
          <div className="shortcuts-content">
            <div className="shortcuts-header">
              <h2>⌨️ Keyboard Shortcuts</h2>
              <button
                className="shortcuts-close"
                onClick={() => setShowShortcuts(false)}
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            <div className="shortcuts-grid">
              <div className="shortcut-item">
                <kbd>Ctrl</kbd>
                <kbd>N</kbd>
                <span>Add new event</span>
              </div>

              <div className="shortcut-item">
                <kbd>Ctrl</kbd>
                <kbd>K</kbd>
                <span>Focus search</span>
              </div>

              <div className="shortcut-item">
                <kbd>Ctrl</kbd>
                <kbd>F</kbd>
                <span>Focus search</span>
              </div>

              <div className="shortcut-item">
                <kbd>Ctrl</kbd>
                <kbd>/</kbd>
                <span>Show shortcuts</span>
              </div>

              <div className="shortcut-item">
                <kbd>Esc</kbd>
                <span>Close modal</span>
              </div>
            </div>

            <p className="shortcuts-note">
              💡 Tip: On Mac, use <kbd>⌘</kbd> instead of <kbd>Ctrl</kbd>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;

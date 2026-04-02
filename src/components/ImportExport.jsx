import React, { useRef, useState } from 'react';
import { parseIcsFile, generateIcsFile, downloadIcsFile } from '../utils/icsUtils';
import '../styles/ImportExport.css';

export default function ImportExport({ events, onImport }) {
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);
  const [importError, setImportError] = useState(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset status messages
    setImportStatus(null);
    setImportError(null);

    try {
      const content = await file.text();
      const importedEvents = parseIcsFile(content);

      if (importedEvents.length === 0) {
        setImportError('No events found in the ICS file.');
        return;
      }

      setImportStatus(`Successfully imported ${importedEvents.length} event(s)`);
      onImport(importedEvents);

      // Reset file input
      e.target.value = '';
    } catch (error) {
      setImportError(error.message || 'Failed to import ICS file');
      console.error('Import error:', error);
      e.target.value = '';
    }

    // Clear status after 5 seconds
    setTimeout(() => {
      setImportStatus(null);
      setImportError(null);
    }, 5000);
  };

  const handleExport = () => {
    if (events.length === 0) {
      alert('No events to export. Add events first.');
      return;
    }

    try {
      const icsContent = generateIcsFile(events);
      const filename = `calendar_${new Date().toISOString().split('T')[0]}.ics`;
      downloadIcsFile(icsContent, filename);
    } catch (error) {
      alert(`Export failed: ${error.message}`);
      console.error('Export error:', error);
    }
  };

  return (
    <div className="import-export">
      <div className="import-export-controls">
        <div className="control-group">
          <h3>Import/Export</h3>
          <div className="button-group">
            <button className="btn btn-primary" onClick={handleImportClick}>
              📥 Import ICS File
            </button>
            <button className="btn btn-success" onClick={handleExport} disabled={events.length === 0}>
              📤 Export to ICS
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".ics,.vcs"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            aria-label="Import ICS file"
          />

          {importStatus && <div className="status-message success">{importStatus}</div>}
          {importError && <div className="status-message error">{importError}</div>}
        </div>

        <div className="event-stats">
          <h3>Statistics</h3>
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-label">Total Events</span>
              <span className="stat-value">{events.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Ready to Export</span>
              <span className="stat-value">{events.length > 0 ? '✓' : '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

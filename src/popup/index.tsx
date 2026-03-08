import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { EXTRACT_PAGE_TEXT } from '../constants';
import type { ExtractPageTextResponse } from '../constants';

function App() {
  const [extractedText, setExtractedText] = useState<string>(``);
  const [extractUrl, setExtractUrl] = useState<string>(``);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const handleExtract = async () => {
    setIsLoading(true);
    setError(null);
    setExtractedText(``);
    setExtractUrl(``);
    setServerMessage(null);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        setError(`No active tab found`);
        return;
      }

      const response = await chrome.runtime.sendMessage<
        { action: string; tabId: number },
        ExtractPageTextResponse
      >({ action: EXTRACT_PAGE_TEXT, tabId: tab.id });

      if (!response) {
        setError(`Could not extract from this page. Try a normal webpage.`);
        return;
      }

      if (response.error) {
        setError(response.error);
        return;
      }

      const text = response.text ?? ``;
      const url = response.url ?? ``;

      setExtractedText(text);
      setExtractUrl(url);

      // Send extracted data to the local backend server
      const serverResponse = await fetch(`http://localhost:3000/api/parse-job`, {
        method: `POST`,
        headers: {
          'Content-Type': `application/json`,
        },
        body: JSON.stringify({ text, url }),
      });

      const serverData = await serverResponse.json();
      setServerMessage(serverData.message ?? `Server responded successfully`);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to extract page text`;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-w-[320px] min-h-[280px] max-h-[500px] p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-xl flex flex-col">
      <h1 className="text-xl font-bold text-white mb-3">
        Job Tracker
      </h1>

      <button
        type="button"
        onClick={handleExtract}
        disabled={isLoading}
        className="w-full py-2.5 px-4 mb-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        {isLoading ? `Extracting...` : `Extract Job Details`}
      </button>

      {error && (
        <p className="text-red-400 text-sm mb-2">{error}</p>
      )}

      {serverMessage && (
        <div className="mb-3 px-3 py-2 bg-emerald-900/40 border border-emerald-700 rounded-lg">
          <p className="text-emerald-400 text-xs font-medium">Server Response</p>
          <p className="text-emerald-300 text-sm">{serverMessage}</p>
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col gap-2">
        {extractUrl && (
          <div className="flex-shrink-0">
            <label className="text-slate-400 text-xs font-medium">URL</label>
            <p className="text-slate-300 text-xs truncate" title={extractUrl}>
              {extractUrl}
            </p>
          </div>
        )}
        <div className="flex-1 min-h-0 flex flex-col">
          <label className="text-slate-400 text-xs font-medium mb-1">Extracted Text (debug)</label>
          <textarea
            readOnly
            value={extractedText}
            placeholder="Click Extract to capture page text..."
            className="flex-1 min-h-[120px] p-3 text-sm text-slate-200 bg-slate-800/50 border border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
          />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById(`root`)!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

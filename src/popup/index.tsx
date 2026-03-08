import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { EXTRACT_PAGE_TEXT } from '../constants';
import type { ExtractPageTextResponse } from '../constants';

type AppState = `idle` | `loading` | `success` | `error`;

interface ServerResponse {
  success: boolean;
  message: string;
  data?: {
    company: string;
    role: string;
    location: string;
    salary: string;
    techStack: string[];
  };
}

function CheckIcon() {
  return (
    <svg
      className="h-10 w-10 text-emerald-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function App() {
  const [appState, setAppState] = useState<AppState>(`idle`);
  const [error, setError] = useState<string | null>(null);
  const [jobData, setJobData] = useState<ServerResponse[`data`]>(undefined);

  const handleExtract = async () => {
    setAppState(`loading`);
    setError(null);
    setJobData(undefined);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        setError(`No active tab found.`);
        setAppState(`error`);
        return;
      }

      const response = await chrome.runtime.sendMessage<
        { action: string; tabId: number },
        ExtractPageTextResponse
      >({ action: EXTRACT_PAGE_TEXT, tabId: tab.id });

      if (!response) {
        setError(`Could not extract from this page. Try a normal webpage.`);
        setAppState(`error`);
        return;
      }

      if (response.error) {
        setError(response.error);
        setAppState(`error`);
        return;
      }

      const text = response.text ?? ``;
      const url = response.url ?? ``;

      const serverResponse = await fetch(`http://localhost:3000/api/parse-job`, {
        method: `POST`,
        headers: { 'Content-Type': `application/json` },
        body: JSON.stringify({ text, url }),
      });

      const serverData: ServerResponse = await serverResponse.json();

      if (!serverData.success) {
        setError(serverData.message ?? `Server returned an error.`);
        setAppState(`error`);
        return;
      }

      setJobData(serverData.data);
      setAppState(`success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `An unexpected error occurred.`);
      setAppState(`error`);
    }
  };

  const handleReset = () => {
    setAppState(`idle`);
    setError(null);
    setJobData(undefined);
  };

  return (
    <div className="w-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans shadow-2xl">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">Career Sync</h1>
            <p className="text-xs text-slate-400 mt-0.5">Powered by Groq + Notion MCP</p>
          </div>
        </div>
      </div>

      <div className="p-5">

        {/* IDLE STATE */}
        {appState === `idle` && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Navigate to any job listing page and click below to extract and save it to your Notion database automatically.
            </p>
            <button
              type="button"
              onClick={handleExtract}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-sm font-semibold rounded-lg transition-all duration-150 shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Extract Job Details
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {appState === `loading` && (
          <div className="py-4 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-emerald-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Extracting & Saving</p>
              <p className="text-xs text-slate-400 mt-1">with Groq + Notion MCP...</p>
            </div>
            <div className="w-full space-y-1.5">
              {[`Reading page content...`, `AI extracting job details...`, `Saving to Notion...`].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {appState === `success` && (
          <div className="space-y-3">
            <div className="flex flex-col items-center py-3 gap-2">
              <CheckIcon />
              <div className="text-center">
                <p className="text-sm font-bold text-emerald-400">Successfully saved to Notion!</p>
                <p className="text-xs text-slate-400 mt-0.5">Your job application is tracked.</p>
              </div>
            </div>

            {jobData && (
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div>
                    <p className="text-slate-500 uppercase tracking-wide text-[10px] font-semibold">Company</p>
                    <p className="text-white font-medium truncate">{jobData.company}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase tracking-wide text-[10px] font-semibold">Role</p>
                    <p className="text-white font-medium truncate">{jobData.role}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase tracking-wide text-[10px] font-semibold">Location</p>
                    <p className="text-slate-300 truncate">{jobData.location}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase tracking-wide text-[10px] font-semibold">Salary</p>
                    <p className="text-slate-300 truncate">{jobData.salary}</p>
                  </div>
                </div>
                {jobData.techStack.length > 0 && (
                  <div>
                    <p className="text-slate-500 uppercase tracking-wide text-[10px] font-semibold mb-1">Tech Stack</p>
                    <div className="flex flex-wrap gap-1">
                      {jobData.techStack.slice(0, 6).map((tech) => (
                        <span key={tech} className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px] font-medium">
                          {tech}
                        </span>
                      ))}
                      {jobData.techStack.length > 6 && (
                        <span className="px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded text-[10px]">
                          +{jobData.techStack.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Extract Another Job
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {appState === `error` && (
          <div className="space-y-3">
            <div className="bg-red-950/60 border border-red-800/60 rounded-lg p-3">
              <div className="flex gap-2.5">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-red-400">Something went wrong</p>
                  <p className="text-xs text-red-300/80 mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all duration-150"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById(`root`)!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

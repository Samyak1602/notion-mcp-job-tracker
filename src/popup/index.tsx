import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return (
    <div className="min-w-[320px] min-h-[200px] p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold text-white mb-2">
        Hello World
      </h1>
      <p className="text-slate-300 text-sm">
        Your Chrome Extension is ready!
      </p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

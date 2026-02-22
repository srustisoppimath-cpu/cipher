import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Global Error Handler to catch "Black Screen" issues
window.onerror = function(message, source, lineno, colno, error) {
  rootElement.innerHTML = `
    <div style="background: #020617; color: #f8fafc; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; padding: 20px; text-align: center;">
      <div style="max-width: 500px; border: 1px solid #ef4444; padding: 30px; border-radius: 20px; background: #0f172a;">
        <h1 style="color: #ef4444; margin-bottom: 15px;">System Startup Error</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">The secure engine failed to initialize. This usually happens if the browser blocks the Crypto API.</p>
        <code style="display: block; background: #020617; padding: 15px; border-radius: 10px; font-size: 12px; color: #f43f5e; text-align: left; overflow-x: auto;">
          ${message}
        </code>
        <button onclick="window.location.reload()" style="margin-top: 20px; background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: bold;">Retry Initialization</button>
      </div>
    </div>
  `;
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
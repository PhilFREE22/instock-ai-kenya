import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("CRITICAL APP ERROR:", error);
  document.body.innerHTML = '<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>App Failed to Load</h1><p>Please check the console for details.</p></div>';
}

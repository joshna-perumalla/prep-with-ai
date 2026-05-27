import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Suppress ResizeObserver loop error (benign, caused by Monaco Editor)
window.addEventListener('error', (e) => {
  if (e.message?.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  }
});
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('ResizeObserver loop')) {
    e.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

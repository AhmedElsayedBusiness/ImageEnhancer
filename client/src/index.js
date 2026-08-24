import React from 'react';
import ReactDOM from 'react-dom/client';
import { Router } from 'wouter';
import './index.css';
import App from './App';

// Add dark class to HTML element
document.documentElement.classList.add('dark');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
); 
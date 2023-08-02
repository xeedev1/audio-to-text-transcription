import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { TranscriptionProvider } from './components/TranscriptionContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <TranscriptionProvider>
        <App />
    </TranscriptionProvider>
);
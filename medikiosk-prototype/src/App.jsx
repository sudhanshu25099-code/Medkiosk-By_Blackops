import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HistoryProvider } from './context/HistoryContext';
import WelcomeScreen from './pages/WelcomeScreen';
import InterviewScreen from './pages/InterviewScreen';
import DocumentUploadScreen from './pages/DocumentUploadScreen';
import HandoffScreen from './pages/HandoffScreen';
import DoctorDashboard from './pages/DoctorDashboard';
import ClinicalBackground from './components/ClinicalBackground';

export default function App() {
  return (
    <HistoryProvider>
      <ClinicalBackground />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/interview" element={<InterviewScreen />} />
          <Route path="/upload" element={<DocumentUploadScreen />} />
          <Route path="/handoff" element={<HandoffScreen />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HistoryProvider>
  );
}

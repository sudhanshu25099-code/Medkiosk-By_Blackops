import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, User, Activity, ChevronRight, Stethoscope, FileText, CheckCircle } from 'lucide-react';
import { HistoryContext } from '../context/HistoryContext';

const STEP_ROUTES = [
  { path: '/', label: 'Step 1: Onboarding' },
  { path: '/interview', label: 'Step 2: Voice Intake' },
  { path: '/upload', label: 'Step 3: Document Upload' },
  { path: '/handoff', label: 'Step 4: Handoff' },
  { path: '/doctor', label: 'Doctor Dashboard' },
];

export default function NavClinicLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { history } = useContext(HistoryContext);

  const currentStep = STEP_ROUTES.findIndex((s) => s.path === location.pathname) + 1;
  const isDoctorView = location.pathname === '/doctor';

  return (
    <div className="min-h-screen p-3 md:p-6 lg:p-8 flex items-center justify-center relative">
      {/* Floating Main Dual-Panel Container */}
      <div className="w-full max-w-7xl rounded-[32px] overflow-hidden bg-white/75 backdrop-blur-2xl border border-white/80 shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[740px]">
        
        {/* ================= LEFT PANEL: Vibrant Indigo Hero (#3B52E1) ================= */}
        <aside className="lg:col-span-5 bg-[#3B52E1] text-white p-6 md:p-8 flex flex-col justify-between rounded-[28px] m-2 shadow-xl relative overflow-hidden">
          
          {/* Subtle Background Glow Spheres */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Brand & Badges */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">MediKiosk</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full font-medium transition-colors border border-white/20 cursor-default">
                Test History
              </span>
              <button 
                onClick={() => navigate('/doctor')}
                className="text-xs bg-white text-[#3B52E1] hover:bg-blue-50 font-bold px-3.5 py-1.5 rounded-full shadow-sm transition-transform active:scale-95"
              >
                All Visits
              </button>
            </div>
          </div>

          {/* Center Hero Copy */}
          <div className="relative z-10 my-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs font-semibold mb-4 border border-white/15 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Clinical Intake System
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Navigating Health Oasis with MediKiosk
            </h1>
            <p className="text-sm text-blue-100/90 mt-3 leading-relaxed">
              Express your medical concerns in your native language. AI structures your clinical history for your attending doctor.
            </p>
          </div>

          {/* Bottom Interactive Info Cards Grid */}
          <div className="relative z-10 flex flex-col gap-4">
            
            {/* Quick Symptom Tags & Location */}
            <div className="flex items-center justify-between text-xs text-blue-200">
              <span className="font-semibold tracking-wide uppercase">Find Nearby • OPD Check-in</span>
              <span className="flex items-center gap-1 text-white/80">
                <MapPin className="w-3.5 h-3.5" /> India OPD
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Card 1: Known Team / Doctor Stack */}
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-blue-100">Attending OPD</span>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white/50 bg-blue-300 text-[#3B52E1] font-bold text-xs flex items-center justify-center">DR</div>
                    <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white/50 bg-indigo-300 text-[#3B52E1] font-bold text-xs flex items-center justify-center">AI</div>
                  </div>
                  <span className="text-xs font-bold text-white">Active Team</span>
                </div>
              </div>

              {/* Card 2: Live Score / Triage Priority */}
              <div className="bg-white text-slate-800 rounded-2xl p-3.5 shadow-lg flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Score</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    {history.triagePriority || 'Routine'}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-black text-[#3B52E1]">98%</span>
                  <span className="text-[10px] text-slate-500 block leading-tight">Clinical Structuring</span>
                </div>
              </div>
            </div>

            {/* Primary Action Pill CTA */}
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 pl-4">
              <div className="text-xs font-medium text-blue-100">
                {isDoctorView ? 'Viewing Doctor Summary' : `Current Stage: Step ${currentStep > 0 ? currentStep : 1}`}
              </div>
              <button
                onClick={() => navigate(location.pathname === '/doctor' ? '/' : '/doctor')}
                className="bg-white text-[#3B52E1] font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md hover:bg-blue-50 transition-colors"
              >
                <span>{isDoctorView ? 'New Intake' : 'View Summary'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </aside>

        {/* ================= RIGHT PANEL: Crisp Light Mode Hub (#F6F8FE) ================= */}
        <main className="lg:col-span-7 bg-[#F6F8FE] p-5 md:p-8 flex flex-col justify-between rounded-[28px] m-2">
          
          {/* Top Search & Profile Bar */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search symptoms, clinics, records..."
                className="w-full pl-9 pr-4 py-2 bg-white rounded-full border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3B52E1] transition-colors shadow-sm"
              />
            </div>

            {/* Profile & Greeting */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Search For Clinics</span>
                <span className="text-sm font-bold text-slate-800">
                  Hi, {history.patientName || 'Patient'}!
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#3B52E1] text-white font-bold flex items-center justify-center shadow-md">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Sub Navigation Pills */}
          <div className="flex items-center justify-between my-4">
            <div className="flex items-center gap-2">
              {STEP_ROUTES.slice(0, 4).map((step, idx) => (
                <button
                  key={step.path}
                  onClick={() => navigate(step.path)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                    location.pathname === step.path
                      ? 'bg-[#3B52E1] text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  Step {idx + 1}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-400 bg-slate-200/60 px-2.5 py-1 rounded-full">
              MediKiosk v1.0
            </span>
          </div>

          {/* Main Active Route View Container */}
          <div className="flex-1 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200/60 overflow-y-auto max-h-[520px]">
            {children}
          </div>

          {/* Footer Controls & Help */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-200/80 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">My-Nav.Clinic</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span>OPD Triage Mode</span>
            </div>

            <div className="flex items-center gap-4">
              <a href="#help" onClick={(e) => { e.preventDefault(); alert("MediKiosk Support: Speak your symptoms into the microphone or ask hospital staff for assistance."); }} className="font-semibold text-[#3B52E1] hover:underline">
                Help Center •
              </a>
            </div>
          </div>

        </main>

      </div>
    </div>
  );
}

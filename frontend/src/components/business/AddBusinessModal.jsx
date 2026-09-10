import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Building2,
  Sparkles,
  CheckCircle2,
  Check,
  Building,
  Briefcase,
  MapPin,
  IndianRupee,
  Users,
  Tag,
  Loader2
} from 'lucide-react';

const AddBusinessModal = ({ isOpen, onClose }) => {
  const { addBusiness } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Form State
  const [form, setForm] = useState({
    name: '',
    type: 'Private Limited',
    industry: 'Textile',
    state: 'Tamil Nadu',
    city: 'Tiruppur',
    stage: 'Starting Business',
    investment: '₹2 Crore',
    employees: 80,
    activities: ['Manufacturing', 'Packaging']
  });

  if (!isOpen) return null;

  const businessTypes = [
    'Proprietorship',
    'Partnership',
    'LLP',
    'Private Limited',
    'Public Limited',
    'MSME',
    'Startup',
    'Other'
  ];

  const industries = [
    'Manufacturing',
    'Textile',
    'Food Processing',
    'Software / IT',
    'Retail',
    'Healthcare',
    'Construction',
    'Logistics',
    'Agriculture',
    'Other'
  ];

  const stages = [
    'Planning',
    'Starting Business',
    'Operational',
    'Expansion'
  ];

  const availableActivities = [
    'Manufacturing',
    'Storage',
    'Packaging',
    'Import / Export',
    'Retail',
    'Online Services',
    'Construction',
    'Transportation',
    'R&D',
    'Other'
  ];

  const toggleActivity = (act) => {
    setForm(prev => {
      const exists = prev.activities.includes(act);
      if (exists) {
        return { ...prev, activities: prev.activities.filter(a => a !== act) };
      } else {
        return { ...prev, activities: [...prev.activities, act] };
      }
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.name.trim()) {
        alert('Please enter a valid business name.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleCreateBusiness = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(1);

    // Simulate AI loading steps
    setTimeout(() => setAnalysisProgress(2), 600);
    setTimeout(() => setAnalysisProgress(3), 1200);
    setTimeout(() => setAnalysisProgress(4), 1800);
    setTimeout(() => setAnalysisProgress(5), 2400);

    setTimeout(() => {
      const locationStr = `${form.city}, ${form.state}`;
      const newBusiness = {
        name: form.name,
        type: form.type,
        industry: form.industry,
        location: locationStr,
        investment: form.investment,
        employees: parseInt(form.employees) || 10,
        stage: form.stage,
        activities: form.activities,
        registrationNo: `U${Math.floor(10000 + Math.random() * 90000)}TZ2026PTC${Math.floor(100000 + Math.random() * 900000)}`
      };

      addBusiness(newBusiness);
      setIsAnalyzing(false);
      onClose();
      navigate('/dashboard');
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight">Add New Business Workspace</h2>
              <p className="text-xs text-blue-300">InnovX AI Requirement Generator</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {!isAnalyzing && (
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
              <span>Basic Info</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
              <span>Project Details</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
              <span>Review & Generate</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {isAnalyzing ? (
            /* STEP 4: Simulated AI Analysis Screen */
            <div className="py-8 text-center space-y-6 animate-in fade-in duration-200">
              <div className="relative inline-block">
                <div className="h-20 w-20 rounded-full bg-blue-50 border-4 border-blue-500/20 flex items-center justify-center mx-auto text-blue-600 animate-spin">
                  <Loader2 className="h-10 w-10" />
                </div>
                <Sparkles className="h-6 w-6 text-amber-500 absolute -top-1 -right-1" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Analyzing your business profile...</h3>
                <p className="text-xs text-slate-500 mt-1">Generating personalized statutory requirements for {form.name}</p>
              </div>

              <div className="max-w-sm mx-auto space-y-2 text-xs text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className={`flex items-center space-x-2 transition ${analysisProgress >= 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Business type & legal entity identified ({form.type})</span>
                </div>
                <div className={`flex items-center space-x-2 transition ${analysisProgress >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Industry regulatory rules analyzed ({form.industry})</span>
                </div>
                <div className={`flex items-center space-x-2 transition ${analysisProgress >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>District jurisdiction rules loaded ({form.city}, {form.state})</span>
                </div>
                <div className={`flex items-center space-x-2 transition ${analysisProgress >= 4 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Scale & activity requirements matched</span>
                </div>
              </div>

              <p className="text-xs text-indigo-600 font-semibold animate-pulse">
                Creating customized compliance checklist...
              </p>
            </div>
          ) : step === 1 ? (
            /* STEP 1: Basic Information */
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tell us about your business</h3>
                <p className="text-slate-500">Provide company identity details to filter accurate approvals.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. ABC Textiles Pvt. Ltd."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    {businessTypes.map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Industry / Sector *</label>
                  <select
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District / City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Tiruppur, Coimbatore"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            /* STEP 2: Project Information */
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tell us about your project scale</h3>
                <p className="text-slate-500">Project parameters determine pollution categories and labor licenses.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Stage</label>
                  <select
                    value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    {stages.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Investment / Project Cost</label>
                  <input
                    type="text"
                    value={form.investment}
                    onChange={(e) => setForm({ ...form, investment: e.target.value })}
                    placeholder="e.g. ₹2 Crore"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Number of Employees</label>
                <input
                  type="number"
                  value={form.employees}
                  onChange={(e) => setForm({ ...form, employees: e.target.value })}
                  placeholder="80"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Business Activities (Select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {availableActivities.map(act => {
                    const isSel = form.activities.includes(act);
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => toggleActivity(act)}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center space-x-1 ${
                          isSel ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSel && <Check className="h-3.5 w-3.5" />}
                        <span>{act}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* STEP 3: Review Summary */
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900">Review Business Profile</h3>
                <p className="text-slate-500">Confirm your details before running the requirement engine.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Business Name</span>
                  <span className="font-bold text-slate-900 text-sm">{form.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Business Type</span>
                  <span className="font-bold text-slate-900">{form.type}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Industry / Sector</span>
                  <span className="font-bold text-blue-600">{form.industry}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Location</span>
                  <span className="font-bold text-slate-900">{form.city}, {form.state}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Investment & Staff</span>
                  <span className="font-bold text-slate-900">{form.investment} • {form.employees} Employees</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Activities</span>
                  <span className="font-bold text-slate-900">{form.activities.join(', ')}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start space-x-2 text-blue-800">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Clicking <strong>Create Business</strong> will generate personalized approvals for {form.industry} in {form.city}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isAnalyzing && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(prev => prev - 1)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleCreateBusiness}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Create Business</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBusinessModal;

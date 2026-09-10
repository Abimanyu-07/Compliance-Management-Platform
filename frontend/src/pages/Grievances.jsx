import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HelpCircle,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Building,
  Check
} from 'lucide-react';

const Grievances = () => {
  const { grievances, addGrievance, applications } = useApp();

  const [form, setForm] = useState({
    approvalName: 'Pollution Consent (CTO)',
    authority: 'TNPCB - District Office Coimbatore',
    category: 'Application Delay',
    description: '',
    priority: 'High'
  });

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;

    addGrievance(form);
    setForm({
      approvalName: 'Pollution Consent (CTO)',
      authority: 'TNPCB - District Office Coimbatore',
      category: 'Application Delay',
      description: '',
      priority: 'High'
    });
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Grievance Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Escalate portal delays, officer query clarifications, or procedural bottlenecks to appellate officers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Raise a Grievance Form (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Plus className="h-4 w-4 text-blue-600" />
            <span>Raise a Grievance</span>
          </h3>

          {submittedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Grievance submitted successfully! Escalation ticket created.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Application</label>
              <select
                value={form.approvalName}
                onChange={(e) => setForm({ ...form, approvalName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
              >
                {applications.map(app => (
                  <option key={app.id} value={app.approvalName}>
                    {app.approvalName} ({app.authority})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
              >
                <option value="Application Delay">Application Delay / Past SLA</option>
                <option value="Document Clarification">Document Scrutiny Clarification</option>
                <option value="Portal Technical Glitch">Portal Technical Filing Issue</option>
                <option value="Inspection Scheduling">Inspection Delay</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
              <div className="flex items-center space-x-3">
                {['High', 'Medium', 'Normal'].map(p => (
                  <label key={p} className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={form.priority === p}
                      onChange={() => setForm({ ...form, priority: p })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-700">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                placeholder="Describe your grievance or portal delay details..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Submit Grievance</span>
            </button>
          </form>
        </div>

        {/* Existing Grievances Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Active & Resolved Grievances
          </h3>

          <div className="space-y-4">
            {grievances.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {g.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{g.approvalName}</h4>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    g.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {g.status}
                  </span>
                </div>

                <p className="text-slate-500 font-medium">Category: <strong className="text-slate-800">{g.category}</strong> • Submitted: {g.submittedDate}</p>
                <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                  {g.description}
                </p>

                {g.resolution && (
                  <p className="text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    ✓ Resolution: {g.resolution}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grievances;

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Info,
  Building,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';

const Incentives = () => {
  const { schemesAndIncentives } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalScheme, setActiveModalScheme] = useState(null);

  const categories = ['All', 'Manufacturing', 'Digital Governance', 'Food Manufacturing', 'Utilities / Environmental'];

  const filteredSchemes = schemesAndIncentives.filter(sch => {
    if (selectedCategory === 'All') return true;
    return sch.category === selectedCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Government Subsidy Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Schemes & Incentives</h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover capital subsidies, fee waivers, and grants relevant to your business profile.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchemes.map((sch) => (
          <div
            key={sch.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md">
                  {sch.category}
                </span>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  sch.matchStatus === 'Eligible'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                }`}>
                  {sch.matchStatus}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-lg leading-snug">{sch.title}</h3>
              <p className="text-xs text-slate-500 font-medium">{sch.authority}</p>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 font-extrabold text-emerald-800 text-sm">
                💰 {sch.subsidyAmount}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{sch.description}</p>

              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-700">Key Match Criteria:</span>
                {sch.eligibility.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Deadline: <strong>{sch.deadline}</strong></span>
              <button
                onClick={() => setActiveModalScheme(sch)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Check Eligibility</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Scheme Details Modal */}
      {activeModalScheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">{activeModalScheme.category}</span>
                <h3 className="font-bold text-slate-900 text-lg">{activeModalScheme.title}</h3>
              </div>
              <button onClick={() => setActiveModalScheme(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1">
                ✕
              </button>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs text-slate-500 font-medium">Estimated Incentive Value</span>
              <p className="text-xl font-extrabold text-emerald-900 mt-0.5">{activeModalScheme.subsidyAmount}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Full Eligibility Criteria</h4>
              {activeModalScheme.eligibility.map((crit, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-800 flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{crit}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 italic">
              * Note: Incentive match is based on your business profile parameters (Coimbatore district, Food Manufacturing, ₹50L Investment).
            </p>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveModalScheme(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => { alert(`Redirecting to official ${activeModalScheme.authority} portal...`); setActiveModalScheme(null); }}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5"
              >
                <span>Apply on Single Window Portal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incentives;

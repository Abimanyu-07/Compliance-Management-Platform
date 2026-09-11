import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  Building,
  Factory,
  Laptop,
  Store,
  MapPin
} from 'lucide-react';

const BusinessSwitcher = ({ onOpenAddModal, variant = 'header' }) => {
  const { businesses, activeBusiness, activeBusinessId, switchBusiness } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIndustryIcon = (industry = '') => {
    const ind = industry.toLowerCase();
    if (ind.includes('textile') || ind.includes('factory')) return Factory;
    if (ind.includes('software') || ind.includes('it')) return Laptop;
    if (ind.includes('retail')) return Store;
    return Building2;
  };

  const ActiveIcon = getIndustryIcon(activeBusiness?.industry);

  if (variant === 'sidebar') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl flex items-center justify-between text-left transition cursor-pointer group"
        >
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <ActiveIcon className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate leading-tight">{activeBusiness?.name}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{activeBusiness?.location}</p>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 bottom-full mb-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 border-b border-slate-800">
              <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">My Businesses</p>
            </div>
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/60">
              {businesses.map((b) => {
                const IconComp = getIndustryIcon(b.industry);
                const isSelected = b.id === activeBusinessId;
                return (
                  <button
                    key={b.id}
                    onClick={() => { switchBusiness(b.id); setIsOpen(false); }}
                    className={`w-full p-2.5 flex items-center justify-between text-left transition ${
                      isSelected ? 'bg-blue-600/20 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <IconComp className={`h-4 w-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                      <div className="overflow-hidden text-xs">
                        <p className="font-bold truncate">{b.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{b.location}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-blue-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
            <div className="pt-2 px-2 border-t border-slate-800">
              <button
                onClick={() => { setIsOpen(false); onOpenAddModal(); }}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add New Business</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold transition cursor-pointer shadow-2xs"
      >
        <div className="h-6 w-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs shrink-0">
          <ActiveIcon className="h-3.5 w-3.5" />
        </div>
        <div className="text-left hidden sm:block max-w-[160px] truncate">
          <span className="truncate block font-bold text-slate-900 leading-tight">{activeBusiness?.name}</span>
          <span className="text-[10px] text-slate-500 block truncate">{activeBusiness?.location}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Businesses</span>
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {businesses.length} Total
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
            {businesses.map((b) => {
              const IconComp = getIndustryIcon(b.industry);
              const isSelected = b.id === activeBusinessId;
              return (
                <div
                  key={b.id}
                  onClick={() => { switchBusiness(b.id); setIsOpen(false); }}
                  className={`p-3 flex items-center justify-between transition cursor-pointer ${
                    isSelected ? 'bg-blue-50/80 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">{b.name}</p>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="truncate">{b.location}</span>
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                </div>
              );
            })}
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50">
            <button
              onClick={() => { setIsOpen(false); onOpenAddModal(); }}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add New Business</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSwitcher;

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import BusinessSwitcher from '../components/business/BusinessSwitcher';
import AddBusinessModal from '../components/business/AddBusinessModal';
import {
  Building2,
  MapPin,
  IndianRupee,
  Users,
  Briefcase,
  CheckCircle2,
  Edit3,
  Sparkles,
  X,
  Save,
  Tag,
  RefreshCw,
  Plus
} from 'lucide-react';

const BusinessProfile = () => {
  const { activeBusiness, updateBusinessProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...activeBusiness });

  const handleSave = (e) => {
    e.preventDefault();
    updateBusinessProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Profile Powered AI Rules Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Business Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            Your business information powers personalized statutory compliance recommendations.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          {/* Switch Business Dropdown */}
          <BusinessSwitcher onOpenAddModal={() => setIsAddModalOpen(true)} variant="header" />

          {/* Edit Profile Button */}
          <button
            onClick={() => { setFormData({ ...activeBusiness }); setIsEditing(true); }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Business</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Info + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Info Details (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>Business Information</span>
            </h3>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              Verified Entity
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Business Name</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{activeBusiness?.name}</p>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Business Type</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{activeBusiness?.type}</p>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Industry Sector</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center space-x-1.5">
                <Briefcase className="h-4 w-4 text-blue-500" />
                <span>{activeBusiness?.industry}</span>
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Location / District</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center space-x-1.5">
                <MapPin className="h-4 w-4 text-rose-500" />
                <span>{activeBusiness?.location}</span>
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Capital Investment</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center space-x-1.5">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
                <span>{activeBusiness?.investment}</span>
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Employees Count</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center space-x-1.5">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>{activeBusiness?.employees} Employees</span>
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Business Stage</span>
              <p className="text-sm font-bold text-blue-600 mt-1">{activeBusiness?.stage}</p>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">CIN / Reg Number</span>
              <p className="text-sm font-mono text-slate-700 mt-1">{activeBusiness?.registrationNo || 'Pending'}</p>
            </div>
          </div>
        </div>

        {/* Business Activities & Smart Rules Box (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
              <Tag className="h-4 w-4 text-indigo-600" />
              <span>Business Activities</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {activeBusiness?.activities?.map((act, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-100 flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{act}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md space-y-3">
            <h4 className="font-bold text-sm text-indigo-300 uppercase tracking-wider">Smart Requirement Engine</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every business is different. InnovX creates a personalized compliance workspace based on your sector (<strong className="text-white">{activeBusiness?.industry}</strong>), location (<strong className="text-white">{activeBusiness?.location}</strong>), size, and activities.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Company Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 text-lg">Edit Business Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Investment</label>
                  <input
                    type="text"
                    value={formData.investment}
                    onChange={(e) => setFormData({ ...formData, investment: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employees</label>
                  <input
                    type="number"
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl flex items-center space-x-1.5 shadow-md"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Business Modal */}
      <AddBusinessModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

export default BusinessProfile;

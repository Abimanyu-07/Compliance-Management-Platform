import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Sparkles,
  ShieldCheck,
  Eye,
  Trash2,
  Check
} from 'lucide-react';

const Documents = () => {
  const { documents, handleUploadDocument } = useApp();
  const fileInputRef = useRef(null);

  const [selectedDoc, setSelectedDoc] = useState(documents[0]);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsSimulatingUpload(true);
      setTimeout(() => {
        handleUploadDocument(file.name, 'Pollution Consent (CTO)');
        setIsSimulatingUpload(false);
      }, 800);
    }
  };

  const projectReportDoc = documents.find(d => d.id === 'doc-4');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload and validate documents before submitting official statutory applications.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-100 flex items-center space-x-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{documents.filter(d => d.status === 'Verified').length} Verified</span>
          </span>
          <span className="px-3 py-1.5 bg-amber-50 text-amber-700 font-bold rounded-xl border border-amber-200 flex items-center space-x-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{documents.filter(d => d.status === 'Missing').length} Missing</span>
          </span>
        </div>
      </div>

      {/* Upload Drag & Drop Box */}
      <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-slate-300 hover:border-blue-500 transition text-center space-y-4 shadow-xs">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
        />

        <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <UploadCloud className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">Upload Document for AI Scrutiny</h3>
          <p className="text-xs text-slate-500">Drag & drop your PDF or image here, or browse from computer</p>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSimulatingUpload}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-2"
          >
            {isSimulatingUpload ? (
              <span>Running AI Validation...</span>
            ) : (
              <span>Choose File</span>
            )}
          </button>

          <button
            onClick={() => handleUploadDocument('Project_Report.pdf', 'Pollution Consent')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5"
          >
            <Sparkles className="h-4 w-4" />
            <span>Simulate Upload Project Report</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400">Supported file formats: PDF, JPG, PNG (Max 25MB)</p>
      </div>

      {/* Grid: Document Repository (2 cols) + AI Validation Result (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Repository List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Document Repository</h3>
            <span className="text-xs text-slate-500 font-medium">{documents.length} Total Files</span>
          </div>

          <div className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`py-3.5 px-3 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  selectedDoc?.id === doc.id ? 'bg-blue-50/70 border border-blue-200' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{doc.name}</p>
                    <p className="text-[11px] text-slate-500">{doc.type} • {doc.size}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {doc.status === 'Verified' ? '🟢 Verified' : '🔴 Missing'}
                  </span>
                  <button className="text-slate-400 hover:text-blue-600 p-1">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI DOCUMENT VALIDATION RESULT (Section 19) */}
        <div className="space-y-6">
          {/* Active Selected Document Inspection */}
          {selectedDoc && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">AI Document Validation</h3>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  selectedDoc.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedDoc.status === 'Verified' ? '🟢 Verified' : '🔴 Missing'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Document File</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedDoc.name}</p>
              </div>

              {/* Checks */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-700">Automated Scrutiny Checks:</span>
                {selectedDoc.checks?.map((chk, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">{chk.name}</span>
                    {chk.passed ? (
                      <span className="text-emerald-600 font-bold flex items-center space-x-1">
                        <Check className="h-3.5 w-3.5" />
                        <span>Passed</span>
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center space-x-1">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Failed</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Document Warning Banner Example */}
          {projectReportDoc?.status === 'Missing' && (
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span>Project_Report.pdf — Missing</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                This document is required before submitting the Pollution Consent (CTO) application.
              </p>
              <button
                onClick={() => handleUploadDocument('Project_Report.pdf', 'Pollution Consent')}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Upload Document Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;

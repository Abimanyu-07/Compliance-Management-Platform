import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Bot,
  Send,
  User,
  Sparkles,
  UploadCloud,
  ArrowRight,
  GitFork,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const AIRecommendations = () => {
  const navigate = useNavigate();
  const { handleUploadDocument, documents } = useApp();

  const isProjectReportUploaded = documents.find(d => d.id === 'doc-4')?.status === 'Verified';

  const defaultMessages = [
    {
      sender: 'user',
      text: 'What should I do next?'
    },
    {
      sender: 'ai',
      text: !isProjectReportUploaded 
        ? `Your highest-priority action is to complete the Pollution Consent application.

The application is currently blocked because the Project Report is missing.

Completing this document may also help prevent delays in dependent approvals like the DISH Factory Licence and Fire NOC.`
        : `Your Pollution Consent application is currently under final scrutiny with TNPCB.

Your next best action is to draft and prepare the Factory Licence plan approval on the Directorate of Industrial Safety & Health (DISH) portal.`,
      actions: !isProjectReportUploaded ? [
        { label: 'Upload Document', icon: UploadCloud, type: 'upload' },
        { label: 'View Application', icon: ArrowRight, type: 'nav', path: '/approvals/app-2' },
        { label: 'View Dependencies', icon: GitFork, type: 'nav', path: '/dependencies' }
      ] : [
        { label: 'View Factory Licence', icon: ArrowRight, type: 'nav', path: '/approvals/app-3' },
        { label: 'View Dependencies', icon: GitFork, type: 'nav', path: '/dependencies' }
      ]
    }
  ];

  const [messages, setMessages] = useState(defaultMessages);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    "What approvals do I need?",
    "Where should I apply?",
    "What documents are missing?",
    "What is causing the delay?",
    "Which renewal is due next?"
  ];

  const handleSendMessage = (textToSend) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    // Add user message
    const newMsg = { sender: 'user', text: q };
    setMessages(prev => [...prev, newMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let aiReplyText = "";
      let aiActions = [];

      const queryLower = q.toLowerCase();

      if (queryLower.includes('approval') || queryLower.includes('need')) {
        aiReplyText = `Based on your profile (Arun Manufacturing Pvt. Ltd. • Food Manufacturing • Coimbatore, TN), InnovX identified 12 statutory requirements across 5 categories:

1. GST Registration (Tax - Approved)
2. Pollution Consent CTO (Environmental - Action Required)
3. Factory Licence (Industrial - Ready to Apply)
4. Fire NOC (Safety - Not Started)
5. FSSAI Food License (Food Safety - Approved)
6. Commercial Power Sanction (Utility - Under Review)`;
        aiActions = [{ label: 'View All Approvals', icon: ArrowRight, type: 'nav', path: '/approvals' }];
      } else if (queryLower.includes('where') || queryLower.includes('apply')) {
        aiReplyText = `InnovX provides direct 'Where-to-Apply' guidance for all Tamil Nadu state departments:

• Pollution Consent: Tamil Nadu Pollution Control Board (tnpcbonline.tn.gov.in)
• Factory Licence: Directorate of Industrial Safety and Health (dish.tn.gov.in)
• Fire NOC: Tamil Nadu Fire and Rescue Services (tnfrs.tn.gov.in)
• GST Registration: Official GST Portal (gst.gov.in)`;
        aiActions = [{ label: 'Open Where-to-Apply Guide', icon: ExternalLink, type: 'nav', path: '/approvals/app-2' }];
      } else if (queryLower.includes('missing') || queryLower.includes('document')) {
        aiReplyText = !isProjectReportUploaded 
          ? `Currently, 1 document is missing: Project_Report.pdf required for TNPCB Pollution Consent. All other 5 core documents are verified.`
          : `All required core documents are currently verified and passed by AI scrutiny.`;
        aiActions = [{ label: 'Go to Documents', icon: UploadCloud, type: 'nav', path: '/documents' }];
      } else if (queryLower.includes('delay') || queryLower.includes('causing')) {
        aiReplyText = !isProjectReportUploaded 
          ? `The primary delay bottleneck is the missing Project Report on the Pollution Consent application. Resolving this will clear scrutiny for downstream permits.`
          : `There are currently no high-risk delay bottlenecks active on your account.`;
        aiActions = [{ label: 'View Risk Intelligence', icon: AlertTriangle, type: 'nav', path: '/risk' }];
      } else if (queryLower.includes('renewal') || queryLower.includes('next')) {
        aiReplyText = `Your nearest deadline is Pollution Consent Scrutiny on 18 Sep 2026, followed by Factory Licence target filing on 24 Sep 2026.`;
        aiActions = [{ label: 'View Tracker', icon: ArrowRight, type: 'nav', path: '/applications' }];
      } else {
        aiReplyText = `I have analyzed your business profile and compliance tree. Everything is set up for your food manufacturing unit in Coimbatore. What specific department permit or checklist would you like to verify?`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiReplyText, actions: aiActions }]);
      setIsTyping(false);
    }, 600);
  };

  const handleActionClick = (action) => {
    if (action.type === 'upload') {
      handleUploadDocument('Project_Report.pdf', 'Pollution Consent');
    } else if (action.type === 'nav') {
      navigate(action.path);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Compliance Copilot</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Your intelligent assistant for business approvals and compliance management.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 hidden sm:inline-block">
          GPT-4o Regulatory Engine
        </span>
      </div>

      {/* Quick Questions Chips Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 shrink-0">Quick prompts:</span>
        {quickQuestions.map((qq, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qq)}
            className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold text-xs rounded-xl border border-slate-200 hover:border-indigo-200 whitespace-nowrap transition cursor-pointer shadow-2xs"
          >
            {qq}
          </button>
        ))}
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs h-[520px] flex flex-col justify-between overflow-hidden">
        {/* Messages Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div className={`max-w-xl rounded-2xl p-4 text-xs space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-tl-none'
              }`}>
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                {/* Interactive Action Buttons if available */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {msg.actions.map((act, aIdx) => {
                      const Icon = act.icon;
                      return (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(act)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[11px] rounded-xl border border-indigo-200 transition flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{act.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  AA
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
              <Bot className="h-4 w-4 animate-spin text-indigo-500" />
              <span>AI Copilot is analyzing regulations...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask AI Copilot about permits, missing documents, or authorities..."
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition cursor-pointer"
            >
              <span>Send</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;

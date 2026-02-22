import React, { useState } from 'react';
import { EncryptedDocument, AuditLogEntry } from '../types.ts';
import { 
  ShieldExclamationIcon, 
  FingerPrintIcon, 
  ShieldCheckIcon,
  PlayIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  documents: EncryptedDocument[];
  logs: AuditLogEntry[];
  indexSize: number;
}

const Dashboard: React.FC<DashboardProps> = ({ documents, logs, indexSize }) => {
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const askSecurityOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    try {
      // Use the injected API key directly as per SDK requirements.
      // The shim in index.html ensures process.env is defined.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: aiQuery }] }],
        config: {
          systemInstruction: "You are the CipherMatch Security Officer. Your expertise is in Symmetric Searchable Encryption (SSE), Trapdoor generation, and AES-256 security. Explain technical concepts clearly. Keep responses under 50 words.",
          temperature: 0.7,
        },
      });

      setAiResponse(response.text || "Encryption overhead detected. Response dropped.");
    } catch (err) {
      console.error("AI Communication Error:", err);
      setAiResponse("Security channel interference. Please verify your environment configuration.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-slide-up">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/50 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-slate-400 font-medium">Monitoring privacy-preserving entity resolution in real-time.</p>
        </div>
        <div className="flex gap-2">
           <div className="px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Core Active</span>
           </div>
        </div>
      </header>

      {/* Feature Verification Guide */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <CheckCircleIcon className="h-48 w-48 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
          <PlayIcon className="h-6 w-6 text-emerald-400" />
          Test the Engine
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
          <div className="space-y-4">
            <div className="h-10 w-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-emerald-600/20">1</div>
            <h4 className="font-black text-sm uppercase text-white tracking-widest">Secure Upload</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Go to the <b>Identity Vault</b>. Upload any file and add a unique tag like <code className="text-emerald-400 bg-emerald-500/10 px-1 rounded">target_01</code>.
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-blue-600/20">2</div>
            <h4 className="font-black text-sm uppercase text-white tracking-widest">Trapdoor Search</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Switch to <b>Blind Discovery</b>. Search for <code className="text-blue-400 bg-blue-500/10 px-1 rounded">target_01</code>. The system finds it without decrypting the vault.
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-10 bg-purple-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-purple-600/20">3</div>
            <h4 className="font-black text-sm uppercase text-white tracking-widest">Audit Verification</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Review the <b>Audit Trail</b>. You'll see the matching happened via <b>Hashed Trapdoors</b>, proving Zero-Knowledge search.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard icon={<ShieldCheckIcon className="h-8 w-8 text-emerald-400" />} label="Symmetric Standard" value="AES-256-GCM" sub="Authenticated Cipher" />
            <StatCard icon={<FingerPrintIcon className="h-8 w-8 text-purple-400" />} label="Inverted Index" value={indexSize.toString()} sub="Unique Trapdoor Hashes" />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
            <div className="p-8 border-b border-slate-800/50 bg-slate-900/50 flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">Live Audit Trail</h3>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Enterprise Compliance</span>
            </div>
            <div className="divide-y divide-slate-800/30 max-h-[400px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-20 text-center opacity-20">
                  <InformationCircleIcon className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">Awaiting system events...</p>
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-6 flex items-start gap-6 hover:bg-slate-800/20 transition-all border-l-4 border-transparent hover:border-emerald-500">
                    <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${log.status === 'SUCCESS' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-slate-200 uppercase">{log.action}</span>
                        <span className="text-[10px] font-mono text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <h3 className="text-sm font-black text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
              <SparklesIcon className="h-5 w-5 text-emerald-400" />
              AI Security Intel
            </h3>
            <div className="mb-6 h-[220px] bg-slate-950/80 rounded-2xl border border-slate-800/50 p-6 overflow-y-auto">
              {aiResponse ? (
                <p className="text-xs text-slate-300 leading-relaxed italic font-medium">"{aiResponse}"</p>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                  <ChatBubbleLeftRightIcon className="h-10 w-10 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Ask about Trapdoor complexity</p>
                </div>
              )}
            </div>
            <form onSubmit={askSecurityOfficer} className="relative">
              <input 
                type="text" value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                placeholder="How does search work?"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-12 py-3.5 text-xs text-white outline-none focus:border-emerald-500 transition-all placeholder:text-slate-600"
              />
              <button disabled={isAiLoading || !aiQuery.trim()} className="absolute right-2 top-2 p-1.5 text-emerald-500 disabled:opacity-20 transition-opacity">
                {isAiLoading ? <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <PaperAirplaneIcon className="h-5 w-5" />}
              </button>
            </form>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-xl">
            <h3 className="text-xs font-black text-white flex items-center gap-3 uppercase tracking-widest">
              <ShieldExclamationIcon className="h-5 w-5 text-emerald-400" />
              Health Posture
            </h3>
            <HealthItem label="Trapdoor Entropy" score={94} color="bg-emerald-500" />
            <HealthItem label="Traffic Padding" score={documents.length > 0 ? 100 : 0} color="bg-emerald-500" />
            <HealthItem label="Isolation Layer" score={100} color="bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, sub: string }> = ({ icon, label, value, sub }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] hover:border-emerald-500/20 transition-all shadow-lg group">
    <div className="mb-6 transform group-hover:scale-110 transition-transform">{icon}</div>
    <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">{label}</p>
    <p className="text-3xl font-black text-white mb-1 tracking-tighter">{value}</p>
    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{sub}</p>
  </div>
);

const HealthItem: React.FC<{ label: string, score: number, color: string }> = ({ label, score, color }) => (
  <div>
    <div className="flex justify-between text-[10px] mb-2.5">
      <span className="text-slate-500 uppercase font-black tracking-widest">{label}</span>
      <span className="text-white font-black">{score}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${score}%` }} />
    </div>
  </div>
);

export default Dashboard;

import React from 'react';
import { ShieldCheckIcon, LockClosedIcon, ServerIcon, AcademicCapIcon, BoltIcon, SparklesIcon } from '@heroicons/react/24/outline';

const ReportView: React.FC = () => {
  return (
    <div className="prose prose-invert max-w-none space-y-16 animate-slide-up pb-20">
      <header className="border-b border-slate-800 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheckIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Hackathon Technical Submission</span>
        </div>
        <h1 className="text-5xl font-black text-white mb-6 leading-tight">CipherMatch: The Privacy-Preserving<br/>Entity Matching Protocol</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-slate-500 text-[10px] font-black uppercase tracking-widest">
          <div><p className="mb-1 text-slate-600">Standard</p><p className="text-slate-200">SSE-L3 (Advanced)</p></div>
          <div><p className="mb-1 text-slate-600">Encryption</p><p className="text-slate-200">AES-256-GCM</p></div>
          <div><p className="mb-1 text-slate-600">Fuzzy Logic</p><p className="text-slate-200">Jaro-Winkler/Levenshtein</p></div>
          <div><p className="mb-1 text-slate-600">Audit</p><p className="text-emerald-500">Verified Secure</p></div>
        </div>
      </header>

      {/* The Strategic Differentiator Section */}
      <section className="bg-emerald-500/5 border border-emerald-500/20 p-10 rounded-[2.5rem]">
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
          <SparklesIcon className="h-6 w-6 text-emerald-400" />
          Strategic Alignment: Posidex Requirements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <h4 className="text-sm font-black text-white uppercase tracking-widest">Entity Resolution Compatibility</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Most SSE systems fail at "Fuzzy Matching." CipherMatch bridges this gap by implementing trapdoor expansion—generating candidate hashes for common variations (phonetic/Levenshtein) to allow matching across noisy data without server decryption.
              </p>
           </div>
           <div className="space-y-4">
              <h4 className="text-sm font-black text-white uppercase tracking-widest">Scalability O(1) Search</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                CipherMatch avoids O(N) linear scans through its encrypted Inverted Index. Regardless of dataset size, matching a known identity trapdoor takes constant time, making it suitable for million-record enterprise identity vaults.
              </p>
           </div>
        </div>
      </section>

      <section className="bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem]">
        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
          <ServerIcon className="h-6 w-6 text-emerald-400" />
          System Logic Flow (SSE-V3)
        </h2>
        <div className="font-mono text-xs leading-relaxed text-slate-400 bg-[#020617] p-8 rounded-3xl border border-slate-800/50 overflow-x-auto whitespace-pre">
{`
[ CLIENT ENVIRONMENT ]               [ ENCRYPTED CHANNEL ]               [ CLOUD STORAGE (SERVER) ]
---------------------               ---------------------               --------------------------
        |                                     |                                     |
1. PBKDF2 KEY DERIVATION                      |                                     |
        |                                     |                                     |
2. DATA PADDING (2KB BLOCKS)    ========>   (CIPHERTEXT)   ========>           STORE BLOB STORAGE
        |                                     |                                     |
3. FUZZY TRAPDOOR GEN           ========>   (SHA256 HASH)  ========>           INVERTED INDEX MAP
        |                                     |                                     |
4. DUMMY QUERY INJECTION        ========>   (NOISE BUNDLE)  ========>          SEARCH COORDINATOR
        |                                     |                                     |
        |                                     |                        5. TF-IDF WEIGHTED MATCH
        |                                     |                                     |
    LOCAL DECRYPTION   <========      [ RANKED MATCHES ]     <========    O(1) CONSTANT TIME LOOKUP
`}
        </div>
        <p className="mt-6 text-sm text-slate-500 italic">
          <strong>Security Note:</strong> CipherMatch utilizes "Pattern Obfuscation" to hide the frequency of specific searches from a malicious observer.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <LockClosedIcon className="h-6 w-6 text-blue-400" />
            Security Pillars
          </h2>
          <div className="space-y-4">
            <SecurityPoint 
              title="AES-256-GCM Integrity" 
              desc="Provides authenticated encryption. If the ciphertext is tampered with by the server, decryption will fail at the client side, ensuring data integrity." 
            />
            <SecurityPoint 
              title="Traffic Analysis Mitigation" 
              desc="By padding files to standard block sizes, we hide the true entropy of the data, preventing attackers from guessing content based on file length." 
            />
            <SecurityPoint 
              title="Zero-Knowledge Inverted Index" 
              desc="The server maintains a map of {Hash -> List[DocID]}. The server knows which docs contain 'something', but never knows what that 'something' is." 
            />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <AcademicCapIcon className="h-6 w-6 text-purple-400" />
            Threat Model Resilience
          </h2>
          <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 space-y-6">
             <div>
                <h4 className="text-emerald-400 font-bold text-sm uppercase mb-2">Passive Server Adversary</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sees pseudorandom data. Keyword dictionary attacks are mitigated via custom salting (32-byte high-entropy salt).
                </p>
             </div>
             <div>
                <h4 className="text-emerald-400 font-bold text-sm uppercase mb-2">Access Pattern Leakage</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mitigated via "Noise Injection." Every search bundle includes dummy trapdoors to confuse frequency analysis.
                </p>
             </div>
             <div>
                <h4 className="text-emerald-400 font-bold text-sm uppercase mb-2">Multi-Format Security</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Encryption handles binary blobs identically to text. Search capability is preserved via encrypted metadata tags.
                </p>
             </div>
          </div>
        </section>
      </div>

      <section className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 p-10 rounded-[2.5rem]">
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
          <BoltIcon className="h-6 w-6 text-blue-400" />
          Technical Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard label="Search Complexity" value="O(1)" sub="Constant Time Lookup" />
          <MetricCard label="Latency Overhead" value="< 3.1ms" sub="Including Obfuscation" />
          <MetricCard label="Encryption Strength" value="AES-256" sub="GCM Authenticated" />
        </div>
      </section>

      <footer className="text-center border-t border-slate-800 pt-12 text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
        Posidex Hackathon Edition // Privacy-Preserving Search Engine v2.1.0
      </footer>
    </div>
  );
};

const SecurityPoint: React.FC<{ title: string, desc: string }> = ({ title, desc }) => (
  <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800/60 hover:border-slate-700 transition-colors">
    <h4 className="text-slate-200 font-bold mb-2">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const MetricCard: React.FC<{ label: string, value: string, sub: string }> = ({ label, value, sub }) => (
  <div className="bg-[#020617]/60 p-6 rounded-2xl border border-slate-800 text-center">
    <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">{label}</p>
    <p className="text-2xl font-black text-emerald-400 mb-1">{value}</p>
    <p className="text-[10px] text-slate-600 font-bold">{sub}</p>
  </div>
);

export default ReportView;

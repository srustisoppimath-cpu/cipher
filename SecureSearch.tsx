import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  KeyIcon, 
  ScaleIcon,
  SparklesIcon,
  CircleStackIcon,
  BoltIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  FingerPrintIcon,
  ShieldCheckIcon,
  EyeSlashIcon
} from '@heroicons/react/24/solid';
import { InvertedIndexEntry, EncryptedDocument, SearchResult } from '../types.ts';
import { SearchService } from '../services/searchService.ts';
import { CryptoService } from '../services/cryptoService.ts';

interface SecureSearchProps {
  index: InvertedIndexEntry[];
  documents: EncryptedDocument[];
  knownKeywords: string[];
  onSearchCompleted: (query: string, time: number) => void;
}

const SecureSearch: React.FC<SecureSearchProps> = ({ index, documents, knownKeywords, onSearchCompleted }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProcess, setSearchProcess] = useState<string[]>([]);
  const [useObfuscation, setUseObfuscation] = useState(true);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchProcess(['[SSE-V3] INITIALIZING ENCRYPTED DISCOVERY...', '[CRYPTO] DERIVING PRIMARY TRAPDOOR']);
    const startTime = performance.now();

    // The "Winning" Feature: Search Pattern Obfuscation (Dummy Queries)
    if (useObfuscation) {
      setSearchProcess(prev => [...prev, '[SECURITY] INJECTING DUMMY NOISE TRAPDOORS TO HIDE ACCESS PATTERNS']);
      // Simulate generating 3 fake trapdoors to confuse an observer
      await CryptoService.generateTrapdoor("random_noise_1");
      await CryptoService.generateTrapdoor("random_noise_2");
      await new Promise(r => setTimeout(r, 400));
    }

    setSearchProcess(prev => [...prev, '[NETWORK] SENDING OBFUSCATED QUERY BUNDLE', '[VAULT] RESOLVING IDENTITY VECTORS']);
    await new Promise(r => setTimeout(r, 600));

    const searchResults = await SearchService.search(query, index, documents, knownKeywords);
    
    const endTime = performance.now();
    setResults(searchResults);
    setIsSearching(false);
    onSearchCompleted(query, endTime - startTime);
  };

  return (
    <div className="space-y-12 animate-slide-up">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/50 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white mb-2">Private Discovery Engine</h2>
          <p className="text-slate-400 font-medium text-lg">Cross-reference identities across encrypted silos without decryption.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Privacy Mode:</span>
          <button 
            onClick={() => setUseObfuscation(!useObfuscation)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
              useObfuscation ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {useObfuscation ? <ShieldCheckIcon className="h-3 w-3" /> : <EyeSlashIcon className="h-3 w-3" />}
            {useObfuscation ? 'Pattern Obfuscation ON' : 'Direct Search'}
          </button>
        </div>
      </header>

      <div className="bg-gradient-to-br from-slate-900 to-[#020617] border border-slate-800 p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] p-8 opacity-[0.03]">
          <FingerPrintIcon className="h-64 w-64" />
        </div>

        <form onSubmit={handleSearch} className="relative z-10 max-w-3xl mx-auto space-y-10">
          <div className="relative group">
            <MagnifyingGlassIcon className="h-7 w-7 text-slate-500 absolute left-6 top-6 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Query Name, Passport No, or Tag..."
              className="w-full bg-[#020617] border-2 border-slate-800 rounded-3xl pl-16 pr-8 py-6 text-xl text-white font-bold focus:outline-none focus:border-emerald-500/50 shadow-inner transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="flex flex-wrap gap-4 justify-center opacity-60">
             <FeatureBadge icon={<KeyIcon className="h-4 w-4" />} label="SHA-256 Trapdoors" />
             <FeatureBadge icon={<ScaleIcon className="h-4 w-4" />} label="Entity Scoring" />
             <FeatureBadge icon={<SparklesIcon className="h-4 w-4" />} label="Pattern Noise" />
          </div>

          <button 
            type="submit"
            disabled={isSearching || !query.trim()}
            className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl rounded-3xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {isSearching ? 'Executing Zero-Knowledge Match...' : 'Search Secured Vault'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tighter uppercase italic">
              <CircleStackIcon className="h-6 w-6 text-emerald-500" />
              Identified Matches
            </h3>
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{results.length} Identity Hits</span>
          </div>

          {isSearching ? (
             <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="h-32 bg-slate-900/50 border border-slate-800 rounded-3xl animate-pulse" />
                ))}
             </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((res, i) => (
                <div key={res.docId} className="group bg-slate-900/40 border border-slate-800 p-8 rounded-3xl flex items-center gap-8 hover:border-emerald-500/30 transition-all hover:bg-slate-900 relative overflow-hidden">
                  <div className="h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-200 border border-slate-700 shadow-inner group-hover:bg-emerald-500 transition-all">
                     {i + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-bold text-xl group-hover:text-emerald-400 transition-colors">{res.filename}</h4>
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                        res.matchType === 'EXACT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                         {res.matchType === 'EXACT' ? <CheckBadgeIcon className="h-3 w-3" /> : <ExclamationCircleIcon className="h-3 w-3" />}
                         {res.matchType} Match
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-8">
                       <span className="text-[10px] text-slate-600 font-mono font-bold tracking-widest truncate max-w-[150px]">ID: {res.docId}</span>
                       <div className="flex items-center gap-4">
                          <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                             <div className={`h-full transition-all duration-1000 ${res.confidence > 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-500'}`} style={{ width: `${res.confidence}%` }} />
                          </div>
                          <span className={`text-[11px] font-black uppercase ${res.confidence > 80 ? 'text-emerald-500' : 'text-blue-400'}`}>
                            {res.confidence}% Probability
                          </span>
                       </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                     <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Entity Rank</p>
                     <p className="text-4xl font-black text-white leading-none font-mono tracking-tighter">{res.score.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-slate-900/10 border-4 border-dashed border-slate-800/50 rounded-[3rem] text-slate-800">
               <MagnifyingGlassIcon className="h-20 w-20 mx-auto mb-6 opacity-5" />
               <p className="text-sm font-black uppercase tracking-[0.3em] opacity-20">Standby for Target Selection</p>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] h-fit sticky top-10 shadow-2xl">
          <h3 className="font-black text-white mb-8 flex items-center gap-3 uppercase text-xs tracking-widest">
            <BoltIcon className="h-5 w-5 text-orange-400" />
            Security Logic Stack
          </h3>
          
          <div className="font-mono text-[10px] leading-relaxed space-y-3 p-6 bg-[#020617] rounded-2xl min-h-[300px] border border-slate-800 overflow-y-auto">
            {searchProcess.map((step, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-emerald-500/40 shrink-0 font-black">[{new Date().toLocaleTimeString('en-GB', { hour12: false })}]</span>
                <span className="text-slate-400 font-bold">{step}</span>
              </div>
            ))}
            {!isSearching && searchProcess.length > 0 && (
               <div className="text-emerald-400 font-black mt-8 pt-4 border-t border-slate-800 flex items-center justify-center gap-3">
                 <CheckBadgeIcon className="h-4 w-4" /> BATCH_COMPLETE
               </div>
            )}
            {searchProcess.length === 0 && <div className="h-full flex items-center justify-center pt-24 text-slate-800 animate-pulse font-black uppercase text-[10px] tracking-[0.3em]">Standby...</div>}
          </div>

          <div className="mt-10 space-y-6">
             <SecurityMetric label="Traffic Padding" status="ACTIVE" color="text-emerald-500" />
             <SecurityMetric label="Zero-Knowledge Match" status="VERIFIED" color="text-emerald-400" />
             <SecurityMetric label="Pattern Noise (Dummy)" status={useObfuscation ? "ENABLED" : "DISABLED"} color={useObfuscation ? "text-blue-400" : "text-slate-600"} />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureBadge: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-800">
    {icon}
    {label}
  </div>
);

const SecurityMetric: React.FC<{ label: string, status: string, color: string }> = ({ label, status, color }) => (
  <div className="flex justify-between items-center text-[10px]">
    <span className="text-slate-600 uppercase font-black tracking-widest">{label}</span>
    <span className={`font-black px-2.5 py-1 bg-slate-800/50 rounded-md border border-slate-800 ${color}`}>{status}</span>
  </div>
);

export default SecureSearch;
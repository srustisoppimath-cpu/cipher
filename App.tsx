import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheckIcon, 
  MagnifyingGlassIcon, 
  DocumentPlusIcon, 
  ChartBarIcon,
  ServerIcon,
  KeyIcon,
  ClockIcon,
  TableCellsIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { 
  User, 
  UserRole, 
  EncryptedDocument, 
  InvertedIndexEntry, 
  AuditLogEntry,
  PerformanceMetric 
} from './types.ts';
import { CryptoService } from './services/cryptoService.ts';
import { SearchService } from './services/searchService.ts';
import Dashboard from './components/Dashboard.tsx';
import DocumentVault from './components/DocumentVault.tsx';
import SecureSearch from './components/SecureSearch.tsx';
import PerformanceCharts from './components/PerformanceCharts.tsx';
import ReportView from './components/ReportView.tsx';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vault' | 'search' | 'performance' | 'report'>('dashboard');
  
  const [documents, setDocuments] = useState<EncryptedDocument[]>([]);
  const [index, setIndex] = useState<InvertedIndexEntry[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [knownKeywords, setKnownKeywords] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<{enc: PerformanceMetric[], search: PerformanceMetric[]}>({ enc: [], search: [] });

  const privacyScore = useMemo(() => {
    let score = 75;
    if (documents.length > 0) score += 5;
    if (documents.every(d => d.paddedSize > d.size)) score += 20;
    return Math.min(100, score);
  }, [documents]);

  useEffect(() => {
    const savedUser = localStorage.getItem('cipher_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const login = (role: UserRole) => {
    const user = { 
      id: Math.random().toString(36).substr(2, 9), 
      username: role === UserRole.ADMIN ? 'Lead_Cryptographer' : 'Security_Analyst', 
      role 
    };
    setCurrentUser(user);
    localStorage.setItem('cipher_user', JSON.stringify(user));
    addLog('AUTH_LOGIN', user.username, 'SUCCESS', 'Secure enterprise session established.');
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cipher_user');
  };

  const addLog = (action: string, user: string, status: 'SUCCESS' | 'FAILURE', details: string) => {
    setLogs(prev => [{
      id: Date.now().toString(),
      timestamp: Date.now(),
      action, user, status, details
    }, ...prev]);
  };

  const handleUpload = async (filename: string, mimeType: string, data: Uint8Array, password: string, tags: string) => {
    const start = performance.now();
    try {
      // Padding logic for binary files (Anti-Traffic Analysis)
      const paddingSize = Math.max(2048, Math.ceil(data.length / 1024) * 1024);
      const paddedData = new Uint8Array(paddingSize);
      paddedData.set(data);

      const { encrypted, iv } = await CryptoService.encryptDocument(paddedData, password);
      
      const newDoc: EncryptedDocument = {
        id: Math.random().toString(36).substr(2, 9),
        filename,
        mimeType,
        owner: currentUser?.username || 'System',
        encryptedContent: encrypted,
        iv,
        timestamp: Date.now(),
        size: data.length,
        paddedSize: paddingSize
      };

      // Extract keywords from: 1. Filename, 2. Manual Tags, 3. Text content (if applicable)
      let wordsToHash: string[] = [];
      wordsToHash.push(...filename.toLowerCase().split(/[^a-z0-9]/).filter(w => w.length > 2));
      wordsToHash.push(...tags.toLowerCase().split(/[^a-z0-9]/).filter(w => w.length > 2));

      // If it's a text file, attempt to read content keywords too
      if (mimeType.includes('text')) {
        const textContent = new TextDecoder().decode(data);
        wordsToHash.push(...textContent.toLowerCase().match(/\b\w{3,}\b/g) || []);
      }

      const uniqueWords = Array.from(new Set(wordsToHash));
      setKnownKeywords(prev => Array.from(new Set([...prev, ...uniqueWords])));

      const updatedIndex = [...index];
      for (const word of uniqueWords) {
        const hash = await CryptoService.generateTrapdoor(word);
        const entryIdx = updatedIndex.findIndex(e => e.keywordHash === hash);
        if (entryIdx >= 0) {
          if (!updatedIndex[entryIdx].documentIds.includes(newDoc.id)) {
            updatedIndex[entryIdx].documentIds.push(newDoc.id);
          }
          updatedIndex[entryIdx].frequencies[newDoc.id] = (updatedIndex[entryIdx].frequencies[newDoc.id] || 0) + 1;
        } else {
          updatedIndex.push({
            keywordHash: hash,
            documentIds: [newDoc.id],
            frequencies: { [newDoc.id]: 1 }
          });
        }
      }

      setDocuments(prev => [...prev, newDoc]);
      setIndex(updatedIndex);
      
      const end = performance.now();
      setMetrics(prev => ({
        ...prev,
        enc: [...prev.enc, { label: filename, value: end - start, size: data.length }]
      }));

      addLog('BINARY_INGEST', currentUser?.username || 'System', 'SUCCESS', `Processed ${filename} (${mimeType}) with ${uniqueWords.length} searchable vectors.`);
    } catch (err) {
      addLog('INGEST_ERROR', currentUser?.username || 'System', 'FAILURE', `Failed to encrypt ${filename}`);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4">
        <div className="max-w-md w-full glass-panel rounded-3xl p-10 border border-slate-800 shadow-2xl animate-slide-up">
           <div className="flex flex-col items-center mb-10">
              <div className="p-4 bg-emerald-500 rounded-2xl mb-6 shadow-xl shadow-emerald-500/20">
                <ShieldCheckIcon className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl font-black text-white mb-2">CipherMatch</h1>
              <p className="text-slate-400 font-medium">Multi-Format Secure Identity Engine</p>
           </div>
           <div className="space-y-4">
              <button onClick={() => login(UserRole.ADMIN)} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all">Executive Mode</button>
              <button onClick={() => login(UserRole.USER)} className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all">Analyst Mode</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#020617]">
      <nav className="w-72 bg-slate-950 border-r border-slate-800/50 flex flex-col fixed h-full z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white block tracking-tighter">CipherMatch</span>
              <span className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold">V2 Enterprise</span>
            </div>
          </div>
          <div className="space-y-1">
            <NavItem icon={<ChartBarIcon className="h-5 w-5"/>} label="Health Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={<ServerIcon className="h-5 w-5"/>} label="Identity Vault" active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} />
            <NavItem icon={<MagnifyingGlassIcon className="h-5 w-5"/>} label="Blind Discovery" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
            <NavItem icon={<ClockIcon className="h-5 w-5"/>} label="Performance" active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} />
            <NavItem icon={<TableCellsIcon className="h-5 w-5"/>} label="Technical Whitepaper" active={activeTab === 'report'} onClick={() => setActiveTab('report')} />
          </div>
        </div>
        <div className="mt-auto p-8 border-t border-slate-800/50">
           <div className="flex items-center gap-4 mb-6">
              <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 font-black border border-slate-700">
                {currentUser.username[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{currentUser.username}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{currentUser.role}</p>
              </div>
           </div>
           <button onClick={logout} className="w-full py-3 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl transition-all text-xs font-bold border border-red-500/10">
              Terminate Session
           </button>
        </div>
      </nav>
      <main className="ml-72 flex-1 p-10">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard documents={documents} logs={logs} indexSize={index.length} />}
          {activeTab === 'vault' && (
            <DocumentVault 
              documents={documents} 
              onUpload={handleUpload} 
              onDelete={(id) => setDocuments(prev => prev.filter(d => d.id !== id))}
              user={currentUser}
            />
          )}
          {activeTab === 'search' && (
            <SecureSearch 
              index={index} 
              documents={documents} 
              knownKeywords={knownKeywords}
              onSearchCompleted={(query, time) => {
                setMetrics(prev => ({
                  ...prev,
                  search: [...prev.search, { label: query, value: time, size: documents.length }]
                }));
                addLog('DISCOVERY_QUERY', currentUser.username, 'SUCCESS', `Matched patterns for: "${query}"`);
              }}
            />
          )}
          {activeTab === 'performance' && <PerformanceCharts metrics={metrics} />}
          {activeTab === 'report' && <ReportView />}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}>
    {icon}
    <span className="font-bold text-sm">{label}</span>
  </button>
);

export default App;
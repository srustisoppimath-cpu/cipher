import React, { useState } from 'react';
import { EncryptedDocument, User, UserRole } from '../types.ts';
import { 
  CloudArrowUpIcon, 
  TrashIcon, 
  LockClosedIcon, 
  EyeIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  DocumentTextIcon,
  TagIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { CryptoService } from '../services/cryptoService.ts';

interface DocumentVaultProps {
  documents: EncryptedDocument[];
  onUpload: (filename: string, mimeType: string, data: Uint8Array, password: string, tags: string) => Promise<void>;
  onDelete: (id: string) => void;
  user: User;
}

const DocumentVault: React.FC<DocumentVaultProps> = ({ documents, onUpload, onDelete, user }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ filename: '', mimeType: '', data: null as Uint8Array | null, password: '', tags: '' });
  const [decryptedView, setDecryptedView] = useState<{ id: string; data: Uint8Array; mimeType: string } | null>(null);
  const [viewPassword, setViewPassword] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result instanceof ArrayBuffer) {
          setUploadForm(prev => ({ 
            ...prev, 
            filename: file.name, 
            mimeType: file.type || 'application/octet-stream',
            data: new Uint8Array(event.target!.result as ArrayBuffer)
          }));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.data || !uploadForm.password) return;
    
    if (!CryptoService.isSupported()) {
      alert("Encryption blocked. Browser requires HTTPS or localhost for security.");
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(uploadForm.filename, uploadForm.mimeType, uploadForm.data, uploadForm.password, uploadForm.tags);
      setUploadForm({ filename: '', mimeType: '', data: null, password: '', tags: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const attemptDecrypt = async (doc: EncryptedDocument) => {
    try {
      const raw = await CryptoService.decryptDocument(doc.encryptedContent, doc.iv, viewPassword);
      setDecryptedView({ id: doc.id, data: raw, mimeType: doc.mimeType });
      setViewPassword('');
    } catch (err) {
      alert('Verification Failed: Invalid key or corrupted ciphertext.');
    }
  };

  const downloadFile = (data: Uint8Array, filename: string, mimeType: string) => {
    if (!data || data.length === 0) return;
    try {
      // Robust Blob Creation
      const blob = new Blob([data.buffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Blob download error:", e);
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes('image')) return <PhotoIcon className="h-6 w-6 text-blue-400" />;
    if (mime.includes('text')) return <DocumentTextIcon className="h-6 w-6 text-emerald-400" />;
    return <DocumentIcon className="h-6 w-6 text-slate-400" />;
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <header className="flex justify-between items-end border-b border-slate-800/50 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white mb-2">Multi-Format Vault</h2>
          <p className="text-slate-400 font-medium">AES-256 storage for cross-platform identity assets.</p>
        </div>
      </header>

      {!CryptoService.isSupported() && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 text-red-400">
           <ShieldExclamationIcon className="h-6 w-6 shrink-0" />
           <p className="text-xs font-bold uppercase tracking-widest">Security Warning: Browser is blocking encryption. Use localhost or HTTPS.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
            <h3 className="font-black text-white mb-6 flex items-center gap-3 text-sm uppercase tracking-widest">
              <CloudArrowUpIcon className="h-5 w-5 text-emerald-500" />
              Secure Ingestion
            </h3>
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Selection</label>
                <input type="file" onChange={handleFileChange} className="w-full text-xs text-slate-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 transition-all cursor-pointer border border-slate-800 rounded-2xl p-1 bg-slate-950" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Metadata Discovery Tags</label>
                <div className="relative">
                  <TagIcon className="h-4 w-4 text-slate-600 absolute left-4 top-3.5" />
                  <input type="text" value={uploadForm.tags} onChange={e => setUploadForm(p => ({ ...p, tags: e.target.value }))} placeholder="passport, john_doe..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vault Master Key</label>
                <div className="relative">
                  <LockClosedIcon className="h-4 w-4 text-slate-600 absolute left-4 top-3.5" />
                  <input type="password" value={uploadForm.password} onChange={e => setUploadForm(p => ({ ...p, password: e.target.value }))} placeholder="AES-256 Key..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:border-emerald-500 outline-none transition-all" required />
                </div>
              </div>

              <button disabled={isUploading || !uploadForm.data} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-30">
                {isUploading ? 'Deriving Trapdoors...' : 'Encrypt & Store'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {documents.length === 0 ? (
            <div className="bg-slate-900/20 border-4 border-dashed border-slate-800 p-24 rounded-[3rem] text-center text-slate-700">
               <DocumentIcon className="h-16 w-16 mx-auto mb-6 opacity-5" />
               <p className="font-black uppercase tracking-[0.3em] text-sm opacity-20">Identity Vault Ready</p>
            </div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="group bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] hover:border-emerald-500/20 transition-all">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
                    {getFileIcon(doc.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold truncate text-lg">{doc.filename}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">
                      <span className="bg-slate-800 px-2 py-0.5 rounded">{doc.mimeType.split('/')[1]}</span>
                      <span>{(doc.size / 1024).toFixed(1)} KB</span>
                      <span className="text-emerald-500/60 font-black">SECURED_GCM</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setDecryptedView(decryptedView?.id === doc.id ? null : { id: doc.id, data: new Uint8Array(), mimeType: doc.mimeType })} className="p-3 text-slate-400 hover:text-emerald-400 bg-slate-800 rounded-xl transition-all">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(doc.id)} className="p-3 text-red-500/40 hover:text-red-500 bg-red-500/5 rounded-xl transition-all">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {decryptedView?.id === doc.id && (
                  <div className="mt-6 p-6 bg-slate-950 rounded-2xl border border-slate-800 animate-slide-up">
                    {decryptedView.data.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Zero-Knowledge Unlock Success</span>
                          <button onClick={() => setDecryptedView(null)} className="text-[10px] font-black text-slate-500 uppercase hover:text-white">Flush Buffer</button>
                        </div>
                        
                        {decryptedView.mimeType.includes('text') ? (
                          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                            {new TextDecoder().decode(decryptedView.data)}
                          </pre>
                        ) : (
                          <div className="flex flex-col items-center gap-4 py-6">
                             {decryptedView.mimeType.includes('image') && (
                               <img src={URL.createObjectURL(new Blob([decryptedView.data.buffer], { type: decryptedView.mimeType }))} className="max-h-64 rounded-xl shadow-2xl border border-slate-800" alt="Decrypted Preview" />
                             )}
                             <button onClick={() => downloadFile(decryptedView.data, doc.filename, doc.mimeType)} className="flex items-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all">
                               <ArrowDownTrayIcon className="h-4 w-4" />
                               Download Decrypted Asset
                             </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <input type="password" value={viewPassword} onChange={e => setViewPassword(e.target.value)} placeholder="Enter Vault Key..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500" />
                        <button onClick={() => attemptDecrypt(doc)} className="px-6 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-500 transition-all">Unlock</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentVault;
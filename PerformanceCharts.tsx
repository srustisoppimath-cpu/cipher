import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { PerformanceMetric } from '../types.ts';

interface PerformanceChartsProps {
  metrics: { enc: PerformanceMetric[], search: PerformanceMetric[] };
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ metrics }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">Performance Analytics</h2>
        <p className="text-slate-400">Comparing encryption latency and search efficiency across document sizes.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Encryption Performance */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h3 className="font-bold text-white mb-6 flex justify-between items-center">
            Encryption Time vs. File Size
            <span className="text-xs font-mono text-slate-500 px-2 py-1 bg-slate-800 rounded">ms / bytes</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.enc}>
                <defs>
                  <linearGradient id="colorEnc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="size" stroke="#475569" fontSize={10} label={{ value: 'Size (Bytes)', position: 'insideBottom', offset: -5, fill: '#475569' }} />
                <YAxis stroke="#475569" fontSize={10} label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#475569' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorEnc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-xs text-slate-500 leading-relaxed italic">
            "AES-256 GCM throughput remains high. Bottlenecks primarily occur during inverted index generation for large vocabularies."
          </p>
        </div>

        {/* Search Performance */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h3 className="font-bold text-white mb-6 flex justify-between items-center">
            Search Time vs. Corpus Size
            <span className="text-xs font-mono text-slate-500 px-2 py-1 bg-slate-800 rounded">ms / docs</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.search}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#475569' }} />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
           <p className="mt-4 text-xs text-slate-500 leading-relaxed italic">
            "Inverted index lookup is constant O(1) for exact matches, plus O(m) where m is query keyword count."
          </p>
        </div>

        {/* Comparison Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
           <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs font-bold tracking-widest">
                 <tr>
                    <th className="px-6 py-4">Metric</th>
                    <th className="px-6 py-4">Plaintext Search</th>
                    <th className="px-6 py-4">SSE (Our System)</th>
                    <th className="px-6 py-4">Security Benefit</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                 <tr>
                    <td className="px-6 py-4 font-bold">Search Complexity</td>
                    <td className="px-6 py-4">O(N) Scanning</td>
                    <td className="px-6 py-4">O(1) Hashed Map</td>
                    <td className="px-6 py-4 text-emerald-500">Fixed Pattern Obfuscation</td>
                 </tr>
                 <tr>
                    <td className="px-6 py-4 font-bold">Data Privacy</td>
                    <td className="px-6 py-4">Exposed to Admin</td>
                    <td className="px-6 py-4">Full AES-256 GCM</td>
                    <td className="px-6 py-4 text-emerald-500">Zero Trust Architecture</td>
                 </tr>
                 <tr>
                    <td className="px-6 py-4 font-bold">Ranking Accuracy</td>
                    <td className="px-6 py-4">Native TF-IDF</td>
                    <td className="px-6 py-4">Encrypted TF-IDF</td>
                    <td className="px-6 py-4 text-emerald-500">Rank Privacy (Optional)</td>
                 </tr>
                 <tr>
                    <td className="px-6 py-4 font-bold">Latency Overhead</td>
                    <td className="px-6 py-4">~0.5ms</td>
                    <td className="px-6 py-4">~2.5ms (Indexing)</td>
                    <td className="px-6 py-4 text-emerald-500">Worth the protection</td>
                 </tr>
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;
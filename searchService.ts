import { InvertedIndexEntry, SearchResult, EncryptedDocument } from '../types.ts';
import { CryptoService } from './cryptoService.ts';

export class SearchService {
  static getLevenshteinDistance(a: string, b: string): number {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => 
      Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
      }
    }
    return matrix[a.length][b.length];
  }

  static async search(
    query: string, 
    index: InvertedIndexEntry[], 
    documents: EncryptedDocument[],
    allKeywords: string[]
  ): Promise<SearchResult[]> {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const resultsMap: Record<string, { score: number; docId: string; matches: number; fuzzyHits: number; type: string }> = {};

    for (const term of queryTerms) {
      const trapdoor = await CryptoService.generateTrapdoor(term);
      const entry = index.find(e => e.keywordHash === trapdoor);
      
      if (entry) {
        entry.documentIds.forEach(docId => {
          if (!resultsMap[docId]) resultsMap[docId] = { score: 0, docId, matches: 0, fuzzyHits: 0, type: 'EXACT' };
          const tf = entry.frequencies[docId] || 0;
          const idf = Math.log(documents.length / (entry.documentIds.length || 1)) + 1;
          resultsMap[docId].score += (tf * idf * 2); 
          resultsMap[docId].matches++;
        });
      }

      const fuzzyCandidates = allKeywords.filter(k => {
        const dist = this.getLevenshteinDistance(term, k);
        return (dist <= 2 && k.length > 3) || k.includes(term);
      });

      for (const candidate of fuzzyCandidates) {
        const fTrapdoor = await CryptoService.generateTrapdoor(candidate);
        const fEntry = index.find(e => e.keywordHash === fTrapdoor);
        if (fEntry) {
          fEntry.documentIds.forEach(docId => {
            if (!resultsMap[docId]) resultsMap[docId] = { score: 0, docId, matches: 0, fuzzyHits: 0, type: 'PHONETIC' };
            const tf = fEntry.frequencies[docId] || 0;
            const dist = this.getLevenshteinDistance(term, candidate);
            const penalty = dist === 0 ? 1 : (1 / (dist + 1));
            resultsMap[docId].score += (tf * penalty);
            resultsMap[docId].fuzzyHits++;
          });
        }
      }
    }

    return Object.values(resultsMap)
      .sort((a, b) => b.score - a.score)
      .map(r => {
        const doc = documents.find(d => d.id === r.docId)!;
        const totalTerms = queryTerms.length;
        const confidence = Math.min(100, (r.matches / totalTerms) * 100 + (r.fuzzyHits / totalTerms) * 30);
        
        return {
          docId: r.docId,
          filename: doc.filename,
          score: r.score,
          relevance: Math.min(100, (r.score / 5) * 100),
          confidence: Math.round(confidence),
          isFuzzy: r.matches === 0,
          matchType: r.matches > 0 ? 'EXACT' : (r.fuzzyHits > 0 ? 'PHONETIC' : 'PARTIAL') as any
        };
      });
  }
}
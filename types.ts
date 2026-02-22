
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface EncryptedDocument {
  id: string;
  filename: string;
  mimeType: string; // Added for multi-format support
  owner: string;
  encryptedContent: string;
  iv: string;
  timestamp: number;
  size: number;
  paddedSize: number;
}

export interface InvertedIndexEntry {
  keywordHash: string;
  documentIds: string[];
  frequencies: Record<string, number>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: string;
  user: string;
  status: 'SUCCESS' | 'FAILURE';
  details: string;
}

export interface SearchResult {
  docId: string;
  filename: string;
  score: number;
  relevance: number;
  confidence: number;
  isFuzzy: boolean;
  matchType: 'EXACT' | 'PHONETIC' | 'PARTIAL';
}

export interface PerformanceMetric {
  label: string;
  value: number;
  size: number;
}

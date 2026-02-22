import { encode, decode } from '../utils/encoding.ts';

const SALT = 'CIPHER_MATCH_V2_PRO_SALT';

export class CryptoService {
  /**
   * Checks if the current environment supports required Crypto APIs.
   * SubtleCrypto requires a "Secure Context" (localhost or HTTPS).
   */
  static isSupported(): boolean {
    return !!(window.crypto && window.crypto.subtle);
  }

  private static async getEncryptionKey(password: string): Promise<CryptoKey> {
    if (!this.isSupported()) {
      throw new Error("SECURE_CONTEXT_REQUIRED: SubtleCrypto is disabled. Please use http://localhost or HTTPS.");
    }
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    
    return crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encryptDocument(data: Uint8Array, password: string): Promise<{ encrypted: string; iv: string }> {
    try {
      const key = await this.getEncryptionKey(password);
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Ensure we pass a clean ArrayBuffer to the API
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      return {
        encrypted: encode(new Uint8Array(encryptedBuffer)),
        iv: encode(iv)
      };
    } catch (error) {
      console.error("Encryption stage failure:", error);
      throw error;
    }
  }

  static async decryptDocument(encryptedBase64: string, ivBase64: string, password: string): Promise<Uint8Array> {
    try {
      const key = await this.getEncryptionKey(password);
      const encrypted = decode(encryptedBase64);
      const iv = decode(ivBase64);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      return new Uint8Array(decryptedBuffer);
    } catch (error) {
      console.error("Decryption failed. Verification error or bad password.");
      throw error;
    }
  }

  static async generateTrapdoor(keyword: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(keyword.toLowerCase().trim() + SALT);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return "hash_error_" + Math.random().toString(36).substr(2, 5);
    }
  }
}
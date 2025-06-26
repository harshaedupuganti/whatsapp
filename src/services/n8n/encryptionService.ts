import CryptoJS from 'crypto-js';

class EncryptionService {
  private readonly encryptionKey: string;

  constructor() {
    this.encryptionKey = import.meta.env.VITE_MESSAGE_ENCRYPTION_KEY || 'default-key-change-in-production';
  }

  public encryptMessage(message: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(message, this.encryptionKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  public decryptMessage(encryptedMessage: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedMessage, this.encryptionKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  public encryptPayload(payload: any): string {
    try {
      const jsonString = JSON.stringify(payload);
      return this.encryptMessage(jsonString);
    } catch (error) {
      console.error('Payload encryption failed:', error);
      throw new Error('Failed to encrypt payload');
    }
  }

  public decryptPayload<T>(encryptedPayload: string): T {
    try {
      const decryptedString = this.decryptMessage(encryptedPayload);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Payload decryption failed:', error);
      throw new Error('Failed to decrypt payload');
    }
  }

  public generateHash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  public verifyHash(data: string, hash: string): boolean {
    return this.generateHash(data) === hash;
  }
}

export const encryptionService = new EncryptionService();
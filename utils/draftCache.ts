import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Global draft data storage
 * Persists across app restarts using AsyncStorage
 */
class DraftCache {
  private static instance: DraftCache;
  private readonly prefix = '@DraftCache:';

  private constructor() {}

  static getInstance(): DraftCache {
    if (!DraftCache.instance) {
      DraftCache.instance = new DraftCache();
    }
    return DraftCache.instance;
  }

  private getStorageKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const storageKey = this.getStorageKey(key);
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(storageKey, jsonValue);
      console.log(`[DraftCache] Set ${key}:`, value);
    } catch (error) {
      console.error(`[DraftCache] Error setting ${key}:`, error);
      throw error;
    }
  }

  async get(key: string): Promise<any> {
    try {
      const storageKey = this.getStorageKey(key);
      const jsonValue = await AsyncStorage.getItem(storageKey);
      const value = jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log(`[DraftCache] Get ${key}:`, value);
      return value;
    } catch (error) {
      console.error(`[DraftCache] Error getting ${key}:`, error);
      return null;
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const storageKey = this.getStorageKey(key);
      const value = await AsyncStorage.getItem(storageKey);
      return value !== null;
    } catch (error) {
      console.error(`[DraftCache] Error checking ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const storageKey = this.getStorageKey(key);
      await AsyncStorage.removeItem(storageKey);
      console.log(`[DraftCache] Deleted ${key}`);
    } catch (error) {
      console.error(`[DraftCache] Error deleting ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      const storageKeys = keys.map(key => this.getStorageKey(key));
      await AsyncStorage.multiRemove(storageKeys);
      console.log(`[DraftCache] Cleared all draft data`);
    } catch (error) {
      console.error(`[DraftCache] Error clearing:`, error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const draftKeys = allKeys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
      return draftKeys;
    } catch (error) {
      console.error(`[DraftCache] Error getting all keys:`, error);
      return [];
    }
  }
}

export default DraftCache.getInstance();

/**
 * Simple LocalStorage service for string operations only
 */
export class LocalStorages {
  /**
   * Get a string from localStorage
   * @param key - The key to retrieve
   * @returns The string value or null if not found
   */
  static get(key: string): string | null {
    return localStorage.getItem(key);
  }

  /**
   * Set a string in localStorage
   * @param key - The key to store under
   * @param value - The string value to store
   */
  static set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  /**
   * Remove an item from localStorage
   * @param key - The key to remove
   */
  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all items from localStorage
   */
  static clear(): void {
    localStorage.clear();
  }
}

// Storage keys constants
export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
} as const; 
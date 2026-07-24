/**
 * Utility to serialize and deserialize key-value data to/from localStorage.
 */
export const BackupSerializer = {
  /**
   * Reads specified keys from localStorage and returns a key-value object.
   * 
   * @param keys Array of localStorage keys to serialize
   * @returns Object mapping keys to values
   */
  serialize(keys: string[]): Record<string, string | null> {
    const backupData: Record<string, string | null> = {};
    keys.forEach(key => {
      backupData[key] = localStorage.getItem(key);
    });
    return backupData;
  },

  /**
   * Overwrites specified keys in localStorage with values from the given object.
   * If a value is null, the key is removed.
   * 
   * @param data Object mapping keys to values to restore
   */
  deserialize(data: Record<string, string | null>): void {
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== null && value !== undefined) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    });
  }
};

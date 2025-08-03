/**
 * Formats a file size in bytes to a human-readable string (KB, MB, GB)
 * @param bytes - The size in bytes
 * @returns A formatted string with the appropriate unit (KB, MB, or GB)
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  // Determine the appropriate unit
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Calculate the value in the appropriate unit
  // Round to 2 decimal places and remove trailing zeros
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  
  return `${value} ${sizes[i]}`;
}
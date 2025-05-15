/**
 * Upload configuration constants
 */
export const UPLOAD_CONFIG = {
  /**
   * Threshold in bytes above which to use chunked upload
   */
  CHUNKED_UPLOAD_THRESHOLD: 5 * 1024 * 1024, // 5MB
  
  /**
   * Size of each chunk in bytes
   */
  CHUNK_SIZE: 3 * 1024 * 1024, // 3MB chunks
  
  /**
   * Maximum number of chunks to upload in parallel
   */
  MAX_CONCURRENT_UPLOADS: 4
}; 
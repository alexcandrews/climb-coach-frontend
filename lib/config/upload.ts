/**
 * Upload configuration constants for the direct-to-storage flow.
 */
export const UPLOAD_CONFIG = {
  /**
   * Threshold in bytes after which we fall back to resumable uploads (Supabase recommends 6 MB).
   */
  RESUMABLE_UPLOAD_THRESHOLD: 6 * 1024 * 1024,

  /**
   * Preferred chunk size for tus-js-client uploads.
   */
  RESUMABLE_CHUNK_SIZE: 6 * 1024 * 1024,

  /**
   * Cache control header to send when uploading to storage.
   */
  DEFAULT_CACHE_CONTROL: '3600',

  /**
   * Maximum number of retry attempts for resumable upload failures.
   */
  MAX_RESUMABLE_RETRIES: 5
};

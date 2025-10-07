/**
 * Upload configuration constants for the direct-to-storage flow.
 *
 * NOTE: MAX_FILE_SIZE must match the backend MAX_FILE_SIZE_MB environment variable.
 * Default backend configuration is 50MB (Supabase free tier limit).
 */
export const UPLOAD_CONFIG = {
  /**
   * Maximum file size in bytes (must match backend MAX_FILE_SIZE_MB).
   * Default: 50MB (Supabase free tier limit)
   * Pro tier: 5GB (5120MB)
   */
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  MAX_FILE_SIZE_MB: 50,

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

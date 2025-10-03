/**
 * Centralized logging utility for ClimbCoach frontend
 *
 * Production logs are sanitized and emoji-free
 * Development logs include full context for debugging
 *
 * Usage:
 *   logger.dev('Debug info:', data)        // Only logs in __DEV__
 *   logger.error('Error occurred:', err)   // Logs in all envs (sanitized in prod)
 *   logger.warn('Warning:', details)       // Logs warnings (sanitized in prod)
 */

const isDev = __DEV__;

/**
 * Sanitize potentially sensitive data from logs
 * Removes tokens, API keys, and other sensitive information
 */
const sanitize = (data: any): any => {
  if (typeof data === 'string') {
    return data
      // Remove Bearer tokens
      .replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
      // Remove API keys (sk-... format)
      .replace(/sk-[a-zA-Z0-9-_]+/g, '[API_KEY_REDACTED]')
      // Remove JWT tokens (eyXxx.eyXxx.xxx format)
      .replace(
        /ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g,
        '[TOKEN_REDACTED]'
      )
      // Remove potential passwords in query strings
      .replace(/([?&])(password|pwd|token|key|secret)=[^&]*/gi, '$1$2=[REDACTED]');
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = Array.isArray(data) ? [] : {};
    for (const key in data) {
      // Don't log sensitive fields
      if (
        ['password', 'token', 'apiKey', 'secret', 'authorization'].some((s) =>
          key.toLowerCase().includes(s)
        )
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitize(data[key]);
      }
    }
    return sanitized;
  }

  return data;
};

const logger = {
  /**
   * Development-only logging
   * Only logs when __DEV__ is true
   * Use for debugging, verbose output, non-critical info
   */
  dev: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Error logging
   * Logs in all environments, but sanitizes sensitive data in production
   * Use for actual errors that should be tracked
   */
  error: (message: string, ...args: any[]) => {
    if (isDev) {
      // Development: log everything for debugging
      console.error(message, ...args);
    } else {
      // Production: sanitize sensitive data
      console.error(message, ...args.map(sanitize));
    }
  },

  /**
   * Warning logging
   * Logs in all environments, but sanitizes sensitive data in production
   * Use for warnings that should be tracked but aren't critical
   */
  warn: (message: string, ...args: any[]) => {
    if (isDev) {
      console.warn(message, ...args);
    } else {
      console.warn(message, ...args.map(sanitize));
    }
  },
};

export default logger;

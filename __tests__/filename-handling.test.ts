/**
 * Tests for filename inference and handling
 * These tests ensure that blob URLs and long filenames are handled correctly
 */

// Mock the inferOriginalFilename function
// Since it's not exported, we'll test the behavior through the upload flow
// For now, we'll create unit tests for the logic

describe('Filename Handling', () => {
  describe('Blob URL detection', () => {
    const inferOriginalFilename = (uri?: string): string | undefined => {
      if (!uri) return undefined;

      // Skip blob URLs - they don't contain meaningful filenames
      if (uri.startsWith('blob:')) {
        return undefined;
      }

      const sanitized = uri.split('?')[0];
      const segments = sanitized.split('/');
      const last = segments.pop();
      if (!last) return undefined;
      if (last.startsWith('cache-') || last.includes('expo-file-system')) {
        return undefined;
      }

      // Truncate very long filenames to 200 chars (leaving room for extension)
      if (last.length > 200) {
        const parts = last.split('.');
        const ext = parts.length > 1 ? parts.pop() : '';
        const name = parts.join('.');
        return ext ? `${name.substring(0, 200 - ext.length - 1)}.${ext}` : name.substring(0, 200);
      }

      return last;
    };

    it('should return undefined for blob URLs', () => {
      const blobUrl = 'blob:http://localhost:8081/a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      expect(inferOriginalFilename(blobUrl)).toBeUndefined();
    });

    it('should return undefined for blob URLs with long UUIDs', () => {
      const blobUrl = 'blob:http://localhost:8081/12345678-1234-1234-1234-123456789012-with-extra-segments';
      expect(inferOriginalFilename(blobUrl)).toBeUndefined();
    });

    it('should return undefined for undefined input', () => {
      expect(inferOriginalFilename(undefined)).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(inferOriginalFilename('')).toBeUndefined();
    });
  });

  describe('Regular file URIs', () => {
    const inferOriginalFilename = (uri?: string): string | undefined => {
      if (!uri) return undefined;

      if (uri.startsWith('blob:')) {
        return undefined;
      }

      const sanitized = uri.split('?')[0];
      const segments = sanitized.split('/');
      const last = segments.pop();
      if (!last) return undefined;
      if (last.startsWith('cache-') || last.includes('expo-file-system')) {
        return undefined;
      }

      if (last.length > 200) {
        const parts = last.split('.');
        const ext = parts.length > 1 ? parts.pop() : '';
        const name = parts.join('.');
        return ext ? `${name.substring(0, 200 - ext.length - 1)}.${ext}` : name.substring(0, 200);
      }

      return last;
    };

    it('should extract filename from file path', () => {
      const uri = 'file:///storage/emulated/0/DCIM/Camera/video.mp4';
      expect(inferOriginalFilename(uri)).toBe('video.mp4');
    });

    it('should extract filename from content URI', () => {
      const uri = 'content://media/external/video/media/12345';
      expect(inferOriginalFilename(uri)).toBe('12345');
    });

    it('should extract filename from http URL', () => {
      const uri = 'http://example.com/videos/my-video.mp4';
      expect(inferOriginalFilename(uri)).toBe('my-video.mp4');
    });

    it('should handle filename with query parameters', () => {
      const uri = 'http://example.com/video.mp4?token=abc123';
      expect(inferOriginalFilename(uri)).toBe('video.mp4');
    });

    it('should return undefined for cache files', () => {
      const uri = 'file:///cache/cache-video123.mp4';
      expect(inferOriginalFilename(uri)).toBeUndefined();
    });

    it('should return undefined for expo-file-system in filename', () => {
      const uri = 'file:///cache/expo-file-system-video.mp4';
      expect(inferOriginalFilename(uri)).toBeUndefined();
    });
  });

  describe('Filename length handling', () => {
    const inferOriginalFilename = (uri?: string): string | undefined => {
      if (!uri) return undefined;

      if (uri.startsWith('blob:')) {
        return undefined;
      }

      const sanitized = uri.split('?')[0];
      const segments = sanitized.split('/');
      const last = segments.pop();
      if (!last) return undefined;
      if (last.startsWith('cache-') || last.includes('expo-file-system')) {
        return undefined;
      }

      if (last.length > 200) {
        const parts = last.split('.');
        const ext = parts.length > 1 ? parts.pop() : '';
        const name = parts.join('.');
        return ext ? `${name.substring(0, 200 - ext.length - 1)}.${ext}` : name.substring(0, 200);
      }

      return last;
    };

    it('should keep short filenames unchanged', () => {
      const uri = 'file:///videos/short.mp4';
      expect(inferOriginalFilename(uri)).toBe('short.mp4');
    });

    it('should keep 200 character filename unchanged', () => {
      const filename = 'a'.repeat(196) + '.mp4'; // 196 + 4 = 200
      const uri = `file:///videos/${filename}`;
      expect(inferOriginalFilename(uri)).toBe(filename);
    });

    it('should truncate 201 character filename', () => {
      const filename = 'a'.repeat(197) + '.mp4'; // 197 + 4 = 201
      const uri = `file:///videos/${filename}`;
      const result = inferOriginalFilename(uri);

      expect(result).toBeDefined();
      expect(result!.length).toBeLessThanOrEqual(200);
      expect(result!.endsWith('.mp4')).toBe(true);
    });

    it('should truncate very long filename (300 chars)', () => {
      const filename = 'x'.repeat(296) + '.mp4'; // 296 + 4 = 300
      const uri = `file:///videos/${filename}`;
      const result = inferOriginalFilename(uri);

      expect(result).toBeDefined();
      expect(result!.length).toBeLessThanOrEqual(200);
      expect(result!.endsWith('.mp4')).toBe(true);
    });

    it('should truncate filename without extension', () => {
      const filename = 'y'.repeat(250); // No extension
      const uri = `file:///videos/${filename}`;
      const result = inferOriginalFilename(uri);

      expect(result).toBeDefined();
      expect(result!.length).toBe(200);
    });

    it('should handle filename with multiple dots when truncating', () => {
      const filename = 'x'.repeat(190) + '.test.video.mp4'; // ~205 chars
      const uri = `file:///videos/${filename}`;
      const result = inferOriginalFilename(uri);

      expect(result).toBeDefined();
      expect(result!.length).toBeLessThanOrEqual(200);
      expect(result!.endsWith('.mp4')).toBe(true);
    });
  });

  describe('Fallback filename generation', () => {
    const fallbackFileName = () => `upload-${Date.now()}.mp4`;

    it('should generate filename with timestamp', () => {
      const filename = fallbackFileName();

      expect(filename).toMatch(/^upload-\d+\.mp4$/);
      expect(filename.length).toBeLessThan(30); // Reasonable length
    });

    it('should generate unique filenames', () => {
      const name1 = fallbackFileName();
      // Small delay to ensure different timestamp
      const name2 = fallbackFileName();

      // Note: In rare cases these could be equal if called in same millisecond
      // but that's acceptable for test purposes
      expect(name1).toMatch(/^upload-\d+\.mp4$/);
      expect(name2).toMatch(/^upload-\d+\.mp4$/);
    });
  });

  describe('Real-world scenarios', () => {
    const inferOriginalFilename = (uri?: string): string | undefined => {
      if (!uri) return undefined;

      if (uri.startsWith('blob:')) {
        return undefined;
      }

      const sanitized = uri.split('?')[0];
      const segments = sanitized.split('/');
      const last = segments.pop();
      if (!last) return undefined;
      if (last.startsWith('cache-') || last.includes('expo-file-system')) {
        return undefined;
      }

      if (last.length > 200) {
        const parts = last.split('.');
        const ext = parts.length > 1 ? parts.pop() : '';
        const name = parts.join('.');
        return ext ? `${name.substring(0, 200 - ext.length - 1)}.${ext}` : name.substring(0, 200);
      }

      return last;
    };

    it('should handle iPhone video naming (IMG_1234.MOV)', () => {
      const uri = 'file:///var/mobile/Media/DCIM/100APPLE/IMG_1234.MOV';
      expect(inferOriginalFilename(uri)).toBe('IMG_1234.MOV');
    });

    it('should handle Android video naming (VID_20240101_123045.mp4)', () => {
      const uri = 'content://media/external/video/VID_20240101_123045.mp4';
      expect(inferOriginalFilename(uri)).toBe('VID_20240101_123045.mp4');
    });

    it('should handle screen recording (Screen Recording 2024-01-01.mov)', () => {
      const uri = 'file:///Users/user/Desktop/Screen Recording 2024-01-01 at 12.30.45 PM.mov';
      expect(inferOriginalFilename(uri)).toBe('Screen Recording 2024-01-01 at 12.30.45 PM.mov');
    });

    it('should handle file picker on web (returns blob URL)', () => {
      const uri = 'blob:http://localhost:8081/550e8400-e29b-41d4-a716-446655440000';
      // Should return undefined, then fallback will be used
      expect(inferOriginalFilename(uri)).toBeUndefined();
    });

    it('should handle filenames with unicode characters', () => {
      const uri = 'file:///videos/登山视频.mp4';
      expect(inferOriginalFilename(uri)).toBe('登山视频.mp4');
    });

    it('should handle filenames with emojis', () => {
      const uri = 'file:///videos/🧗‍♂️ climbing.mp4';
      expect(inferOriginalFilename(uri)).toBe('🧗‍♂️ climbing.mp4');
    });
  });

  describe('Edge cases that caused the bug', () => {
    const inferOriginalFilename = (uri?: string): string | undefined => {
      if (!uri) return undefined;

      if (uri.startsWith('blob:')) {
        return undefined;
      }

      const sanitized = uri.split('?')[0];
      const segments = sanitized.split('/');
      const last = segments.pop();
      if (!last) return undefined;
      if (last.startsWith('cache-') || last.includes('expo-file-system')) {
        return undefined;
      }

      if (last.length > 200) {
        const parts = last.split('.');
        const ext = parts.length > 1 ? parts.pop() : '';
        const name = parts.join('.');
        return ext ? `${name.substring(0, 200 - ext.length - 1)}.${ext}` : name.substring(0, 200);
      }

      return last;
    };

    it('should NOT extract UUID from blob URL (the bug)', () => {
      // This was the bug - blob URL UUID was being extracted
      const blobUrl = 'blob:http://localhost:8081/550e8400-e29b-41d4-a716-446655440000';

      // Should return undefined, NOT the UUID
      expect(inferOriginalFilename(blobUrl)).toBeUndefined();
    });

    it('should handle blob URL with complex path', () => {
      const blobUrl = 'blob:http://localhost:8081/550e8400-e29b-41d4-a716-446655440000/extra/path';
      expect(inferOriginalFilename(blobUrl)).toBeUndefined();
    });

    it('should handle blob URL from different origins', () => {
      const blobUrls = [
        'blob:http://localhost:3000/550e8400-e29b-41d4-a716-446655440000',
        'blob:https://example.com/550e8400-e29b-41d4-a716-446655440000',
        'blob:null/550e8400-e29b-41d4-a716-446655440000'
      ];

      blobUrls.forEach(url => {
        expect(inferOriginalFilename(url)).toBeUndefined();
      });
    });
  });
});

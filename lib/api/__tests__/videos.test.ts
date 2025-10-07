import api from '../../api';
import supabase from '../../supabase';
import * as FileSystem from 'expo-file-system';
import { Upload } from 'tus-js-client';
import { Platform } from 'react-native';
import {
  getUserVideos,
  getVideo,
  uploadVideo,
  uploadVideoDirectToSupabase,
  checkVideoProcessingStatus,
  updateVideoMetadata,
} from '../videos';
import { MockedSupabaseClient } from '../test-mocks';

// Mock modules
jest.mock('../../api');
jest.mock('../../supabase');
jest.mock('expo-file-system');
jest.mock('tus-js-client');

const mockApi = api as jest.Mocked<typeof api>;
const mockSupabase = supabase as unknown as MockedSupabaseClient;
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('videos API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserVideos', () => {
    it('should return videos when API call succeeds', async () => {
      const mockVideos = [
        { id: '1', name: 'Video 1', createdAt: '2024-01-01', size: 1000, contentType: 'video/mp4', url: 'http://example.com/video1.mp4' },
        { id: '2', name: 'Video 2', createdAt: '2024-01-02', size: 2000, contentType: 'video/mp4', url: 'http://example.com/video2.mp4' },
      ];

      mockApi.get.mockResolvedValue({
        status: 200,
        data: { videos: mockVideos },
      } as any);

      const result = await getUserVideos();

      expect(mockApi.get).toHaveBeenCalledWith('/api/videos');
      expect(result).toEqual(mockVideos);
    });

    it('should return empty array when API call fails', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      const result = await getUserVideos();

      expect(result).toEqual([]);
    });

    it('should return empty array when response has no videos', async () => {
      mockApi.get.mockResolvedValue({
        status: 200,
        data: {},
      } as any);

      const result = await getUserVideos();

      expect(result).toEqual([]);
    });
  });

  describe('getVideo', () => {
    it('should return video details when API call succeeds', async () => {
      const mockVideo = {
        id: '1',
        title: 'Test Video',
        videoUrl: 'http://example.com/video.mp4',
        createdAt: '2024-01-01',
        insights: [],
        analysis_status: 'complete',
      };

      mockApi.get.mockResolvedValue({
        status: 200,
        data: mockVideo,
      } as any);

      const result = await getVideo('1');

      expect(mockApi.get).toHaveBeenCalledWith('/api/videos/1');
      expect(result).toEqual(mockVideo);
    });

    it('should add analysis_status field if missing', async () => {
      const mockVideo = {
        id: '1',
        title: 'Test Video',
        videoUrl: 'http://example.com/video.mp4',
        createdAt: '2024-01-01',
        insights: [],
      };

      mockApi.get.mockResolvedValue({
        status: 200,
        data: mockVideo,
      } as any);

      const result = await getVideo('1');

      expect(result).toEqual({
        ...mockVideo,
        analysis_status: 'uploading',
      });
    });

    it('should return null when API call fails', async () => {
      mockApi.get.mockRejectedValue(new Error('Not found'));

      const result = await getVideo('1');

      expect(result).toBeNull();
    });
  });

  describe('checkVideoProcessingStatus', () => {
    it('should return complete status when insights are present', async () => {
      mockApi.get.mockResolvedValue({
        status: 200,
        data: {
          coachingMoments: [
            { timestamp: 5, feedback: 'Good form', type: 'form', confidence: 0.9 },
          ],
        },
      } as any);

      const result = await checkVideoProcessingStatus('1');

      expect(mockApi.get).toHaveBeenCalledWith('/api/videos/1/insights');
      expect(result).toEqual({
        status: 'complete',
        hasInsights: true,
        insightsCount: 1,
      });
    });

    it('should return pending status when no insights', async () => {
      mockApi.get.mockResolvedValue({
        status: 200,
        data: {
          coachingMoments: [],
          analysis_status: 'processing',
        },
      } as any);

      const result = await checkVideoProcessingStatus('1');

      expect(result).toEqual({
        status: 'pending',
        hasInsights: false,
        insightsCount: 0,
      });
    });

    it('should return error status from analysis_status field', async () => {
      mockApi.get.mockResolvedValue({
        status: 200,
        data: {
          coachingMoments: [],
          analysis_status: 'error',
        },
      } as any);

      const result = await checkVideoProcessingStatus('1');

      expect(result).toEqual({
        status: 'error',
        hasInsights: false,
        insightsCount: 0,
      });
    });

    it('should return unknown status on API error', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      const result = await checkVideoProcessingStatus('1');

      expect(result).toEqual({
        status: 'unknown',
        hasInsights: false,
        insightsCount: 0,
      });
    });
  });

  describe('updateVideoMetadata', () => {
    it('should update metadata successfully', async () => {
      mockApi.patch.mockResolvedValue({ status: 200, data: {} } as any);

      const result = await updateVideoMetadata('1', {
        title: 'Updated Title',
        location: 'Gym A',
      });

      expect(mockApi.patch).toHaveBeenCalledWith('/api/videos/1', {
        title: 'Updated Title',
        location: 'Gym A',
      });
      expect(result).toBe(true);
    });

    it('should trim metadata values', async () => {
      mockApi.patch.mockResolvedValue({ status: 200, data: {} } as any);

      await updateVideoMetadata('1', {
        title: '  Padded Title  ',
        location: '  Gym A  ',
      });

      expect(mockApi.patch).toHaveBeenCalledWith('/api/videos/1', {
        title: 'Padded Title',
        location: 'Gym A',
      });
    });

    it('should convert empty location to null', async () => {
      mockApi.patch.mockResolvedValue({ status: 200, data: {} } as any);

      await updateVideoMetadata('1', {
        location: '  ',
      });

      expect(mockApi.patch).toHaveBeenCalledWith('/api/videos/1', {
        location: null,
      });
    });

    it('should retry on failure', async () => {
      mockApi.patch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ status: 200, data: {} } as any);

      const result = await updateVideoMetadata('1', { title: 'Test' });

      expect(mockApi.patch).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });

    it('should return false after retry fails', async () => {
      mockApi.patch.mockRejectedValue(new Error('Network error'));

      const result = await updateVideoMetadata('1', { title: 'Test' });

      expect(mockApi.patch).toHaveBeenCalledTimes(2);
      expect(result).toBe(false);
    });
  });

  describe('uploadVideoDirectToSupabase', () => {
    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null,
      } as any);

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      } as any);
    });

    it('should throw error if no video URI provided', async () => {
      await expect(
        uploadVideoDirectToSupabase({ videoUri: '' })
      ).rejects.toThrow('No video selected');
    });

    it('should throw error if not authenticated', async () => {
      Platform.OS = 'ios';
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        size: 10_000_000,
      } as any);

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      await expect(
        uploadVideoDirectToSupabase({ videoUri: 'file:///test.mp4' })
      ).rejects.toThrow('Not authenticated');
    });

    it('should throw error if file does not exist on mobile', async () => {
      Platform.OS = 'ios';
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
      } as any);

      await expect(
        uploadVideoDirectToSupabase({ videoUri: 'file:///test.mp4' })
      ).rejects.toThrow('Video file not found at provided URI');
    });

    it('should throw error if file is empty', async () => {
      Platform.OS = 'ios';
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        size: 0,
      } as any);

      await expect(
        uploadVideoDirectToSupabase({ videoUri: 'file:///test.mp4' })
      ).rejects.toThrow('Video file appears to be empty');
    });

    it('should successfully upload video via TUS (large file)', async () => {
      Platform.OS = 'ios';
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        size: 60_000_000, // 60MB - above resumable threshold
      } as any);

      mockApi.post.mockResolvedValueOnce({
        status: 200,
        data: {
          videoId: 'video-123',
          objectName: 'videos/video-123.mp4',
          publicUrl: 'http://example.com/video-123.mp4',
          uploadUrl: 'http://example.com/upload',
          bucket: 'videos-complete',
          useTus: true,
          chunkSize: 6_000_000,
        },
      } as any);

      mockApi.post.mockResolvedValueOnce({
        status: 200,
        data: { status: 'processing' },
      } as any);

      let mockUploadInstance: any;
      (Upload as jest.MockedClass<typeof Upload>).mockImplementation((data, options: any) => {
        mockUploadInstance = {
          start: jest.fn(() => {
            // Simulate successful upload
            options.onSuccess();
          }),
        };
        return mockUploadInstance;
      });

      const progressCallback = jest.fn();
      const result = await uploadVideoDirectToSupabase({
        videoUri: 'file:///test.mp4',
        title: 'Test Video',
        location: 'Gym A',
        onProgress: progressCallback,
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/videos/upload/initialize',
        expect.objectContaining({
          title: 'Test Video',
          location: 'Gym A',
          fileSize: 60_000_000,
        })
      );

      expect(Upload).toHaveBeenCalledWith(
        expect.objectContaining({
          uri: 'file:///test.mp4',
        }),
        expect.objectContaining({
          endpoint: 'http://example.com/upload',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/videos/video-123/mark-uploaded',
        expect.objectContaining({
          fileSize: 60_000_000,
        })
      );

      expect(result).toEqual({
        url: 'http://example.com/video-123.mp4',
        id: 'video-123',
        status: 'processing',
      });

      expect(progressCallback).toHaveBeenCalledWith(100);
    });

    it('should handle TUS upload errors', async () => {
      Platform.OS = 'ios';
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        size: 60_000_000,
      } as any);

      mockApi.post.mockResolvedValueOnce({
        status: 200,
        data: {
          videoId: 'video-123',
          objectName: 'videos/video-123.mp4',
          uploadUrl: 'http://example.com/upload',
          useTus: true,
        },
      } as any);

      (Upload as jest.MockedClass<typeof Upload>).mockImplementation((data, options: any) => ({
        start: jest.fn(() => {
          options.onError(new Error('Upload failed'));
        }),
      } as any));

      await expect(
        uploadVideoDirectToSupabase({ videoUri: 'file:///test.mp4' })
      ).rejects.toThrow('Upload failed');
    });

    it('should use direct upload for small files', async () => {
      Platform.OS = 'web';

      const mockBlob = new Blob(['mock-video-content'], { type: 'video/mp4' });

      global.fetch = jest.fn().mockResolvedValue({
        blob: jest.fn().mockResolvedValue(mockBlob),
      } as any);

      mockApi.post.mockResolvedValueOnce({
        status: 200,
        data: {
          videoId: 'video-123',
          objectName: 'videos/video-123.mp4',
          publicUrl: 'http://example.com/video-123.mp4',
          uploadUrl: 'http://example.com/upload',
          bucket: 'videos-complete',
          useTus: false,
        },
      } as any);

      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
      } as any);

      mockApi.post.mockResolvedValueOnce({
        status: 200,
        data: { status: 'processing' },
      } as any);

      const result = await uploadVideoDirectToSupabase({
        videoUri: 'blob:http://localhost/mock-video',
      });

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('videos-complete');
      expect(result).toEqual({
        url: 'http://example.com/video-123.mp4',
        id: 'video-123',
        status: 'processing',
      });
    });

    it('should call progress callback at key points', async () => {
      Platform.OS = 'ios';
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        size: 60_000_000,
      } as any);

      mockApi.post.mockResolvedValueOnce({
        status: 200,
        data: {
          videoId: 'video-123',
          objectName: 'videos/video-123.mp4',
          publicUrl: 'http://example.com/video-123.mp4',
          uploadUrl: 'http://example.com/upload',
          useTus: true,
        },
      } as any);

      (Upload as jest.MockedClass<typeof Upload>).mockImplementation((data, options: any) => ({
        start: jest.fn(() => {
          // Simulate progress updates
          options.onProgress(30_000_000, 60_000_000);
          options.onProgress(60_000_000, 60_000_000);
          options.onSuccess();
        }),
      } as any));

      mockApi.post.mockResolvedValueOnce({
        status: 200,
        data: { status: 'processing' },
      } as any);

      const progressCallback = jest.fn();
      await uploadVideoDirectToSupabase({
        videoUri: 'file:///test.mp4',
        onProgress: progressCallback,
      });

      // Should be called with: 5 (init), progress values, 100 (complete)
      expect(progressCallback).toHaveBeenCalledWith(5);
      expect(progressCallback).toHaveBeenCalledWith(expect.any(Number)); // Progress updates
      expect(progressCallback).toHaveBeenCalledWith(100);
    });
  });

  describe('uploadVideo', () => {
    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null,
      } as any);

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      } as any);
    });

    it('should delegate to uploadVideoDirectToSupabase', async () => {
      Platform.OS = 'ios';
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        size: 10_000_000,
      } as any);

      mockApi.post.mockResolvedValueOnce({
        status: 200,
        data: {
          videoId: 'video-123',
          objectName: 'videos/video-123.mp4',
          publicUrl: 'http://example.com/video-123.mp4',
          uploadUrl: 'http://example.com/upload',
          bucket: 'videos-complete',
          useTus: false,
        },
      } as any);

      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
      } as any);

      mockApi.post.mockResolvedValueOnce({
        status: 200,
        data: { status: 'processing' },
      } as any);

      const result = await uploadVideo('file:///test.mp4');

      expect(result).toEqual({
        url: 'http://example.com/video-123.mp4',
        id: 'video-123',
        status: 'processing',
      });
    });

    it('should handle and format errors from API', async () => {
      Platform.OS = 'ios';
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        size: 10_000_000,
      } as any);

      // Reject during initialization
      mockApi.post.mockRejectedValueOnce({
        response: {
          status: 413,
          data: { error: 'File too large' },
        },
      });

      const result = await uploadVideo('file:///test.mp4');

      expect(result).toEqual({
        error: 'File too large',
        status: 'error',
      });
    });

    it('should handle network errors', async () => {
      Platform.OS = 'ios';
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        size: 10_000_000,
      } as any);

      // Reject with network error
      mockApi.post.mockRejectedValueOnce({
        request: {},
      });

      const result = await uploadVideo('file:///test.mp4');

      expect(result).toEqual({
        error: 'No response from server. Check your internet connection.',
        status: 'error',
      });
    });
  });
});

import { renderHook, waitFor } from '@testing-library/react-native';
import { useVideos } from '../useVideos';
import { getApiClient } from '../../client';

// Mock the API client
jest.mock('../../client');

const mockGetApiClient = getApiClient as jest.MockedFunction<typeof getApiClient>;

describe('useVideos hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch videos on mount', async () => {
    const mockVideos = [
      { id: '1', title: 'Video 1', videoUrl: 'http://example.com/1.mp4', createdAt: '2024-01-01' },
      { id: '2', title: 'Video 2', videoUrl: 'http://example.com/2.mp4', createdAt: '2024-01-02' },
    ];

    const mockApi = {
      videos: {
        getApiVideos: jest.fn().mockResolvedValue(mockVideos),
      },
    };

    mockGetApiClient.mockResolvedValue(mockApi as any);

    const { result } = renderHook(() => useVideos());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.videos).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.videos).toEqual(mockVideos);
    expect(result.current.error).toBeNull();
    expect(mockApi.videos.getApiVideos).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors', async () => {
    const mockApi = {
      videos: {
        getApiVideos: jest.fn().mockRejectedValue(new Error('Network error')),
      },
    };

    mockGetApiClient.mockResolvedValue(mockApi as any);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useVideos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.videos).toEqual([]);
    expect(result.current.error).toBe('Failed to load videos');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching videos:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('should handle non-array response', async () => {
    const mockApi = {
      videos: {
        getApiVideos: jest.fn().mockResolvedValue({ data: 'not-an-array' }),
      },
    };

    mockGetApiClient.mockResolvedValue(mockApi as any);

    const { result } = renderHook(() => useVideos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.videos).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should refetch videos when refetch is called', async () => {
    const mockVideos = [
      { id: '1', title: 'Video 1', videoUrl: 'http://example.com/1.mp4', createdAt: '2024-01-01' },
    ];

    const updatedVideos = [
      { id: '1', title: 'Video 1', videoUrl: 'http://example.com/1.mp4', createdAt: '2024-01-01' },
      { id: '2', title: 'Video 2', videoUrl: 'http://example.com/2.mp4', createdAt: '2024-01-02' },
    ];

    const mockApi = {
      videos: {
        getApiVideos: jest.fn()
          .mockResolvedValueOnce(mockVideos)
          .mockResolvedValueOnce(updatedVideos),
      },
    };

    mockGetApiClient.mockResolvedValue(mockApi as any);

    const { result } = renderHook(() => useVideos());

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.videos).toEqual(mockVideos);

    // Trigger refetch
    await waitFor(() => {
      result.current.refetch();
    });

    // Wait for refetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.videos).toEqual(updatedVideos);
    expect(mockApi.videos.getApiVideos).toHaveBeenCalledTimes(2);
  });

  it('should clear error when refetching', async () => {
    const mockApi = {
      videos: {
        getApiVideos: jest.fn()
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce([]),
      },
    };

    mockGetApiClient.mockResolvedValue(mockApi as any);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useVideos());

    // Wait for initial fetch to fail
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load videos');

    // Trigger refetch
    await waitFor(() => {
      result.current.refetch();
    });

    // Wait for refetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.videos).toEqual([]);

    consoleErrorSpy.mockRestore();
  });

  it('should set loading state correctly during refetch', async () => {
    const mockApi = {
      videos: {
        getApiVideos: jest.fn().mockResolvedValue([]),
      },
    };

    mockGetApiClient.mockResolvedValue(mockApi as any);

    const { result } = renderHook(() => useVideos());

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loading).toBe(false);

    // Trigger refetch and verify loading becomes true
    await waitFor(() => {
      result.current.refetch();
    });

    // Wait for refetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loading).toBe(false);
    expect(mockApi.videos.getApiVideos).toHaveBeenCalledTimes(2);
  });
});

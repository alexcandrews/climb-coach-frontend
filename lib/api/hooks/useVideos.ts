import { useState, useEffect } from 'react';
import { getApiClient } from '../client';
import { Video } from '../generated/models/Video';

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const api = await getApiClient();
      
      // Use the videos service that's already part of the API client
      const response = await api.videos.getApiVideos();
      setVideos(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    loading,
    error,
    refetch: fetchVideos
  };
};

export default useVideos; 
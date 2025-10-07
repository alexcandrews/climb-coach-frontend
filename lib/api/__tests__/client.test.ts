import { getApiClient, resetApiClient } from '../client';
import supabase from '../../supabase';
import { ClimbCoachApi } from '../generated/ClimbCoachApi';
import { API_CONFIG } from '@/app/config';
import { MockedSupabaseClient } from '../test-mocks';

// Mock modules
jest.mock('../../supabase');
jest.mock('../generated/ClimbCoachApi');
jest.mock('@/app/config', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:8080',
  },
}));

const mockSupabase = supabase as unknown as MockedSupabaseClient;
const MockClimbCoachApi = ClimbCoachApi as jest.MockedClass<typeof ClimbCoachApi>;

describe('API client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetApiClient();
  });

  describe('getApiClient', () => {
    it('should create API client with auth token', async () => {
      const mockSession = {
        access_token: 'test-token-123',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      await getApiClient();

      expect(MockClimbCoachApi).toHaveBeenCalledWith({
        BASE: 'http://localhost:8080',
        HEADERS: {
          Authorization: 'Bearer test-token-123',
          'Content-Type': 'application/json',
        },
      });
    });

    it('should create API client without auth token when session is null', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      await getApiClient();

      expect(MockClimbCoachApi).toHaveBeenCalledWith({
        BASE: 'http://localhost:8080',
        HEADERS: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should reuse existing client with same token', async () => {
      const mockSession = {
        access_token: 'test-token-123',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const client1 = await getApiClient();
      const client2 = await getApiClient();

      expect(client1).toBe(client2);
      expect(MockClimbCoachApi).toHaveBeenCalledTimes(1);
    });

    it('should create new client when token changes', async () => {
      mockSupabase.auth.getSession
        .mockResolvedValueOnce({
          data: { session: { access_token: 'token-1' } },
          error: null,
        } as any)
        .mockResolvedValueOnce({
          data: { session: { access_token: 'token-2' } },
          error: null,
        } as any);

      const client1 = await getApiClient();
      const client2 = await getApiClient();

      expect(client1).not.toBe(client2);
      expect(MockClimbCoachApi).toHaveBeenCalledTimes(2);
      expect(MockClimbCoachApi).toHaveBeenNthCalledWith(1, {
        BASE: 'http://localhost:8080',
        HEADERS: {
          Authorization: 'Bearer token-1',
          'Content-Type': 'application/json',
        },
      });
      expect(MockClimbCoachApi).toHaveBeenNthCalledWith(2, {
        BASE: 'http://localhost:8080',
        HEADERS: {
          Authorization: 'Bearer token-2',
          'Content-Type': 'application/json',
        },
      });
    });

    it('should create new client when transitioning from authenticated to unauthenticated', async () => {
      mockSupabase.auth.getSession
        .mockResolvedValueOnce({
          data: { session: { access_token: 'token-1' } },
          error: null,
        } as any)
        .mockResolvedValueOnce({
          data: { session: null },
          error: null,
        } as any);

      const client1 = await getApiClient();
      const client2 = await getApiClient();

      expect(client1).not.toBe(client2);
      expect(MockClimbCoachApi).toHaveBeenCalledTimes(2);
      expect(MockClimbCoachApi).toHaveBeenNthCalledWith(1, {
        BASE: 'http://localhost:8080',
        HEADERS: {
          Authorization: 'Bearer token-1',
          'Content-Type': 'application/json',
        },
      });
      expect(MockClimbCoachApi).toHaveBeenNthCalledWith(2, {
        BASE: 'http://localhost:8080',
        HEADERS: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should create new client when transitioning from unauthenticated to authenticated', async () => {
      mockSupabase.auth.getSession
        .mockResolvedValueOnce({
          data: { session: null },
          error: null,
        } as any)
        .mockResolvedValueOnce({
          data: { session: { access_token: 'token-1' } },
          error: null,
        } as any);

      const client1 = await getApiClient();
      const client2 = await getApiClient();

      expect(client1).not.toBe(client2);
      expect(MockClimbCoachApi).toHaveBeenCalledTimes(2);
    });

    it('should store token reference on client instance', async () => {
      const mockSession = {
        access_token: 'test-token-123',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const client = await getApiClient();

      expect((client as any)._token).toBe('test-token-123');
    });
  });

  describe('resetApiClient', () => {
    it('should clear the cached client', async () => {
      const mockSession = {
        access_token: 'test-token-123',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const client1 = await getApiClient();

      resetApiClient();

      const client2 = await getApiClient();

      expect(client1).not.toBe(client2);
      expect(MockClimbCoachApi).toHaveBeenCalledTimes(2);
    });

    it('should allow creating new client after reset', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token-1' } },
        error: null,
      } as any);

      await getApiClient();

      resetApiClient();

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      await getApiClient();

      expect(MockClimbCoachApi).toHaveBeenCalledTimes(2);
      expect(MockClimbCoachApi).toHaveBeenLastCalledWith({
        BASE: 'http://localhost:8080',
        HEADERS: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('token refresh scenarios', () => {
    it('should handle token refresh during active session', async () => {
      // Initial call with first token
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: 'old-token' } },
        error: null,
      } as any);

      const client1 = await getApiClient();

      // Simulate token refresh - getSession returns new token
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: 'refreshed-token' } },
        error: null,
      } as any);

      const client2 = await getApiClient();

      expect(client1).not.toBe(client2);
      expect((client2 as any)._token).toBe('refreshed-token');
    });

    it('should handle session expiry', async () => {
      // Initial authenticated session
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: 'valid-token' } },
        error: null,
      } as any);

      const client1 = await getApiClient();

      // Session expired - no token
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      } as any);

      const client2 = await getApiClient();

      expect(client1).not.toBe(client2);
      expect((client2 as any)._token).toBeUndefined();
    });
  });
});

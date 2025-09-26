import { ClimbCoachApi } from './generated/ClimbCoachApi';
import supabase from '../supabase';
import { API_CONFIG } from '@/app/config';

// Create a singleton instance of the API client
let apiClient: ClimbCoachApi | null = null;

export const getApiClient = async (): Promise<ClimbCoachApi> => {
  if (!apiClient) {
    // Get session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    apiClient = new ClimbCoachApi({
      BASE: API_CONFIG.BASE_URL,
      HEADERS: token 
        ? {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        : {
            'Content-Type': 'application/json',
          },
    });
  }
  
  return apiClient;
};

// Reset the API client (useful after logout)
export const resetApiClient = (): void => {
  apiClient = null;
};

export default getApiClient; 

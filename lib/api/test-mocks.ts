/* eslint-disable no-undef */
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Type definition for the mocked Supabase client used in tests.
 * This ensures TypeScript recognizes the Jest mock methods on nested properties.
 */
export type MockedSupabaseClient = {
  auth: {
    getSession: jest.MockedFunction<SupabaseClient['auth']['getSession']>;
    getUser: jest.MockedFunction<SupabaseClient['auth']['getUser']>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signIn: jest.MockedFunction<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signOut: jest.MockedFunction<any>;
  };
  storage: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: jest.MockedFunction<any>;
  };
};

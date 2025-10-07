// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  Link: jest.fn(({ children }) => children),
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn((path) => `exp://localhost/${path}`),
}));

// Mock expo-av
jest.mock('expo-av', () => ({
  Video: jest.fn(() => null),
  Audio: {
    setAudioModeAsync: jest.fn(),
  },
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn(),
  documentDirectory: 'file:///mock-document-directory/',
  cacheDirectory: 'file:///mock-cache-directory/',
}));

// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

// Mock expo-video-thumbnails
jest.mock('expo-video-thumbnails', () => ({
  getThumbnailAsync: jest.fn(),
}));

// Mock tus-js-client
jest.mock('tus-js-client', () => ({
  Upload: jest.fn(),
}));

// Mock Supabase client
jest.mock('./lib/supabase', () => ({
  __esModule: true,
  default: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  },
}));

// Mock axios instance
jest.mock('./lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    defaults: {
      baseURL: 'http://localhost:8080',
      timeout: 30000,
    },
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}));

// Mock React Native modules - not needed with jest-expo preset

// Mock File API for web tests
global.File = class File extends Blob {
  name: string;
  lastModified: number;

  constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
    super(bits, options);
    this.name = name;
    this.lastModified = options?.lastModified || Date.now();
  }
} as any;

export const Colors = {
  light: {
    text: '#333333',
    background: '#F5F7F5',
    tint: '#446A48',
    tabIconDefault: '#666666',
    tabIconSelected: '#446A48',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: '#5C8A61',
    tabIconDefault: '#999999',
    tabIconSelected: '#5C8A61',
  },
  primary: {
    main: '#446A48',
    light: '#5C8A61',
    dark: '#2C4530',
    contrast: '#FFFFFF',
  },
  secondary: {
    main: '#F5F7F5',
    dark: '#E0E5E0',
    text: '#666666',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#999999',
  },
  background: {
    default: '#F5F7F5',
    paper: '#FFFFFF',
  },
  success: '#4CAF50',
  error: '#ff4444',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
} as const;

export default Colors;

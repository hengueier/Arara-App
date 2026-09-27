/**
 * AraraTech-aligned palette for the POC presentation.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Brand = {
  navy: '#0c1524',
  navyDeep: '#0a111c',
  navyMid: '#0f1c2e',
  blue: '#1a6aad',
  blueMid: '#124a73',
  blueDeep: '#0d3555',
  accentSoft: 'rgba(37, 99, 168, 0.35)',
  white: '#ffffff',
  ink: '#1a2332',
  muted: '#5a6a7a',
  line: '#e2e8f0',
  surface: '#f5f8fb',
  danger: '#c62828',
  success: '#1b7f5a',
} as const;

export const Colors = {
  light: {
    text: Brand.ink,
    background: Brand.surface,
    backgroundElement: Brand.white,
    backgroundSelected: '#e8eef5',
    textSecondary: Brand.muted,
    primary: Brand.blue,
    primaryDeep: Brand.blueDeep,
    danger: Brand.danger,
    onPrimary: Brand.white,
  },
  dark: {
    // POC demo stays light-forward; dark kept coherent if system flips
    text: Brand.white,
    background: Brand.navy,
    backgroundElement: Brand.navyMid,
    backgroundSelected: Brand.blueDeep,
    textSecondary: '#9AAAB4',
    primary: Brand.blue,
    primaryDeep: Brand.blueMid,
    danger: '#ff8a80',
    onPrimary: Brand.white,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

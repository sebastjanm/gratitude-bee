/**
 * Design System based on Dieter Rams' 10 Principles of Good Design
 * 
 * 1. Good design is innovative
 * 2. Good design makes a product useful
 * 3. Good design is aesthetic
 * 4. Good design makes a product understandable
 * 5. Good design is unobtrusive
 * 6. Good design is honest
 * 7. Good design is long-lasting
 * 8. Good design is thorough down to the last detail
 * 9. Good design is environmentally friendly
 * 10. Good design is as little design as possible
 */

import { Platform } from 'react-native';

// Color System - Minimal, functional, high contrast
export const Colors = {
  // Primary Colors - Reduced saturation for sophistication
  primary: '#E85D3B',      // Refined orange (from #FF8C42)
  primaryLight: '#F5A894',  // Light tint
  primaryDark: '#C44328',   // Dark shade
  
  // Neutral Palette - True grays for clarity
  black: '#000000',
  gray900: '#1A1A1A',
  gray800: '#2D2D2D',
  gray700: '#404040',
  gray600: '#525252',
  gray500: '#737373',
  gray400: '#A3A3A3',
  gray300: '#D4D4D4',
  gray200: '#E5E5E5',
  gray100: '#F5F5F5',
  white: '#FFFFFF',
  
  // Functional Colors - Clear meaning
  success: '#059669',    // Green for positive actions
  warning: '#D97706',    // Amber for attention
  error: '#DC2626',      // Red for errors
  info: '#0284C7',       // Blue for information
  
  // Background Colors
  background: '#FFF8F0',          // Warm cream background
  backgroundSecondary: '#FAFAFA', // Subtle gray
  backgroundElevated: '#FFFFFF',  // Cards and modals (keep white for contrast)
  backgroundAlt: '#F5F5F5',       // Alternative background
  
  // Text Colors - High contrast for readability
  textPrimary: '#1A1A1A',    // Almost black
  textSecondary: '#525252',   // Medium gray
  textTertiary: '#737373',    // Light gray
  textInverse: '#FFFFFF',     // White on dark
  
  // Border Colors
  border: '#E5E5E5',          // Light border
  borderFocus: '#E85D3B',     // Primary on focus
  borderError: '#DC2626',     // Error state
} as const;

// Typography - Clear hierarchy, excellent readability
export const Typography = {
  // Font Families - Force consistent rendering across Android devices
  fontFamily: {
    regular: Platform.select({
      ios: 'Inter-Regular',
      android: 'Roboto',  // Force Roboto on all Android devices including EMUI
    }) as string,
    medium: Platform.select({
      ios: 'Inter-Medium',
      android: 'Roboto-Medium',
    }) as string,
    semiBold: Platform.select({
      ios: 'Inter-SemiBold',
      android: 'Roboto-Medium',  // Android doesn't have SemiBold, use Medium
    }) as string,
    bold: Platform.select({
      ios: 'Inter-Bold',
      android: 'Roboto-Bold',
    }) as string,
  },
  
  // Font Sizes - Clear scale
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Line Heights - Optimal readability (actual pixel values for React Native)
  lineHeight: {
    tight: 18,    // For xs/sm fonts (~1.25x)
    normal: 24,   // For base/lg fonts (~1.5x)
    relaxed: 28,  // For xl/2xl fonts (~1.75x)
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.025,
    normal: 0,
    wide: 0.025,
  },
} as const;

// Spacing - Consistent rhythm
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border Radius - Subtle, not distracting
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Shadows - Minimal, functional depth
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// Animation - Subtle, purposeful
export const Animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
} as const;

// Layout Constants
export const Layout = {
  screenPadding: Spacing.md,
  cardPadding: Spacing.md,
  headerHeight: 56,
  tabBarHeight: 56,
  buttonHeight: {
    sm: 40,
    md: 48,
    lg: 56,
  },
  iconSize: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  },
} as const;

// Component Styles - Reusable patterns
export const ComponentStyles = {
  // Cards
  card: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Layout.cardPadding,
    ...Shadows.sm,
  },
  
  // Buttons
  button: {
    primary: {
      backgroundColor: Colors.primary,
      borderRadius: BorderRadius.md,
      height: Layout.buttonHeight.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderRadius: BorderRadius.md,
      height: Layout.buttonHeight.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    text: {
      primary: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.medium,
        color: Colors.white,
        lineHeight: Typography.fontSize.base * 1.5,
      },
      secondary: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.medium,
        color: Colors.textPrimary,
        lineHeight: Typography.fontSize.base * 1.5,
      },
    },
  },
  
  // Text Styles
  text: {
    h1: {
      fontSize: Typography.fontSize['3xl'],
      fontFamily: Typography.fontFamily.bold,
      color: Colors.textPrimary,
      lineHeight: 38, // 30px * 1.25
    },
    h2: {
      fontSize: Typography.fontSize['2xl'],
      fontFamily: Typography.fontFamily.semiBold,
      color: Colors.textPrimary,
      lineHeight: 30, // 24px * 1.25
    },
    h3: {
      fontSize: Typography.fontSize.xl,
      fontFamily: Typography.fontFamily.semiBold,
      color: Colors.textPrimary,
      lineHeight: Typography.lineHeight.normal, // 24px
    },
    body: {
      fontSize: Typography.fontSize.base,
      fontFamily: Typography.fontFamily.regular,
      color: Colors.textPrimary,
      lineHeight: Typography.lineHeight.normal, // 24px
    },
    caption: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamily.regular,
      color: Colors.textSecondary,
      lineHeight: Typography.lineHeight.tight, // 18px
    },
  },
  
  // Input Fields
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    height: Layout.buttonHeight.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.base * 1.5,
  },
  
  // Modal Headers
  modal: {
    headerTitle: {
      fontSize: Typography.fontSize['2xl'],
      fontFamily: Typography.fontFamily.bold,
      color: Colors.textPrimary,
      marginBottom: Spacing.xs,
    },
    headerSubtitle: {
      fontSize: Typography.fontSize.base,
      fontFamily: Typography.fontFamily.regular,
      color: Colors.textSecondary,
      lineHeight: Typography.lineHeight.tight,
    },
  },
} as const;

// Accessibility
export const A11y = {
  minTouchTarget: 44, // iOS HIG minimum
  focusIndicator: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
} as const;
# Dark Theme Implementation

**Status:** Not Implemented  
**Priority:** Medium  
**Complexity:** High  
**Estimated Effort:** 2-3 days (full implementation) or 1 day (infrastructure + gradual migration)

## Overview

Implement a comprehensive dark theme for the GratitudeBee app to improve user experience in low-light conditions, reduce eye strain, and provide modern UI options. The app currently uses a static color system with 518+ color references across 43 files.

## Current State Analysis

### Statistics
- **518 color references** using `Colors.*` across the codebase
- **43 files** requiring updates
- **263 background color usages**
- **No existing theme infrastructure**
- Design system is well-organized in `/utils/design-system.ts`

### Challenges
- All colors are hardcoded with static imports
- No theme context or provider exists
- StatusBar colors are static
- Lottie animations may need dark variants
- Shadow styles optimized for light backgrounds

## Implementation Requirements

### Phase 1: Infrastructure Setup (4-6 hours)

#### 1.1 Theme Context & Provider
```typescript
// Create /providers/ThemeProvider.tsx
- Theme context with light/dark modes
- useTheme() hook for components
- Automatic system theme detection
- Manual theme override option
```

#### 1.2 Color System Refactor
```typescript
// Update /utils/design-system.ts
- Create theme-aware color system
- Light theme colors (existing)
- Dark theme colors (new)
- Dynamic color getter functions
```

#### 1.3 Theme Persistence
- Store user preference in AsyncStorage
- Load preference on app start
- Sync with system preference option

#### 1.4 Dependencies
```bash
# No additional packages needed
- React Native's useColorScheme (built-in)
- AsyncStorage (already installed)
```

### Phase 2: Dark Color Palette Design (2-3 hours)

#### 2.1 Core Colors
```typescript
const DarkColors = {
  // Backgrounds
  background: '#0A0A0B',           // Near black
  backgroundSecondary: '#141416',  // Slightly lighter
  backgroundElevated: '#1C1C1F',   // Cards and modals
  backgroundAlt: '#242428',        // Alternative
  
  // Text (Inverted hierarchy)
  textPrimary: '#FFFFFF',          // White
  textSecondary: '#A8A8A8',        // Light gray
  textTertiary: '#6C6C70',         // Medium gray
  textInverse: '#0A0A0B',          // Near black
  
  // Borders
  border: '#2C2C30',                // Dark border
  borderFocus: '#E85D3B',           // Keep primary
  borderError: '#DC2626',           // Keep error
  
  // Primary colors (slightly adjusted for dark)
  primary: '#FF6B4A',               // Brighter orange
  primaryLight: '#FF8866',          
  primaryDark: '#CC4433',
  
  // Functional colors (adjusted for dark backgrounds)
  success: '#10B981',               // Brighter green
  warning: '#F59E0B',               // Brighter amber
  error: '#EF4444',                 // Brighter red
  info: '#3B82F6',                  // Brighter blue
}
```

#### 2.2 Special Considerations
- Shadows need to be lighter or use glow effects
- Reduce shadow opacity in dark mode
- Consider elevation through lighter backgrounds
- Maintain AA/AAA contrast ratios

### Phase 3: Component Migration Strategy

#### 3.1 Priority Order (High-Impact First)

**Wave 1: Core Navigation & Layout** (3-4 hours)
1. `/app/_layout.tsx` - Root layout and StatusBar
2. `/app/(tabs)/_layout.tsx` - Tab bar theme
3. `/providers/ThemeProvider.tsx` - Wrap app
4. `/components/QuickSendActions.tsx` - Home screen actions

**Wave 2: Main Screens** (4-5 hours)
5. `/app/(tabs)/index.tsx` - Home screen
6. `/app/(tabs)/activity.tsx` - Activity feed
7. `/app/(tabs)/chat.tsx` - Chat interface
8. `/app/(tabs)/rewards.tsx` - Rewards screen
9. `/app/(tabs)/more.tsx` - Settings/More screen

**Wave 3: Modals & Cards** (4-5 hours)
10. `/components/AppreciationModal.tsx`
11. `/components/FavorsModal.tsx`
12. `/components/DontPanicModal.tsx`
13. `/components/NegativeBadgeModal.tsx`
14. `/components/ActiveFavorsBanner.tsx`
15. `/components/EngagementCard.tsx`

**Wave 4: Authentication & Settings** (2-3 hours)
16. `/app/(auth)/auth.tsx` - Login screen
17. `/app/(auth)/forgot-password.tsx`
18. All `/app/(more)/*.tsx` screens

**Wave 5: Remaining Components** (2-3 hours)
19. All other components and screens

#### 3.2 Migration Pattern

For each component:
```typescript
// Before
import { Colors } from '@/utils/design-system';
backgroundColor: Colors.background

// After
import { useTheme } from '@/providers/ThemeProvider';
const { colors } = useTheme();
backgroundColor: colors.background
```

### Phase 4: Implementation Steps

#### Step 1: Create Theme Infrastructure
1. Create `ThemeProvider.tsx`
2. Update `design-system.ts` with theme functions
3. Wrap app in ThemeProvider
4. Add theme toggle to settings

#### Step 2: Create useTheme Hook
```typescript
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

#### Step 3: Gradual Component Migration
1. Start with one screen as proof of concept
2. Update components in priority order
3. Test each component in both themes
4. Handle edge cases and special styles

#### Step 4: StatusBar Management
```typescript
<StatusBar 
  style={theme === 'dark' ? 'light' : 'dark'}
  backgroundColor={colors.background}
/>
```

#### Step 5: Asset Handling
- Review images that may not work on dark backgrounds
- Add white/dark variants for logos if needed
- Adjust Lottie animation colors or provide variants

### Phase 5: Testing Requirements

#### 5.1 Functional Testing
- [ ] Theme toggles correctly
- [ ] Theme persists after app restart
- [ ] System theme detection works
- [ ] All screens render correctly in both themes
- [ ] No color contrast issues

#### 5.2 Visual Testing
- [ ] Text remains readable (WCAG AA compliance)
- [ ] Interactive elements are clearly visible
- [ ] Shadows and elevations work in dark mode
- [ ] Images and icons are visible
- [ ] No pure black on pure white (avoid harsh contrast)

#### 5.3 Performance Testing
- [ ] No performance degradation
- [ ] Smooth theme switching
- [ ] No flash of wrong theme on startup

### Phase 6: User Settings UI

#### 6.1 Theme Settings Screen
Add to `/app/(more)/appearance.tsx`:
- System (Auto) - Default
- Light
- Dark
- Preview area showing theme

#### 6.2 Quick Toggle
- Add moon/sun icon to header or settings
- Animated transition between themes

## Alternative Approaches

### Option A: System-Only (Simplest - 1 day)
- Use device dark mode setting only
- No in-app toggle
- Reduces complexity significantly

### Option B: Gradual Migration (Recommended - Start with 1 day)
- Implement infrastructure first
- Migrate screens gradually over time
- Ship dark mode for some screens early

### Option C: Full Implementation (Most Complete - 3 days)
- Complete all phases before shipping
- Full testing across all components
- Most polished result

## Technical Decisions

### Use React Native's Built-in useColorScheme
- No extra dependencies
- Native performance
- Automatic system detection

### Dynamic Color System
```typescript
export const getColors = (theme: 'light' | 'dark') => {
  return theme === 'dark' ? DarkColors : LightColors;
};
```

### Context-Based Distribution
- Single source of truth
- Easy to test
- Performant with React.memo

## Migration Checklist

### Pre-Implementation
- [ ] Backup current design system
- [ ] Create dark color palette
- [ ] Design review of dark colors
- [ ] Set up test devices for both themes

### Infrastructure
- [ ] Create ThemeProvider
- [ ] Update design-system.ts
- [ ] Add theme persistence
- [ ] Create useTheme hook

### Component Migration
- [ ] Update root layout
- [ ] Migrate navigation
- [ ] Update main screens
- [ ] Update modals
- [ ] Update all components

### Testing & Polish
- [ ] Test all screens in both themes
- [ ] Fix contrast issues
- [ ] Adjust shadows and elevations
- [ ] Performance optimization
- [ ] User acceptance testing

### Documentation
- [ ] Update component documentation
- [ ] Add theme guidelines
- [ ] Document color decisions
- [ ] Create migration guide for future components

## Success Metrics

- All screens support dark theme
- No accessibility issues (WCAG AA)
- User preference is persisted
- Smooth transitions between themes
- No performance impact
- Positive user feedback

## Future Enhancements

1. **Custom Themes**: Allow users to customize colors
2. **Scheduled Themes**: Auto-switch based on time
3. **OLED Mode**: Pure black option for OLED screens
4. **Theme Animations**: Smooth color transitions
5. **Per-Screen Overrides**: Some screens always light/dark

## Risks & Mitigations

### Risk 1: Scope Creep
**Mitigation**: Use phased approach, ship incrementally

### Risk 2: Design Inconsistencies
**Mitigation**: Create comprehensive color palette upfront

### Risk 3: Performance Issues
**Mitigation**: Use React.memo and optimize re-renders

### Risk 4: Testing Overhead
**Mitigation**: Automated visual regression tests

## References

- [React Native useColorScheme](https://reactnative.dev/docs/usecolorscheme)
- [Material Design Dark Theme](https://material.io/design/color/dark-theme.html)
- [Apple Human Interface Guidelines - Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)
- [WCAG Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
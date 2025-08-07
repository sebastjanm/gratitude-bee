# Analytics Integration into Profile

**Status:** Not Implemented  
**Priority:** Low  
**Complexity:** Low

## Overview

Currently, Analytics is a separate screen under the "More" tab. This feature would integrate analytics directly into the Profile screen for easier access.

## Current State
- Analytics is at `/more/analytics`
- Requires navigation through More tab
- Separate full-screen view

## Proposed Implementation

### 1. Profile Screen Integration

Add expandable analytics section:

```typescript
interface ProfileSection {
  personalInfo: { ... };
  analyticsPreview: {
    quickStats: {
      totalSent: number;
      totalReceived: number;
      currentStreak: number;
    };
    expandable: boolean;
    fullAnalyticsLink: string;
  };
  settings: { ... };
}
```

### 2. UI Design

#### Collapsed State
- Show 3 key metrics
- "View Full Analytics" button
- Subtle expand indicator

#### Expanded State  
- Show weekly chart
- Category breakdown
- Time period selector
- "View Details" link

### 3. Deep Linking

Update routes:
- Current: `/analytics`
- New: `/profile?section=analytics`
- Maintain backwards compatibility

### 4. Navigation Flow

```
Profile Tab
  ├── Personal Info
  ├── Analytics Preview (collapsible)
  │   ├── Quick Stats
  │   └── Expand for more
  └── Settings Links
```

## Implementation Steps

1. **Update Profile Screen**
   - Add analytics section
   - Implement expand/collapse
   - Add loading states

2. **Create Preview Components**
   - QuickStatsCard
   - MiniChart
   - ExpandButton

3. **Update Navigation**
   - Add deep link support
   - Update existing analytics links
   - Add route aliases

4. **Optimize Performance**
   - Lazy load analytics data
   - Cache preview data
   - Minimize re-renders

## Benefits

- Faster access to analytics
- Better feature discovery
- Reduced navigation depth
- Consistent with modern app patterns

## Considerations

- Don't clutter profile screen
- Maintain performance
- Preserve full analytics option
- Handle loading states gracefully
# GratitudeBee - Code Quality Guidelines

**Version**: 1.0  
**Last Updated**: August 2025  
**Approach**: Practical guidelines for maintaining high-quality React Native code with Expo

## 🚨 CRITICAL: Pre-Push Requirements

**ALWAYS run these commands before pushing:**

```bash
npm run lint          # Zero warnings, zero errors
npm run typecheck     # Full TypeScript compliance
npx expo doctor       # Check project health
npm test              # When tests are implemented
```

**Or use the automated pre-push script:**

```bash
./scripts/pre-push.sh  # Runs all checks automatically
```

## Code Quality Standards

### 1. ESLint Compliance
- **STRICT ESLint enforcement is MANDATORY**
- Zero warnings, zero errors policy
- Run `npm run lint` before any commit
- ESLint configuration includes:
  - React Native rules
  - TypeScript strict rules
  - React Hooks rules
  - Import order enforcement

### 2. TypeScript Type Safety
- **No `any` types allowed** (enforced by ESLint)
- All functions must have proper return types
- All props must be properly typed
- Run `npm run typecheck` to verify
- Strict mode enabled in tsconfig.json
- Use proper Supabase types from database

### 3. Code Principles
- **Clean and readable code** - self-documenting, minimal comments
- **Follow official documentation** - React Native, Expo, Supabase patterns
- Use functional components with hooks exclusively
- Prefer composition over inheritance
- Keep components focused and single-purpose

### 4. Component Guidelines
- Keep components modular and reusable
- Use custom hooks for shared logic
- Proper error boundaries and loading states
- Follow React Native best practices
- Organize components by feature/domain

### 5. Design System Compliance
- Primary color: `#FF8C42` (orange)
- Background color: `#FFF8F0` (warm off-white)
- Border radius: `16px` for cards and buttons
- Use consistent spacing from theme values
- Follow Material Design principles

### 6. Styling Guidelines
- Use StyleSheet.create for performance
- Never use inline styles in production code
- Platform-specific styles when needed
- Responsive design considerations
- Consistent shadow/elevation patterns

### 7. State Management
- React Query for server state (Supabase queries)
- React Context for auth/session state
- Local component state for UI state
- Zustand for complex client state (if needed)
- Avoid prop drilling

### 8. Performance Standards
- App launch time < 2 seconds
- Screen transitions < 500ms
- Lazy load heavy components
- Optimize images before upload
- Monitor memory usage
- Use React.memo wisely

#### FlatList Optimization (Critical)
```typescript
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={10}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })} // Only if items have fixed height
/>
```

### 9. File Organization
```
gratitude-bee/
├── app/            # Expo Router screens
├── components/     # Reusable components
├── providers/      # Context providers
├── utils/          # Utilities and helpers
├── types/          # TypeScript definitions
├── assets/         # Images and fonts
├── hooks/          # Custom React hooks
└── services/       # API services
```

### 10. Supabase Integration Patterns
- Always handle loading and error states
- Use proper TypeScript types from database
- Implement optimistic updates for better UX
- Handle real-time subscriptions cleanup
- Use RLS policies for security

```typescript
// Example pattern
const { data, error, isLoading } = useQuery({
  queryKey: ['badges', userId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },
});
```

### 11. Navigation Patterns
- Use Expo Router v5 conventions
- Typed routes for type safety
- Handle deep linking properly
- Test navigation flows thoroughly
- Use modals for temporary flows

### 12. Git Workflow & Commit Messages
- Run `npm run lint` before every commit
- Run `npm run typecheck` before pushing
- Clear, descriptive commit messages
- **NEVER include AI references in commits**
- Follow conventional commits format:
  ```
  feat: Add partner connection flow
  fix: Resolve navigation issue in messages
  refactor: Simplify messages structure
  chore: Update dependencies
  ```

## Available Scripts

```bash
npm start              # Start Expo development
npm run ios           # Run on iOS simulator  
npm run android       # Run on Android emulator
npm run lint          # Run ESLint
npm run typecheck     # TypeScript type checking
npm test              # Run tests (when implemented)
```

## Testing Standards
- Write tests for critical business logic
- Test authentication flows
- Test partner connection flows
- Test badge sending/receiving
- Ensure proper error handling
- Run tests before pushing

## Pre-commit Checklist

- [ ] All ESLint errors resolved
- [ ] TypeScript compilation passes
- [ ] Build completes successfully
- [ ] No console.logs in production code (use __DEV__)
- [ ] Memory leaks checked (cleanup in useEffect)
- [ ] Performance impact considered
- [ ] Images optimized (compressed, proper format)
- [ ] No hardcoded values (use constants/config)
- [ ] Error handling added for async operations
- [ ] Sensitive data handled securely

## Best Practices

### 1. Memory Management
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('messages')
    .on('postgres_changes', { /* ... */ }, handler)
    .subscribe();
  
  return () => {
    supabase.removeChannel(subscription);
  };
}, []);
```

### 2. Error Boundaries
```typescript
// Wrap screens to prevent crashes
<ErrorBoundary fallback={<ErrorScreen />}>
  <YourScreen />
</ErrorBoundary>
```

### 3. Avoid Inline Functions & Styles
```typescript
// ❌ BAD - Creates new function/object every render
<TouchableOpacity onPress={() => sendBadge(id)} style={{padding: 10}}>

// ✅ GOOD - Use callbacks and StyleSheet
const handlePress = useCallback(() => sendBadge(id), [id]);
<TouchableOpacity onPress={handlePress} style={styles.button}>
```

### 4. Secure Storage
```typescript
// Use expo-secure-store for sensitive data
import * as SecureStore from 'expo-secure-store';

// Store auth tokens securely
await SecureStore.setItemAsync('supabase.auth.token', value);
```

### 5. Platform-Specific Code
```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

### 6. Optimistic Updates
```typescript
// Update UI immediately for better UX
const mutation = useMutation({
  mutationFn: sendAppreciation,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['appreciations'] });
    
    // Snapshot previous value
    const previousData = queryClient.getQueryData(['appreciations']);
    
    // Optimistically update
    queryClient.setQueryData(['appreciations'], old => [...old, newData]);
    
    return { previousData };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['appreciations'], context.previousData);
  },
});
```

## Performance Quick Wins

1. **Enable Hermes** (Already enabled in Expo SDK 52)

2. **Remove console.log in production**
```javascript
if (__DEV__) {
  console.log('Debug info');
}
```

3. **Optimize imports**
```javascript
// ❌ Imports entire library
import _ from 'lodash';

// ✅ Imports only what you need
import debounce from 'lodash/debounce';
```

4. **Use InteractionManager for heavy operations**
```javascript
InteractionManager.runAfterInteractions(() => {
  // Heavy computation here
});
```

## Common Pitfalls to Avoid
- Don't use index as key in FlatList (use unique IDs)
- Don't nest FlatLists or ScrollViews
- Don't skip iOS/Android testing
- Don't use heavy operations in render
- Don't ignore memory leaks
- Don't hardcode dimensions
- Don't skip error handling
- Don't store sensitive data in AsyncStorage

## Build & Release Checklist

- [ ] Test on real devices (iOS and Android)
- [ ] Verify all environment variables
- [ ] Test offline functionality
- [ ] Check deep links work (invite codes)
- [ ] Test push notifications
- [ ] Verify app permissions
- [ ] Test on oldest supported OS version
- [ ] Run EAS build for both platforms
- [ ] Test in-app purchases (if applicable)
- [ ] Verify analytics tracking

## Important Notes

1. **Production Deployment**: The build MUST pass all checks or deployment will fail
2. **No shortcuts**: Always fix errors properly, never disable ESLint rules
3. **Push Notifications**: Always handle notification permissions gracefully
4. **Deep Linking**: Test invite code handling thoroughly
5. **Real-time Features**: Ensure proper subscription cleanup
6. **Partner Features**: Test all partner connection scenarios
7. **Offline Support**: Handle network errors gracefully
8. **Security**: Never expose Supabase keys or sensitive data
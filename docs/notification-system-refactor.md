# Notification System Refactor Plan

This document outlines the plan to refactor the push notification handling system to be more generic and extensible, ensuring a consistent pattern for future additions. [[memory:3055555]]

## 1. Goal

The current notification system is tightly coupled to handling "appreciation" notifications. The goal is to create a centralized routing system within `NotificationProvider.tsx` that can handle any type of notification and direct the user to the appropriate screen based on a `categoryIdentifier`.

This refactor will follow the DRY principle and aim for a simple, scalable solution. [[memory:3051320]]

## 2. Core Changes

### 2.1. Refactor `NotificationProvider.tsx`

The `handleNotificationResponse` function will be converted into a central router for all incoming notifications.

*   **Generic Payload:** It will no longer extract appreciation-specific fields directly. Instead, it will treat the notification's data object as a generic payload.
*   **Standardized Payload Passing:** The entire notification data payload will be passed as a single, stringified JSON object in a `payload` route parameter. This simplifies the logic and makes it easier to add new notification types without changing the provider.
*   **Category-to-Route Mapping:** A new mapping object will be introduced to link notification `categoryIdentifier` strings to their corresponding application routes. This makes the system easily extensible.

```typescript
// Example mapping in NotificationProvider.tsx
const categoryRouteMapping: Record<string, string> = {
  'appreciation': '/(modals)/appreciation',
  'favor': '/(modals)/favor',
  'ping': '/(modals)/ping',
  'hornet': '/(modals)/hornet-strike',
  'wisdom': '/(modals)/relationship-wisdom',
  'panic': '/(modals)/dont-panic',
  // Future categories can be added here
};
```

*   **Routing Logic:** The function will use the `categoryIdentifier` to look up the route from the mapping and navigate using `expo-router`, passing the standardized payload.

```typescript
// Example routing logic in handleNotificationResponse
const category = notification.request.content.categoryIdentifier?.split('.')[0]; // Handle sub-categories like 'appreciation.thank-you'
const route = category ? categoryRouteMapping[category] : undefined;
const payload = notification.request.content.data;

if (route && payload) {
  router.push({
    pathname: route,
    params: {
      payload: JSON.stringify(payload),
    },
  });
}
```

### 2.2. Update Modal Screens

All modal screens that can be opened from a notification must be updated to handle the new standardized `payload` parameter.

*   **Example: `app/(modals)/appreciation.tsx`**
    *   It will use the `useLocalSearchParams` hook from `expo-router` to get the `payload`.
    *   It will parse the `payload` string back into a JSON object.
    *   It will then use the data from the parsed object to render its content.

```typescript
// Example in a modal screen that can be opened via notification
import { useLocalSearchParams } from 'expo-router';

export default function AppreciationModalScreen() { // Or any other modal screen
  const { payload } = useLocalSearchParams<{ payload: string }>();

  const notificationData = payload ? JSON.parse(payload) : null;

  // Use notificationData.title, notificationData.points, etc.
  // to render the component's state.

  // ... rest of the component
}
```

### 2.3. Update Notification Sending Logic

We must ensure that any part of the application that sends a notification includes the correct `categoryIdentifier`. This is likely handled in the Supabase Edge Functions.

*   **Example: `send-notification` Supabase Function**
    *   This function must be reviewed to ensure it correctly assigns a `categoryIdentifier` to the push notification payload it sends via Expo's push service. This identifier is what our client-side router will use.

## 3. Implementation Steps

1.  **Refactor `NotificationProvider.tsx`**: Implement the generic routing logic, the category-to-route mapping, and standardized payload passing.
2.  **Update `app/(modals)/appreciation.tsx`**: Modify the screen to parse and use the new `payload` route parameter.
3.  **Verify Server-Side Logic**: Inspect the `send-notification` Supabase function to confirm it sets the `categoryIdentifier` correctly.
4.  **Test**: Perform an end-to-end test by sending an appreciation notification and verifying that it correctly opens the appreciation modal with the right data.
5.  **Extend**: Apply the same pattern to other notification types (`favor`, `ping`, etc.) as needed in the future.

---

## Phase 2: Extending for Favors (Implementation)

This section documents the successful extension of the notification system to handle "Favor Requests".

1.  **Create Favor Modal Screen**:
    *   A new file was created at `app/(modals)/favor.tsx`.
    *   This screen is responsible for displaying the details of a favor request notification.
    *   It uses `useLocalSearchParams` to parse the standardized `payload` object.
    *   It includes "Accept" and "Decline" buttons for future implementation.

2.  **Update Notification Provider**:
    *   The `categoryRouteMapping` in `providers/NotificationProvider.tsx` was updated to correctly route favor notifications.
    *   The key was changed from `favor` to `favor_request` to match the `event_type` sent from the server.

3.  **Verify and Fix Client Sending Logic**:
    *   The `handleSendFavor` function in `app/(tabs)/index.tsx` was inspected.
    *   It was discovered that, unlike appreciations, it was not manually invoking the `send-notification` function after creating the event.
    *   This was corrected by adding the `supabase.functions.invoke('send-notification', ...)` call to ensure a push notification is sent when a favor is requested.

---

## Phase 3: Extending for Wisdom (Implementation)

This section documents the extension of the notification system to handle "Wisdom" messages.

1.  **Create Wisdom Modal Screen**:
    *   A new file was created at `app/(modals)/wisdom.tsx`.
    *   This screen is responsible for displaying the details of a wisdom notification.
    *   It uses `useLocalSearchParams` to parse the standardized `payload` object.
    *   It includes a "Thanks for the Wisdom" button which reuses the generic `send-thank-you` Supabase function.

2.  **Update Notification Provider**:
    *   The `categoryRouteMapping` in `providers/NotificationProvider.tsx` was updated to correctly route `wisdom` notifications to `/(modals)/wisdom`.

3.  **Client Sending Logic Verification**:
    *   The `handleSendWisdom` function in the `QuickSendActions.tsx` component was already correctly creating a `WISDOM` event, which triggers the `send-notification` function via a database trigger. No changes were needed on the client-side sending logic. 
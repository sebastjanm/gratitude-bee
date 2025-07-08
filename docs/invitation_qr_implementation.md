# QR Code Invitation - Implementation Plan

This document outlines the plan to implement a QR code-based partner connection feature in the Gratitude Bee application. This feature will provide a faster and more intuitive alternative to manual code entry.

---

## 1. Project Goals

-   **Enhance User Experience:** Simplify the partner connection process by replacing manual code entry and link sharing with a scannable QR code.
-   **Modernize the UI:** Streamline the `partner-link.tsx` screen to focus on the two primary connection methods: QR code scanning and manual code entry.
-   **Fix Existing Bugs:** Correct data-fetching logic in `partner-link.tsx` and `profile.tsx` that incorrectly references a deprecated `profiles` table instead of the `users` table.

---

## 2. Implementation Phases

The project will be executed in three distinct phases:

### **Phase 1: Dependencies & Configuration**

1.  **Install Libraries:**
    -   Native camera app: Users will use their device's built-in camera to scan QR codes.
    -   `react-native-qrcode-svg`: To generate a vector-based QR code image for the user to share.
2.  **Configure Permissions:**
    -   Users will be guided to use their native camera app, eliminating the need for special permissions or camera plugins.

### **Phase 2: Create QR Code Components**

1.  **Build `QRCodeModal.tsx`:**
    -   This new component will be a modal that displays the current user's unique QR code.
    -   The QR code will embed the full invitation link (e.g., `https://gratitudebee.app/invite/{inviteCode}`) to ensure it is functional both for in-app scanning and for external camera apps (which will trigger the existing deep link flow).
2.  **Build `QRScannerModal.tsx`:**
    -   This modal will guide users to use their native camera app for scanning.
    -   It will manage the camera permission flow, prompting the user if access has not been granted.
    -   It will process scanned data, gracefully handling both full URLs and raw invite codes.
    -   Upon a successful scan and connection via the `connect-partner` Supabase function, it will automatically navigate the user to the "Connected!" success view.
    -   If an invalid QR code is scanned, it will display a non-intrusive error message overlay on the scanner view, allowing the user to try again without closing the modal.

### **Phase 3: Integration and Refactoring**

1.  **Refactor `partner-link.tsx`:**
    -   **Bug Fix:** All Supabase queries will be updated to fetch data from the `users` table instead of the non-existent `profiles` table.
    -   **UI Simplification:** The UI will be refactored to remove the "Share Link" and "Copy Link" buttons, simplifying the screen to focus on the two core methods: manual entry and QR codes.
    -   **Integrate Modals:** Two new buttons will be added:
        -   "Show My QR Code": Opens the `QRCodeModal`.
        -   "Scan Partner's Code": Opens the `QRScannerModal`.
2.  **Update `profile.tsx`:**
    -   **Bug Fix:** The query that fetches the connected partner's name will be updated to reference the `users` table.

---

This plan ensures a seamless user experience, a clean and modern UI, and a more robust and bug-free implementation. 
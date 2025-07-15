# Chat Images & GIFs: Implementation Plan

This document outlines the phased implementation for adding image and GIF messaging to the Gratitude Bee chat module. The plan is designed to be incremental, robust, and maintainable for a solo developer.

---

### **Phase 1: Foundational Image Messaging (Single Image)**

**Goal:** Implement the complete, end-to-end flow for sending and viewing a single compressed image. This is the MVP.

*   **Step 1: Database Schema Update**
    *   Create a new migration to modify the `messages` table.
    *   Add a `content_type` column (enum: `text`, `image`, `gif`).
    *   Add a `media_url` column to store the URL of the uploaded media.

*   **Step 2: Configure Supabase Storage**
    *   Create a new, dedicated storage bucket named `chat_media`.
    *   Implement Row Level Security (RLS) policies for this bucket to ensure users can only upload files into conversations they are a part of.

*   **Step 3: Implement the Sending UI**
    *   Add a `+` icon to the chat input toolbar.
    *   Tapping this icon will open a native action sheet with the option "Choose from Library".
    *   Utilize `expo-image-picker` to open the user's photo gallery for single image selection.

*   **Step 4: Image Compression**
    *   Install and use `expo-image-manipulator`.
    *   After an image is selected, resize it to cap the longest side at 1280px and compress it into a high-quality JPEG to optimize performance and reduce storage costs.

*   **Step 5: Upload and Message Creation**
    *   Upload the compressed image to the `chat_media` bucket in Supabase Storage.
    *   Upon successful upload, create a new record in the `messages` table with `content_type` set to `image` and `media_url` pointing to the new file.

*   **Step 6: Render and View Images**
    *   Update the chat screen UI to conditionally render a clickable image thumbnail if `content_type` is `image`.
    *   Install and use `react-native-image-viewing` to open the image in a full-screen modal with zoom and pan support when the thumbnail is tapped.

---

### **Phase 2: Multi-Image Support**

**Goal:** Allow users to select and send multiple images at once, building on the foundation from Phase 1.

*   **Step 1: Enable Multiple Selections**
    *   Update the `expo-image-picker` configuration to allow for multiple image selections.

*   **Step 2: Sequential Upload and Sending**
    *   To maintain simplicity, loop through the selected images one by one.
    *   For each image, execute the full compression and upload process from Phase 1, creating a separate message for each. This avoids complex UI for grouped images and provides a clear, standard chat experience.

---

### **Phase 3: GIF & Sticker Integration**

**Goal:** Integrate a third-party GIF provider to allow users to send animated stickers and GIFs.

*   **Step 1: Integrate GIPHY SDK**
    *   Obtain a free GIPHY developer API key.
    *   Install and configure the official GIPHY React Native SDK, which provides pre-built UI components for searching and selecting GIFs.

*   **Step 2: Update the UI**
    *   Add a "Send GIF" option to the action sheet created in Phase 1.
    *   Tapping this option will launch the GIPHY SDK's user interface in a modal.

*   **Step 3: Sending & Rendering GIFs**
    *   When a user selects a GIF, use the URL provided by the SDK.
    *   Create a new message with `content_type` set to `gif` and `media_url` set to the GIPHY URL.
    *   Update the chat UI to render these GIFs as animated images directly in the chat flow. 
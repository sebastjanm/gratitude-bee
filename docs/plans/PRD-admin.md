<!--
File: docs/PRD-admin.md
Author: AI Assistant
Date: 2024-07-27
Description: This document outlines the requirements and technical specifications for the Gratitude Bee Admin Portal. It serves as a comprehensive guide for developers to ensure a secure, scalable, and maintainable implementation.
-->

# PRD: Gratitude Bee Admin Portal

## 1. Overview

### 1.1. Purpose

The Gratitude Bee Admin Portal is a secure, standalone web application designed for non-technical administrators (e.g., content managers) to manage the dynamic template content used within the main Gratitude Bee mobile application. This portal will provide a simple, intuitive interface for CRUD (Create, Read,Update, Delete) operations on all template tables.

### 1.2. Guiding Principles

- **Security First:** The portal's architecture must prioritize the security and integrity of the main application's database. Administrative functions must be completely isolated from regular user functions.
- **Simplicity & Usability:** The user interface (UI) must be intuitive and easy to use for non-technical staff. Complexity should be hidden.
- **Decoupling:** The admin portal must be a completely separate application from the mobile app, with its own codebase, repository, and deployment pipeline to prevent any interference.
- **Maintainability:** The codebase should be clean, well-documented, and follow industry best practices to ensure long-term scalability and ease of maintenance.

### 1.3. Target URL

The final application will be accessible at: `https://www.gratitudebee.com/admin`

---

## 2. Technical Architecture & Stack

### 2.0. Developer Mandates: Rules of Engagement

**WARNING: This is the most important section of this document. Violation of these rules could be devastating to the live mobile application and its users. There are no exceptions.**

The developer assigned to this project is acting as a builder for a specific, isolated component (the Admin Portal). You are **NOT** an architect for the overall system. Your scope of work is strictly limited to the tasks defined in this document for the `gratitude-bee-admin` repository.

**You are strictly forbidden from performing any of the following actions:**

1.  **DO NOT CHANGE THE DATABASE SCHEMA:**
    *   You are **NOT ALLOWED** to `ALTER`, `DROP`, or modify any existing tables in any way.
    *   You are **NOT ALLOWED** to add, remove, or rename columns on any existing table.
    *   The *only* permitted database changes are the creation of the single `public.admins` table and the specific RLS policy updates explicitly provided in this PRD. Any other change will break the mobile application.

2.  **DO NOT CHANGE USER POLICIES OR AUTHENTICATION:**
    *   You are **NOT ALLOWED** to modify any Row Level Security (RLS) policies related to `public.users` or the `auth.users` table.
    *   Your work must not interfere with the mobile app's existing authentication flow in any way.

3.  **DO NOT MODIFY EXISTING EDGE FUNCTIONS:**
    *   The mobile application relies on a suite of existing Edge Functions. You are **NOT ALLOWED** to modify, rename, or delete any of them.
    *   The *only* permitted action is the creation of a new, single Edge Function for the admin login (`admin-login`), as specified in this PRD.

**Your role is to build a new admin panel that *reads from and writes to* a pre-defined and locked-down database structure. Think of the database schema as a read-only contract. Adherence to these rules is essential for the stability and security of the entire Gratitude Bee platform.**

### 2.1. Core Technology

- **Framework:** Next.js (using App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Postgres Database, Edge Functions)
- **Deployment:** Vercel 

### 2.2. Project Structure (Crucial Rule)

**WHAT IS ALLOWED:**
- The entire codebase for this admin portal **MUST** reside in a new, separate Git repository named `gratitude-bee-admin`.

**WHAT IS NOT ALLOWED:**
- **DO NOT** create this project inside the existing `gratitude-bee` mobile app repository.
- **DO NOT** share `node_modules`, `package.json`, or any build configurations with the mobile app. This separation is non-negotiable to ensure the safety of the mobile app's EAS builds and dependencies.

### 2.3. Data & Security Model

This is the most critical part of the architecture. It is designed to be safe and to not interfere with the existing mobile app's database schema or authentication.

#### 2.3.1. Database Interaction

**WHAT IS ALLOWED:**
1.  **Add a new `public.admins` table:** We will create one new table to store credentials for admin users. This is the **only** new table to be added.
2.  **Perform CRUD on template tables ONLY:** The admin portal will only interact with the following tables:
    - `public.appreciation_templates`
    - `public.favor_templates`
    - `public.hornet_templates`
    - `public.wisdom_templates`
    - `public.dont_panic_templates`
    - `public.ping_templates`
3.  **Update Row Level Security (RLS) policies:** We will replace the existing admin policies on the template tables with more secure, specific ones.

**WHAT IS NOT ALLOWED:**
- **DO NOT** alter, delete, or read from any other tables, especially `public.users`, `public.wallets`, `public.events`, `public.conversations`, or `auth.users`.
- **DO NOT** modify the schema (e.g., add/remove columns) of the existing template tables. The portal must conform to the existing schema.

#### 2.3.2. Authentication Model

We will implement a completely separate authentication system for admins.

1.  **Admin Credentials:** Admin users will have an email and password stored in the `public.admins` table. The password **MUST** be securely hashed using `argon2id` before being stored.
2.  **No Supabase Auth:** The admin portal **WILL NOT** use the standard Supabase Auth client (`@supabase/auth-js`). The `auth.users` table will not be used for admin login.
3.  **Secure Edge Function for Login:**
    - A new Supabase Edge Function will be created to handle admin logins.
    - This function will be the **only** part of the system with `SERVICE_ROLE_KEY` access to the `public.admins` table.
    - **Login Flow:**
        1.  Admin enters email/password in the Next.js app.
        2.  The app sends credentials to the Edge Function.
        3.  The function reads the `password_hash` from the `public.admins` table for the given email.
        4.  It securely verifies the password.
        5.  On success, it mints a new, custom JWT (JSON Web Token) containing a specific claim: `{"is_gratitude_admin": true}`.
        6.  This JWT is returned to the Next.js app and stored securely in a cookie.
4.  **Authenticated Requests:**
    - The Next.js app will use a Supabase client initialized with the public `anon key`.
    - It will attach the custom admin JWT to every request to the database.
    - The RLS policies on the template tables will verify the `is_gratitude_admin` claim in the JWT to grant access.

### 2.4. Target Database Schemas

This section provides the exact SQL schema for the tables the admin portal will manage. The developer must use these definitions as the source of truth for creating data types and interacting with the database.

#### `public.admins` (New Table)
```sql
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

#### `public.appreciation_templates`
```sql
CREATE TABLE public.appreciation_templates (
  id text NOT NULL PRIMARY KEY,
  category_id text NOT NULL,
  title text NOT NULL,
  description text,
  points integer DEFAULT 1,
  points_icon text,
  point_unit text,
  icon text,
  notification_text text,
  is_active boolean DEFAULT true
);
```

#### `public.favor_templates`
```sql
CREATE TABLE public.favor_templates (
    id text NOT NULL PRIMARY KEY,
    category_id text NOT NULL,
    title text NOT NULL,
    description text,
    points integer DEFAULT 5,
    icon text,
    is_active boolean DEFAULT true,
    points_icon text NOT NULL DEFAULT '🌟'::text,
    notification_text text
);
```

#### `public.hornet_templates`
```sql
CREATE TABLE public.hornet_templates (
    id text NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text,
    severity text,
    points integer,
    icon text,
    is_active boolean DEFAULT true
);
```

#### `public.wisdom_templates`
```sql
CREATE TABLE public.wisdom_templates (
  id text NOT NULL PRIMARY KEY,
  title text NOT NULL,
  description text,
  icon text,
  color text,
  points integer DEFAULT 1,
  points_icon text DEFAULT '🧠'::text,
  point_unit text DEFAULT 'wisdom'::text,
  notification_text text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```

#### `public.dont_panic_templates`
```sql
CREATE TABLE public.dont_panic_templates (
  id text NOT NULL PRIMARY KEY,
  title text NOT NULL,
  description text,
  icon text,
  color text,
  points integer DEFAULT 1,
  points_icon text DEFAULT '⛑️'::text,
  point_unit text DEFAULT 'calm'::text,
  notification_text text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```

#### `public.ping_templates`
```sql
CREATE TABLE public.ping_templates (
  id text NOT NULL PRIMARY KEY,
  title text NOT NULL,
  description text,
  icon text,
  color text,
  points integer DEFAULT 1,
  points_icon text DEFAULT '🏓'::text,
  point_unit text DEFAULT 'ping'::text,
  notification_text text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```

---

## 3. Functional Requirements

### 3.1. Login Page
- A simple, clean login form with "Email" and "Password" fields.
- Displays clear error messages for invalid credentials or server errors.
- On successful login, the user is redirected to the main dashboard.

### 3.2. Admin Dashboard
- A unified interface for managing all template types.
- A tabbed navigation to switch between each of the six template tables.
- A prominent "Logout" button.

### 3.3. Template Management (for each template type)
- **List View (Read):**
    - A table displaying all templates for the selected type.
    - Key columns should be visible (e.g., `title`, `description`, `points`, `is_active`).
    - An "Edit" and a "Delete" button for each row.
- **Create Functionality:**
    - A "Create New Template" button that opens a modal form.
    - The form must contain fields for all user-editable columns of that specific template table (e.g., `id`, `title`, `description`, `points`, `icon`, `is_active`, etc.).
    - Proper input validation (e.g., `points` must be a number).
- **Update Functionality:**
    - Clicking the "Edit" button opens the same modal form, pre-filled with the existing template data.
    - The user can modify the data and save the changes.
- **Delete Functionality:**
    - Clicking the "Delete" button will trigger a confirmation dialog to prevent accidental deletion.
    - On confirmation, the template is removed from the database.

---

## 4. Design & UI/UX Guidelines

### 4.1. Color Schema

The admin portal should have a professional, clean, and minimalist aesthetic. It should feel like a tool, not a consumer application.

- **Primary Background:** White (`#FFFFFF`) or a very light gray (`#F9FAFB`).
- **Primary Text:** A dark, near-black color (`#111827`).
- **Primary Accent/Brand Color:** A calming but distinct blue, such as `#3B82F6` (Tailwind's `blue-500`). Used for buttons, links, and active tabs.
- **Secondary Accent (Success):** Green (`#22C55E` - `green-500`). Used for success notifications.
- **Destructive Accent (Danger):** Red (`#EF4444` - `red-500`). Used for delete buttons and error messages.
- **UI Elements (Borders, Inputs):** Light Gray (`#D1D5DB` - `gray-300`).

### 4.2. Typography

- **Font:** Use a standard, highly-readable sans-serif font. `Inter`, which is the default for Tailwind CSS, is a perfect choice.
- **Headings:** Bold and clear.
- **Body Text:** Standard weight, with sufficient line height for readability.

### 4.3. Layout & Components

- **Layout:** Use a simple, single-column layout for the main content area.
- **Navigation:** Clear and simple tab-based navigation for template types.
- **Buttons:** Clear visual hierarchy. Primary actions (Save, Create) should use the primary accent color. Secondary actions (Cancel) should be plainer. Destructive actions (Delete) must be red.
- **Forms:** Labels should be clearly associated with their inputs. Use placeholder text to guide users. Validation messages should be displayed clearly next to the relevant field.
- **Modals:** Use modals for create/edit forms to keep the user in the context of the main list view.

---

## 5. Implementation Steps (Developer Guide)

This is the recommended order of operations for building the portal.

1.  **Phase 1: Setup & Backend**
    1.  Create the separate `gratitude-bee-admin` repository and initialize the Next.js project.
    2.  Implement the SQL scripts provided in this document (`01_create_admins_table.sql`, `02_update_template_rls.sql`) in the Supabase SQL Editor.
    3.  Create an `argon2id` hashing utility and a seed script to create the first admin user with a securely hashed password.
    4.  Develop and deploy the `admin-login` Supabase Edge Function.
2.  **Phase 2: Frontend Foundation**
    1.  Build the login page UI in Next.js.
    2.  Implement the client-side logic to call the `admin-login` function and handle the returned JWT (store it in a secure, http-only cookie).
    3.  Create a client-side Supabase helper that initializes the client and attaches the JWT to requests.
    4.  Set up protected routes/middleware to ensure only authenticated admins can access the dashboard.
3.  **Phase 3: CRUD Implementation**
    1.  Build the main dashboard layout with the tabbed navigation.
    2.  For the first template type (e.g., `wisdom_templates`), implement the full CRUD functionality:
        - Fetch and display the list of templates.
        - Build the create/edit modal form.
        - Implement the create, update, and delete logic.
    3.  Once the first template type is working perfectly, replicate the pattern for the remaining five template types. This ensures a consistent and reusable component structure.
4.  **Phase 4: Deployment**
    1.  Configure the project for deployment on Vercel.
    2.  Set up environment variables in the Vercel project settings (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
    3.  Connect the Vercel project to the `gratitude-bee-admin` GitHub repository for automatic deployments on push.
    4.  Configure the custom domain (`www.gratitudebee.com`) to point the `/admin` path to the Vercel deployment, or use a subdomain like `admin.gratitudebee.com`.

---

## 6. Developer Onboarding & Credentials

### 6.1. ⚠️ Security Warning ⚠️

**THIS SECTION CONTAINS SENSITIVE INFORMATION. DO NOT COMMIT THIS DOCUMENT WITH REAL SECRETS TO A PUBLIC REPOSITORY. SHARE IT WITH THE DEVELOPER THROUGH A SECURE, ENCRYPTED CHANNEL (E.G., A PASSWORD MANAGER, ENCRYPTED MESSAGING).**

The developer is responsible for the secure handling of these credentials and must not expose them in client-side code or public repositories.

### 6.2. Required Credentials

These are the keys and URLs needed to connect the Next.js admin portal to the Supabase backend. They can be found in your Supabase Project Dashboard under `Project Settings > API`.

- **Supabase Project URL:**
  - **Purpose:** The unique URL for your Supabase project's API.
  - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
  - **Value:** `[FILL IN YOUR SUPABASE PROJECT URL HERE]`

- **Supabase Public Anon Key:**
  - **Purpose:** A public key required for the Supabase client to interact with the database. It allows access based on Row Level Security (RLS) policies.
  - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **Value:** `[FILL IN YOUR SUPABASE ANON KEY HERE]`

- **Supabase Service Role Key:**
  - **Purpose:** A secret key that bypasses all RLS policies. It is **EXTREMELY POWERFUL**. This key **MUST ONLY** be used within secure Supabase Edge Functions on the backend. It will be used for our `admin-login` function to access the `public.admins` table and mint a JWT.
  - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
  - **Value:** `[FILL IN YOUR SUPABASE SERVICE ROLE KEY HERE]`

- **Supabase Database Password:**
  - **Purpose:** Needed for connecting to the database directly using a client like `psql` or TablePlus for debugging purposes. Found under `Project Settings > Database`.
  - **Value:** `[FILL IN YOUR DATABASE PASSWORD HERE]`

- **JWT Secret:**
  - **Purpose:** A secret key used to sign the custom admin JWTs. It should be a long, random, secure string. You can generate one using a password manager or an online generator. This is found under `Project Settings > API > JWT Settings`.
  - **Key:** `JWT_SECRET`
  - **Value:** `[FILL IN YOUR JWT SECRET HERE]`

### 6.3. Local Development Setup

The developer must perform these steps to set up their local environment for the `gratitude-bee-admin` project.

1.  **Clone the Repository:**
    ```bash
    git clone [GIT_REPOSITORY_URL_FOR_GRATITUDE_BEE_ADMIN]
    cd gratitude-bee-admin
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Create Environment File:**
    - Create a new file in the root of the project named `.env.local`.
    - **This file is ignored by Git and should never be committed.**
    - Populate the file with the public credentials:

    ```env
    # .env.local
    NEXT_PUBLIC_SUPABASE_URL=[PASTE SUPABASE PROJECT URL HERE]
    NEXT_PUBLIC_SUPABASE_ANON_KEY=[PASTE SUPABASE ANON KEY HERE]
    ```

4.  **Set Up Supabase Edge Function Secrets:**
    - The secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`) must not be stored in the code. They must be set as environment variables for the Supabase Edge Function.
    - Using the Supabase CLI, the developer will run the following commands from within the main `gratitude-bee` repository (where the functions are defined):
    ```bash
    # Log in to Supabase CLI (one-time setup)
    npx supabase login

    # Link the project (one-time setup)
    npx supabase link --project-ref [YOUR_SUPABASE_PROJECT_ID]

    # Set the secrets for all functions in the project
    npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[PASTE SERVICE ROLE KEY HERE]
    npx supabase secrets set JWT_SECRET=[PASTE JWT SECRET HERE]
    ```

### 6.4. Access Control Summary

- **Developer Role:** Remote Developer
- **GitHub Access:** The developer should be granted access to the new `gratitude-bee-admin` repository. They do not need access to the `gratitude-bee` mobile app repository unless specified otherwise.
- **Supabase Access:** The developer does **not** need to be added as a member of the Supabase organization. The keys provided above are sufficient for all required development tasks. This follows the principle of least privilege.
- **Vercel/Deployment Access:** The developer will need access to the Vercel project connected to the `gratitude-bee-admin` repository to monitor deployments and view logs. 
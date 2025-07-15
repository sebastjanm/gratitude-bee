# Technical Debt Log

This document tracks known technical debt in the project. These are items that are not critical bugs but should be addressed to improve code quality, performance, or maintainability.

---

## 1. Redundant Supabase Realtime Publication

- **Date Identified:** 2024-07-25
- **Severity:** Low
- **Status:** Pending (Awaiting Supabase Support Action)

### Problem Description

During an investigation into our Supabase Realtime setup, we discovered a redundant and undeletable publication named `supabase_realtime_messages_publication`.

This publication was likely created manually during the initial development of the chat feature. It is now obsolete because all necessary tables (`conversations`, `messages`, `conversation_participants`) are correctly managed by the standard `supabase_realtime` publication.

The core issue is that this redundant publication is owned by the internal `supabase_admin` role. Due to platform-level security restrictions, our user role (`postgres`) does not have the permissions to drop this publication from the SQL editor. Attempts to change ownership or set role to `supabase_admin` fail with permission errors.

### Impact

This is not a critical bug and does not affect the application's functionality. The primary impact is minor:

- **Performance:** The database does a small amount of unnecessary work by publishing changes to two publications instead of one.
- **Maintainability:** It adds a piece of "cruft" to the database schema, which can be confusing for future developers.

### Resolution Plan

The only way to resolve this is to have the Supabase support team remove the publication, as they are the only ones with the necessary permissions.

A support ticket should be opened with the following information:

**To:** Supabase Support
**Subject:** Unable to drop publication owned by `supabase_admin`

**Body:**

> Hello,
>
> I am trying to clean up my database and need to remove a redundant publication named `supabase_realtime_messages_publication`.
>
> The publication is owned by the `supabase_admin` role, and I am unable to drop it from the SQL editor because my user does not have the required permissions.
>
> Could you please run the following command on my project's database?
>
> ```sql
> DROP PUBLICATION supabase_realtime_messages_publication;
> ```
>
> My Project Reference ID is: `[Your Project Ref ID Here]`
>
> Thank you. 
-- This migration adds a 'reaction' column to the 'events' table.
-- The 'reaction' column will store a short text key (e.g., 'heart', 'thumbs_up')
-- representing a user's reaction to a received event.

ALTER TABLE events
ADD COLUMN reaction TEXT; 
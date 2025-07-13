-- This migration adds new values to the event_type enum to support new event types.

alter type event_type add value if not exists 'WISDOM';
alter type event_type add value if not exists 'PING';
alter type event_type add value if not exists 'DONT_PANIC';

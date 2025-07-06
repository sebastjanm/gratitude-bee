# Gratitude Bee - Analytics Calculation Logic

This document provides a detailed explanation of how the statistics and insights on the Analytics screen are calculated. All calculations are currently performed on the client-side within the `analytics.tsx` component.

**Note on Performance:** For this application's scope, performing calculations on the client is acceptable. In a production environment with a larger data volume, it would be more performant to offload these computations to a backend service or Supabase database functions (RPC endpoints) to avoid high resource usage on the user's device.

---

## 1. Data Fetching

-   **Trigger:** Data is fetched every time the Analytics screen comes into focus, using the `useFocusEffect` hook. This ensures the data is always fresh.
-   **Scope:** The app fetches all events where the current user or their partner is either the `sender_id` or `receiver_id`. This comprehensive fetch is necessary to calculate relational stats like the "Balance Score" and "Partner's Favorite Category."
-   **Filtering:** The initial fetch retrieves all event types. Subsequent processing on the client filters and aggregates this data based on the selected time period (`This Week`, `This Month`, `All Time`).

---

## 2. Calculation Details

Once the raw event data is fetched, it's processed by the `processAnalyticsData` function to generate the stats displayed on the screen.

### Main Stats

-   **Total Sent:** A simple count of all events where `sender_id` matches the current user's ID.
-   **Total Received:** A simple count of all events where `receiver_id` matches the current user's ID.
-   **Daily Average:** Calculated as `Total Sent / 30`. This provides a rolling 30-day average. *(Note: For more precise filtering by "This Month", this logic could be enhanced to use the actual number of days in the current month).*
-   **Streaks (Current & Longest):**
    1.  **Filter & Sanitize:** The calculation first isolates all `APPRECIATION` events sent by the user. The timestamps are converted to represent just the date (setting hours, minutes, seconds to zero) to ensure each day is counted only once.
    2.  **Sort & Uniq:** The dates are sorted in descending order and made unique.
    3.  **Current Streak:** The logic checks if the most recent appreciation was sent *today* or *yesterday*. If so, it iterates backward through the unique dates, counting consecutive days. The streak breaks if the gap between two dates is more than one day.
    4.  **Longest Streak:** The logic iterates through all unique, sorted dates, tracking the longest sequence of consecutive days at any point in the user's history.

### Weekly Breakdown

-   **Time Buckets:** The calculation creates four buckets: "This Week," "Last Week," "2 Weeks Ago," and "3 Weeks Ago."
-   **Aggregation:** It iterates through all events and calculates the difference in days between the event's creation date and today's date.
-   **Categorization:** Based on the day difference, each event is placed into one of the four weekly buckets. Inside each bucket, events are tallied as either `positive` (any non-hornet event) or `negative` (`HORNET` events).

### Category Breakdown

-   **Initialization:** A stats object is created with a key for each appreciation category (e.g., `humor`, `kindness`) and `hornet`. Each category tracks `sent` and `received` counts.
-   **Tallying:** The code iterates through every event. It identifies the event's category (`content.category_id` for appreciations, `hornet` for hornets).
-   **Counting:** Based on whether the user was the `sender_id` or `receiver_id`, the corresponding counter in the category object is incremented.

### Insights

-   **Most Active Day:** An array representing the days of the week (0-6) is created. The code loops through all events *sent* by the user, incrementing the counter for the day of the week on which it was sent. The day with the highest count is identified as the "Most Active Day."
-   **Your Favorite Category:** This is determined by finding the category in the `categoryStats` object where the user's `sent` count is the highest.
-   **Partner's Favorite Category:** This is determined by finding the category in the `categoryStats` object where the user's `received` count is the highest.
-   **Balance Score:** This score represents the give-and-take ratio. It's calculated as: `(min(sent, received) / max(sent, received)) * 100`. A score of `100%` indicates a perfect 1:1 balance of sent and received events. If either sent or received is zero, it returns `N/A`. 
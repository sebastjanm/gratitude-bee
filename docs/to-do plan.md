---

# TODOs for Tomorrow (YYYY-MM-DD)

- [ ] Homepage: Add more Lottie animations for `calculateEngagementStage`
- [ ] Homepage: Ensure that data is restarted every midnight
- [ ] Homepage: Make "Today's Tip" be fetched randomly from the database
    - [ ] Create a new 'tips' table in Supabase with columns: id (PK), category, title, body, created_at
    - [ ] Seed the table with example tips
    - [ ] Add a Supabase SQL function or RPC to fetch a single random tip (optionally by category)
    - [ ] Add a data layer function in the app to call the random tip endpoint
    - [ ] Update the 'Today's Tip' component to fetch and display the random tip (title + body)
    - [ ] Handle loading and error states in the UI
    - [ ] Update docs/implementation-flow.md to reflect this change
- [ ] Timeline: Ensure that all cards are consistent and show points
- [ ] Badges: Ensure that all badge cards show earned points
- [ ] Badges: Find where the butterflies from appreciation are
- [ ] Analytics: Figure out how we measure streak
- [ ] Profile: Figure out how we calculate impact
- [ ] Profile: Implement export memory book
- [ ] Profile: Make notifications work
- [ ] Profile: Figure out what goals are
- [ ] Profile: Figure out what challenge is
- [ ] Idea: Create a "družinska sreča" plant feature that needs regular watering

--- 
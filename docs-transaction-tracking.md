# Transaction tracking app setup

The new `TrackingLifecycle` runs a bounded sync when the app opens or returns
to the foreground. Android SMS capture continues with a native receiver and
WorkManager when React Native is not running. Gmail and Outlook sync remains
server-side; the app provides connect, sync-now, disconnect, review, and delete
controls.

Run `npm run start:dev` with a custom development build. Expo Go cannot provide
SMS receiver or WorkManager support. iOS exposes email and manual paste only.

The Card Nest rows open `card-details`, which always requests at most ten newest
events for that exact `user_card_id`. The review inbox keeps unmatched or
uncertain events outside cap calculations until the user confirms them.

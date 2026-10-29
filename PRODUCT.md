# Product: RideOps

## Vision

A private cycling journal for recording rides and turning GPX files into routes and reliable metrics. The goal is a portfolio project that is also useful in everyday life.

## MVP

A user can create an account, sign in, record and edit a manual ride, import a valid GPX file, view its route, and query totals for a selected period. None of these actions grants access to another user's data.

### Main flows

1. **Manual ride:** create an account → sign in → enter a title, start time, and distance, with optional duration → view history → edit or delete.
2. **Import:** select a GPX file → validate → calculate metrics → persist the activity and track → open details with a map. Invalid files produce predictable errors; duplicates do not create another activity.
3. **Progress:** select a period → view distance, known duration, and activity count → open a ride from history.

## Domain terms

- **User:** the owner of their activities, with an email address, protected password, and timezone.
- **Ride:** an activity with a `MANUAL` or `GPX` source, owned by exactly one user.
- **Track:** an ordered sequence of GPS points associated with an imported ride.
- **Segment:** a continuous set of points in a GPX file; separate segments are not artificially connected.
- **Import:** a record of file processing, including its checksum, outcome, and any error.

## Units, dates, and metrics

- The database and API use meters for distance and elevation, and seconds for duration. The UI converts distance to km and speed to km/h.
- Instants are persisted in UTC. The user's IANA timezone governs date entry and display; registration must capture this timezone.
- Periods use `[from, to)` intervals: inclusive start and exclusive end. Boundaries selected as local dates are converted to UTC before querying.
- Distance and other numeric measurements must be finite and nonnegative.
- A missing value is `null`, never an invented zero. The UI displays “not available”. Zero represents a known measurement equal to zero.
- Manual rides require a nonempty title, start time, and distance. Duration, elevation gain, and notes are optional. They have no GPS track; user-entered metrics are not presented as GPS calculations.
- GPX distance is the sum of Haversine distances between consecutive points within the same segment. Latitude must be within `[-90, 90]` and longitude within `[-180, 180]`.
- GPX duration represents elapsed time, not moving time. Without enough valid timestamps, duration is `null`; the policy for inconsistent timestamps will be detailed in the parser.
- Average speed is calculated only when distance and duration are known and duration is greater than zero. Moving time is outside the MVP.
- Without elevation data, elevation gain is `null`. GPS-derived gain remains unavailable until a noise filter is documented and tested. This does not prevent users from entering gain manually.
- Totals include only known measurements. The UI distinguishes partial totals from complete totals; a period containing activities with no known duration must not display zero hours as a measurement. A period with no activities has zero activity count and total distance.

## Integrity and privacy

- All activities are private. Reads, updates, deletions, imports, and aggregations enforce ownership.
- The same file, identified by SHA-256, must not create two rides for the same user after a completed import. Different users may import the same file.
- Persistence of an imported activity, its track, and points is transactional. Errors must not leave partially imported activities.
- Initial upload limit: 5 MB. The point limit will be configurable and defined in the upload ticket.
- Passwords, tokens, GPX contents, and coordinates must not appear in normal logs.

## Outside the MVP

Social feeds, followers, challenges, live GPS recording, automatic Strava/Garmin integration, AI, sensors, payments, and public location sharing. Queues, workers, personal records, goals, moving time, and exports are later enhancements.

## MVP definition of done

- All three main flows work with persisted data and authentication.
- A user cannot read or modify another user's data, including tracks and aggregates.
- Valid GPX files produce consistent routes and metrics; invalid and duplicate files have verifiable handling.
- Missing metrics are not disguised as zeros; segments are not joined in calculations or on the map.
- Core screens work on mobile and provide loading, empty, and error states.
- Tests cover core rules and essential flows; lint, typecheck, and build pass.

## Risks and future decisions

- Noisy GPS data and incomplete timestamps: document policies and test fixtures in the parser and metric calculations.
- Sensitive location data: test ownership authorization and prevent exposure in logs.
- Timezones and month boundaries: test period boundaries in aggregations.
- Map provider: select before implementing the map, documenting attribution, limits, and costs.
- Sessions, CSRF, and hashing: decide during authentication implementation, before exposing private routes.
- Hosting and recovery: decide during the delivery phase, without introducing distributed infrastructure early.

## RO-001 verification

- [x] MVP, exclusions, and three main flows are described.
- [x] Meters, seconds, and UTC are explicitly defined.
- [x] Policies for missing metrics and manual rides are defined.

Validation: documentation review of all three criteria. Automated tests do not apply to this delivery; there is no executable application code yet.

# Courses directory V2 audit

Audit date: 28 October 2026

The deployed Fiper page was captured at 1440 px and 390 px. CFI continued to block automated capture, so the comparison uses the client supplied reference screenshot and does not infer unavailable states.

| Section | What exists | What the reference handles better | V2 fix |
| --- | --- | --- | --- |
| Hero proof | Three honest live totals | Avoids making very small totals feel like weak adoption | Apply a configurable threshold; below it show free registration, live format, and reminder trust signals instead of tiny counts |
| Next session | Countdown, instructor, calendar and registration actions | Stronger session trust and clearer local timing | Local timezone display and selector, capacity based availability, share action, and starting soon state |
| Course covers | Uploaded cover or one repeated Fiper fallback | Every course is visually distinct | Preserve uploaded covers and generate a deterministic branded market pattern per course when absent |
| Catalog discovery | Search, delivery filter and date/popularity sort | Richer ways to narrow a larger catalog | Add real level, topic, today, and this week chips; hide filters with no backing data |
| Course cards | Image, title, schedule, instructor and CTA | Denser but clearer trust hierarchy | Level/topic/format chips, local time, thresholded registrations, capacity fallback, share action, and distinct fallback artwork |
| Instructor trust | Name, title and free text biography | Credentials are structured and easier to verify | Replace marketing biography on the directory with editable years active, focus markets, and credentials plus a compliance note |
| Community and sharing | No course share or community link | Visitors can continue the relationship outside one page | Web Share API with copy fallback, optional configured WhatsApp community CTA, and configured footer socials |
| FAQ and recordings | Accessible accordion and JSON LD | Recording expectations stay linked to actual availability | Keep the first answer open, retain visible body copy, and state that recordings appear only when Fiper publishes one |
| Replays | Not rendered | Reference can expose a broader library | Keep a typed replay source hidden until real replay records or URLs exist |
| Data model | Capacity exists on sessions; no level/topic or structured instructor facts | Course metadata supports richer discovery | Separate nullable migration for course level/topic and instructor factual fields; do not duplicate session capacity |

## Guardrails

- No registration totals are fabricated.
- No testimonial or replay section renders without verified data.
- Uploaded course covers remain authoritative.
- Existing course detail routes, registration APIs, dashboard behavior, countdown instants, Google Calendar dates, and ICS UTC values remain intact.

# Courses redesign verification

Verification date: 28 October 2026

## Automated checks

- `npx tsc --noEmit`: passed
- ESLint for all changed application files: passed with no errors or warnings
- `npm run build`: passed
- Existing public course detail and registration routes were not changed
- No database migration or dashboard schema change was introduced

## Lighthouse mobile

The production build was tested locally at a 390 by 844 mobile viewport with simulated mobile throttling.

| Category | Score |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| SEO | 100 |

Core measurements:

- Largest Contentful Paint: 0.9 seconds
- Cumulative Layout Shift: 0
- Total Blocking Time: 40 milliseconds

Reports:

- `docs/lighthouse-courses-mobile.report.html`
- `docs/lighthouse-courses-mobile.report.json`

## Data still needed from Fiper

- Verified course levels and topics before those filters can be shown
- Replay or previous session data before a replay section can be enabled
- Approved participant testimonials before social proof can render
- Verified social profile URLs before footer social icons can render

## Test limitation

The local Windows environment returned no Supabase course rows, so Lighthouse measured the fully rendered academy shell and its designed empty catalog state. The deployed page must be checked once more against production data because course images and card count can affect its final performance score.

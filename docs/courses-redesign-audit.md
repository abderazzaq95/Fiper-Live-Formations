# Courses directory redesign audit

Audit date: 28 October 2026

The current Fiper page was inspected at 1440 px and 390 px with Edge and Playwright. The CFI reference timed out under automated browsing, so its patterns below are based on the screenshot supplied by the client. No inaccessible reference state is inferred.

| Section | Reference pattern | What the reference does better | Current Fiper gap | Planned fix |
| --- | --- | --- | --- | --- |
| Header | Compact academy navigation with an obvious next action | Faster orientation and a stable conversion path | Only two links and no complete page navigation | Sticky RTL header with section anchors, compact scroll state, mobile menu, and one registration CTA |
| Hero | Clear academy promise supported by useful discovery controls | Explains the offer before presenting courses | Large empty area, weak proof, and no secondary action | Outcome led headline, real aggregate stats, dual CTA, and restrained market line motif |
| Next session | Strong priority for the nearest learning opportunity | Reduces choice friction | Nearest course is only marked inside the grid | Dedicated next live session with countdown, live state, instructor, calendar actions, and registration CTA |
| Catalog | Searchable, consistent two column course tiles | Makes comparison quick and predictable | Static two card list with no search, filters, sort, skeleton, or filtered empty state | Search, real data filters, date sorting, reusable cards, loading skeleton, and composed empty result |
| Course cards | Rich image first hierarchy and concise metadata | Course differences are scannable | Repeated branding image dominates; attendee number includes a marketing offset | Real cover data, two line summaries, session metadata, instructor identity, and only real registration totals |
| Learning value | Academy context surrounds the catalog | Builds confidence beyond a list of products | One short “why live” statement | Live learning outcomes, three step process, and a separate benefit statement reveal |
| Instructors | Educator identity is part of discovery | Trust is attached to real people | Instructor appears only inside each course card | Deduplicated instructor section built from existing course data |
| Proof | Proof appears only when credible | Trust does not rely on unsupported claims | No typed proof source; attendance display is inflated | Typed social proof source that renders only when populated with verified data |
| FAQ | Common objections answered before conversion | Reduces uncertainty | No directory FAQ | Accessible accordion plus FAQPage structured data |
| Footer | Full academy and legal context | Feels complete and trustworthy | Minimal links and no financial risk disclosure | Navigation, contact, optional configured social links, terms/privacy routes, and Arabic educational risk disclaimer |
| Mobile | Discovery and conversion remain close at hand | Mobile users retain a clear next step | No persistent next session action | Responsive catalog, accessible menu, and sticky bottom registration CTA |
| SEO | Discoverable academy landing page | Better search and sharing readiness | Wrong `metadataBase`, no sitemap/robots, no Twitter card, no Event/FAQ/Organization schema | Canonical production domain, Open Graph image, social metadata, structured data, sitemap, robots, and Vercel host noindex header |

## Data constraints

- Course level and topic are not stored in the current Supabase schema. The redesign will not add a migration. It will expose only filters backed by existing delivery and course text data.
- The public query returns upcoming or currently active sessions only. A previous sessions or replay section will stay hidden until the data layer supports it.
- Testimonials and social links have no verified source yet. Their typed configuration will remain empty and invisible.
- Existing routes, registration flow, dashboard, and database schema remain unchanged.

## Direction

Use a long form academy story with one primary conversion: registration in an active live course. Preserve Fiper’s dark navy and red identity, but introduce clearer hierarchy, deliberate light and dark section rhythm, real data proof, and restrained motion instead of adding decorative cards everywhere.

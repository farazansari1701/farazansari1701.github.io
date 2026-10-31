# Measurement and conversion definitions

This portfolio uses Google Tag Manager `GTM-57BRSKXB` and GA4 `G-0S2BYMQSKW`.
Analytics default to denied; `fa-consent` in local storage controls analytics.
Never send names, email addresses, booking payloads, invitee URIs, or other personal data as event parameters.

| Event | Trigger | What it means |
|---|---|---|
| `page_view` | Page opened with consent granted | A page view, not a unique user |
| `project_click` | Internal link to a case study selected | Navigation intent, not a confirmed visit |
| `project_visit` | Actual individual case study page loaded with consent | Case study viewed; uses `project_slug` |
| `booking_intent` | User chooses a Calendly booking link | Interest only |
| `booking_confirmed` | Origin-checked Calendly `event_scheduled` message from the embedded widget | Scheduling completion confirmed in the widget |
| `contact_click` | Email, phone or booking link activated | Contact intent only |
| `cv_open` / `cv_download` | CV link opened/downloaded | File interaction, not an application |
| `article_read` | 60 seconds active and 75% of article reached | Engaged reading proxy |

The widget JavaScript and styles are **loaded only on booking-link interaction**.
If the widget fails, the visitor can still open the ordinary Calendly link.
Bookings completed outside the embedded Calendly widget do not create
`booking_confirmed` events on this website.

For cross-device or server-confirmed conversions, configure a secure Calendly
`invitee.created` webhook through a managed server/Make workflow, de-duplicate
by event ID, and pass only non-personal conversion information to your
measurement system. This is **not implemented in the static GitHub Pages site**.

## Checks before calling conversion tracking validated

1. Test consent denied, consent granted and consent withdrawn in Chrome and WebKit.
2. Check that a direct case-study URL emits `project_visit` after consent, while a link activation emits `project_click`.
3. Use a genuine Calendly test booking in the embed. Confirm a single `booking_confirmed` event and no sensitive payload in GA4.
4. Confirm actual events in GA4 Realtime/DebugView, then in normal reports after processing.
5. Configure GA4 custom event dimensions (such as `project_slug`) if reports need them; mark only genuine business outcomes as key events.
6. Keep test visits separate from production reporting where practical.

The automated browser suite tests event dispatch and consent semantics locally.
It does not create real meetings or prove that GA4 has ingested the new events.

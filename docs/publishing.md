# Publishing digital marketing insights

The site is a static GitHub Pages deployment from `main`. Public articles use `/blogs/`.

1. Read `blogs/posts.json` and current live content before selecting a topic. Use the private editorial register to prevent duplicate publication for a London calendar date. A refresh is preferable when a distinct, evidenced article is unavailable.
2. Create a new Markdown body and matching JSON in `blogs/content/`. Preserve the original publication timestamp on refresh. Generate and inspect an original, relevant image, then add compressed WebP variants and a 1200 × 630 social asset.
3. Prepare useful contextual inbound links on existing pages before release. Add useful links from the article to older material. All related changes must deploy together.
4. Run `npm ci`, `npm run build:blogs`, and `npm run check:blogs`. Review source claims, external references, responsive styles and interactions. Inspect changed files and retain the prior commit SHA.
5. Build a Git tree on the current branch head, then one commit. Update `main` only with an expected-head lease. On conflict, fetch the new head and reconcile changes. Never force-push over someone else's work.
6. Verify the public article, image variants, metadata, sitemap, feed and changed inbound links. Compare live bytes with the release where practical. Record commit, deployment time and results in private deployment history.

## Reliability

Use a job key `faraz-growth:YYYY-MM-DD` in Europe/London and a unique attempt identifier. Read the private run history and the public article registry first. If today's job already completed, perform verification and reporting without creating a second article. Native scheduling supplies one daily trigger; a branch lease provides the final concurrency guard. Re-read history before publication. A failed lease requires reconciliation, not a blind retry.

Retry a transient read at most twice with a bounded delay. After an uncertain write, inspect the actual target before retrying. Never publish when facts, required media or link validation fail. Report failed stages and keep the staged changes. Connected tools hold credentials; no API secrets belong in this repository.

## Recovery

Retain the last verified commit in private deployment history. If a release introduces a material failure, stop dependent publication. Prepare a new commit restoring only the affected files from the verified version, preserving unrelated subsequent edits. Validate, deploy with a current-head lease, verify live and log the incident. Do not reset the branch or delete article history.

## Measurement

`contact_click` measures email, phone or booking intent. `outbound_profile_click` records the destination hostname. `file_download` records public document paths. `cv_download` applies when a CV or resume file is actually available and clicked. `article_read` requires analytics consent, 60 seconds of visible-page time and at least 75% article depth. None establishes a confirmed enquiry, qualified lead or sale. Verify delivery in GA4 after the account is connected.


## Google Tag Manager and consent

Shared templates `templates/tag-manager-head.html` and `templates/tag-manager-body.html` contain the standard snippets for `GTM-57BRSKXB`. The build installs them high in the head and immediately after the opening body on the portfolio, all current and future blog pages, and the 404 pages. GTM now loads on page opening, including the standard noscript iframe when JavaScript is disabled. Its published version 2 includes the Google tag for `G-0S2BYMQSKW`, verified on 21 October 2026.

Consent defaults are set synchronously before GTM. Analytics and advertising storage default to denied; the GA4 disable flag remains true until the existing `fa-consent` choice is granted. Advertising consent stays denied. The shared `assets/analytics.js` asset handles consent choices, withdrawal and cross-tab changes. It sends one page view after analytics consent and after the document is ready. Initial automatic page views are suppressed with the global `send_page_view: false` setting; this avoids losing or duplicating a page view when consent is granted before or after GTM finishes loading.

GTM owns the Google tag. Do not reintroduce a standalone gtag.js loader or a second GA4 config, and do not add a second automatic page-view tag. Existing consent-gated interaction events use the same data layer. Future GTM tags must respect consent, including third-party tags without built-in checks. The noscript iframe cannot read the JavaScript consent preference; do not add noscript image trackers that collect analytics or marketing data without an appropriate consent mechanism.

The installation checker previously missed the delayed external GTM bootstrap. The standard inline snippet now exposes and starts the container independently of the analytics choice. Validate the inline bootstrap, one container load, denied/granted/withdrawn states, and one page view in `npm run check:blogs`. Verify received events with Tag Assistant and GA4 when browser/reporting access is available; static and isolated execution checks do not prove event delivery.

## Portfolio responsive layer and CV

`assets/portfolio-responsive.css` and `.js` provide progressive mobile disclosures at the existing 760px breakpoint. Without JavaScript all text and cards remain available. Desktop shows the complete original content; phones initially show four core skills and four featured certificates. Keep all cards and text in the original HTML. The build generates versioned minified assets for both portfolio entry points and copies the applicable footer rules to every blog page.

The section menu has a bounded internal scroll area and a keyboard focus loop. Mobile/tablet flight animation plays the existing boarding-pass and flight sequence once on viewport entry, without the desktop pin. Desktop retains its pinned scroll timeline. Touch rotation uses pointer capture and yields vertical gestures to page scrolling; reduced motion keeps manual rotation available without automatic spinning.

The Contact section links to the owner-supplied, unmodified `assets/Faraz-Ansari-CV.pdf`. Keep both the same-origin download link and the open-in-new-tab fallback. Its click is eligible for the existing consent-gated `cv_download` event; that is a click intent, not proof of a completed download. A future CV replacement must use the owner's approved file.

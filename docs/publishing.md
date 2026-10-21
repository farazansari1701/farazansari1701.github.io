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

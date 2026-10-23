# Blog publishing requirements

Every HTML page under `blog/`, including posts, archives, topic pages and author pages, must use the shared footer in `templates/blog-footer.html` and load the generated `/blog/assets/footer.min.css` and `/blog/assets/footer.min.js`. Keep the shared cookie preferences control wired to the blog banner via `blog/assets/footer.js`. The footer must be present in the generated HTML, not only injected by JavaScript.

After adding or editing a blog page, run `npm ci` once, then `npm run build:blogs` from the repository root before publishing. This synchronizes the footer from the main portfolio `index.html`, including its styles and shared SVG artwork, applies it to new and old pages, then generates minified JavaScript and CSS with content-based cache versions. The exact portfolio SVG is included directly in the shared footer and must render without JavaScript; shared footer code adds the original scroll animation. Preserve the existing skyline geometry and animated behaviour. Do not approximate the portfolio footer or fork its artwork, colours, spacing or typography. Preserve the existing page content, canonical URLs, metadata and header navigation. Validate internal anchors, one footer per page, social links, and cookie settings.

Archive pages must offer useful introductory guidance and contextual links, rather than an empty list of posts. Keep metadata titles concise and unique. Preserve the requested title on the blog homepage. Always synchronise the exact shared portfolio footer; do not replace its inline artwork with a runtime fetch.

Managed new articles live in `blog/content/<slug>.md` with matching JSON metadata. `scripts/build-posts.py` renders them, updates the archive cards, RSS and sitemap, and preserves original publication dates. Do not run the old scratch builder or replace unmanaged historical posts. Keep each new article's main body between 1,000 and 1,200 words, excluding headings, source notes and bylines. Use `/blog/` for every canonical URL and public internal link. The owner requested this migration on 22 October 2026, superseding the former plural URL rule. Delete the entire old `/blogs/` directory. Do not recreate aliases, redirects, feeds or assets there.

Before release, prepare contextual inbound links on useful existing pages, render the new article, then run `npm run build:blogs` and `npm run check:blogs`. Review the entire change set and publish atomically with a current-branch lease. Verify actual live HTML, media and affected links after GitHub Pages finishes. Never report a deployment as live from a commit response alone.

Keep private reports, analytics, connector details, editorial plans and source evidence outside this public repository. Use approved public professional context or educational guidance. Do not invent achievements, results or exact historical work dates. A contact click indicates intent and is not a confirmed enquiry. The shared measurement asset only sends events after analytics consent.


## Personal journal exception

`Personal perspectives` entries have a distinct 200–2,500-word range and require ten user answers, dated approval and privacy review in metadata. Keep unpublished answers outside this public repository. The 18:00 / 20:00 Europe/London schedule is driven by ChatGPT tasks; GitHub Actions builds and publishes only committed approved source. Do not invent experiences or publish without the author's explicit approval. If the author has not responded, send a reminder and skip that day rather than generating fiction.

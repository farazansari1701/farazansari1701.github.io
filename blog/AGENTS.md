# Blog publishing requirements

Every HTML page under `blog/`, including posts, archives, topic pages and author pages, must use the shared footer in `templates/blog-footer.html` and load `/blog/assets/footer.css` and `/blog/assets/footer.js`. Keep the shared cookie preferences control wired to the blog banner via `blog/assets/footer.js`. The footer must be present in the generated HTML, not only injected by JavaScript.

After adding or editing a blog page, run `python3 scripts/update-blog-footer.py` from the repository root before publishing. This synchronizes the footer from the main portfolio `index.html`, including its styles, and applies it to new and old pages. Do not approximate the portfolio footer or fork its artwork, colours, spacing or typography. Preserve the existing page content, canonical URLs, metadata and header navigation. Validate internal anchors, one footer per page, social links, and cookie settings.

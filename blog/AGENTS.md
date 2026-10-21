# Blog publishing requirements

Every HTML page under `blog/`, including posts, archives, topic pages and author pages, must use the shared footer in `templates/blog-footer.html` and load `/blog/assets/footer.css`. Keep the shared cookie preferences control wired to `blog/assets/blog.js`. The footer must be present in the generated HTML, not only injected by JavaScript.

After adding or editing a blog page, run `python3 scripts/update-blog-footer.py` from the repository root before publishing. This applies the same footer to new and old pages. Preserve the existing page content, canonical URLs, metadata and header navigation. Validate internal anchors, one footer per page, social links, and cookie settings.

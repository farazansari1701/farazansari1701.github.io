# Faraz Ansari — personal portfolio and writing

**Website:** https://farazansari1701.com/  
**Source:** https://github.com/farazansari1701/farazansari1701.github.io

This public GitHub Pages repository contains a digital marketing portfolio, six professional case studies, personal and professional blog articles, and a privacy page. The site uses static HTML, CSS and JavaScript; `main` is the publishing branch.

## Pages

- [Homepage](https://farazansari1701.com/): career, projects, experience, certifications and contact.
- [Projects](https://farazansari1701.com/projects/): six detailed marketing case studies.
- [Blog](https://farazansari1701.com/blog/): professional insights and explicitly approved personal reflections.
- [About](https://farazansari1701.com/blog/about/): author background.
- [Privacy](https://farazansari1701.com/privacy/): privacy and cookie information.

## Build and validation

Requires **Node.js 20+** and **Python 3.11+**. Install with `npm ci` and `python -m pip install "Pillow>=10,<13"`.

```bash
npm ci
npm run build:blogs
npm run check:blogs
```

The `.github/workflows/build-blogs.yml` workflow builds and validates source changes, then commits generated output to `main`. Build scripts are in `scripts/`. See [publishing](docs/publishing.md) and [personal blogging](docs/personal-blogging.md).

## Editorial and technical safeguards

- Root `index.html` is the only canonical homepage. Do not restore `faraz-site/` or publish ZIP archives in the root.
- Publish personal essays only after explicit approval; never commit private interviews or drafts.
- Process diagrams in project pages are **editorial reconstructions**, not internal campaign screenshots, measurements or proof of results.
- Preserve public citations, accessible navigation, consent, document links and canonical URLs.
- Verify GitHub Actions and the live website before reporting deployment as complete.

## Discovery

[Sitemap](https://farazansari1701.com/sitemap.xml) · [robots.txt](https://farazansari1701.com/robots.txt) · [RSS feed](https://farazansari1701.com/blog/feed.xml).

"""Apply the shared portfolio footer to every existing and future blog HTML page.
Run from any directory: python3 scripts/update-blog-footer.py
"""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
footer = (ROOT / 'templates/blog-footer.html').read_text().strip()
for page in sorted((ROOT / 'blog').rglob('*.html')):
    if '_includes' in page.parts:
        continue
    source = page.read_text()
    pattern = r'<footer\b[^>]*>[\s\S]*?</footer>'
    if re.search(pattern, source):
        source = re.sub(pattern, lambda match: footer, source, count=1)
    else:
        source = source.replace('</body>', footer + '\n</body>')
    if '/blog/assets/footer.css' not in source:
        source = source.replace('</head>', '<link rel="stylesheet" href="/blog/assets/footer.css?v=20261021">\n</head>')
    page.write_text(source)
    print(page.relative_to(ROOT))

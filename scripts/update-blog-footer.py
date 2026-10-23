"""Apply the shared portfolio footer to every existing and future blog HTML page.
Run from any directory: python3 scripts/update-blog-footer.py
"""
from pathlib import Path
import re
import runpy
ROOT = Path(__file__).resolve().parents[1]
runpy.run_path(str(ROOT / 'scripts/sync-portfolio-footer.py'))
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
    source = re.sub(r'/blog/assets/footer(?:\.min)?\.css(?:\?[^"\s<>]*)?', '/blog/assets/footer.css?v=portfolio-20261021', source)
    source = re.sub(r'/blog/assets/footer(?:\.min)?\.js(?:\?[^"\s<>]*)?', '/blog/assets/footer.js?v=portfolio-20261021', source)
    if '/blog/assets/footer.css' not in source:
        source = source.replace('</head>', '<link rel="stylesheet" href="/blog/assets/footer.css?v=20261021">\n</head>')
    source = re.sub(r'/blog/assets/footer.css(?:\?[^"\s]*)?', '/blog/assets/footer.css?v=portfolio-20261021', source)
    if '/blog/assets/footer.js' not in source:
        source = source.replace('</body>', '<script src="/blog/assets/footer.js?v=portfolio-20261021" defer></script></body>')
    page.write_text(source)
    print(page.relative_to(ROOT))

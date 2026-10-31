"""Apply the shared portfolio footer to every existing and future blog HTML page.
Run from any directory: python3 scripts/update-blog-footer.py
"""
from pathlib import Path
import re
import runpy
ROOT = Path(__file__).resolve().parents[1]
runpy.run_path(str(ROOT / 'scripts/sync-portfolio-footer.py'))
footer = (ROOT / 'templates/blog-footer.html').read_text().strip()
# The portfolio registration mark is the canonical header logo.
portfolio_html = (ROOT / 'index.html').read_text()
logo_match = re.search(r'<symbol id="reg" viewBox="0 0 24 24">([\s\S]*?)</symbol>', portfolio_html)
assert logo_match, 'Missing homepage registration mark'
header_brand = '<a class="brand" href="/"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">' + logo_match.group(1) + '</svg><span>Faraz Ansari</span></a>'
header_css = '<link rel="stylesheet" href="/assets/shared-header.css?v=20261031-7">'
for page in sorted((ROOT / 'blog').rglob('*.html')):
    if '_includes' in page.parts:
        continue
    source = page.read_text()
    # Match the homepage header design without changing the blog's navigation links.
    source, header_count = re.subn(r'(<header class="site-header">\s*)<a class="brand" href="/">[\s\S]*?</a>', lambda m: m.group(1) + header_brand, source, count=1)
    assert header_count == 1, 'Missing blog site header: ' + str(page)
    if '/assets/shared-header.css' not in source:
        assert '</head>' in source, 'Missing head: ' + str(page)
        source = source.replace('</head>', header_css + '\n</head>', 1)
    assert source.count('/assets/shared-header.css') == 1, 'Duplicate header CSS: ' + str(page)
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

"""Keep every page's site header visually consistent with the homepage.

The homepage owns the registration mark and the CSS declarations for the fixed
header, brand, navigation and Menu control. Page-specific link text and
destinations are preserved; native details provides a working accessible menu
on smaller screens without relying on JavaScript. Run after blog generation.
"""
from pathlib import Path
from hashlib import sha256
from html import escape
import re

ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")
PORTFOLIO_CSS = (ROOT / "assets/portfolio.css").read_text(encoding="utf-8")

mark = re.search(r'<symbol id="reg" viewBox="0 0 24 24">([\s\S]*?)</symbol>', HOME)
if not mark:
    raise ValueError("Homepage registration-mark symbol not found")
brand_icon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">' + mark.group(1) + "</svg>"

def from_homepage(selector):
    expr = r'(?<![\w-])' + re.escape(selector) + r'\s*\{([^{}]+)\}'
    rule = re.search(expr, PORTFOLIO_CSS)
    if not rule:
        raise ValueError(f"Missing homepage CSS rule {selector}")
    return rule.group(1).strip()

root_css = re.search(r':root\s*\{([^{}]+)\}', PORTFOLIO_CSS)
if not root_css:
    raise ValueError("Homepage design tokens missing")
def token(key):
    rule = re.search(r'--' + re.escape(key) + r'\s*:\s*([^;]+);', root_css.group(1))
    if not rule:
        raise ValueError(f"Missing homepage CSS token {key}")
    return rule.group(1).strip()

# Extract current homepage values, rather than copying a different header
# design that could become stale on future publishes.
css = f'''/* Generated from the canonical homepage header, not another theme. */
@font-face{{font-family:Archivo;font-style:normal;font-weight:100 900;font-stretch:62% 125%;font-display:swap;src:url(/assets/fonts/archivo-roman-latin.woff2?v=f18b05b319a8) format("woff2")}}
body>header.site-header{{
--gutter:{token("gutter")};--cyan:{token("cyan")};--magenta:{token("magenta")};--ease:{token("ease")};
--font:{token("font")};
{from_homepage(".top")}
width:100%;min-height:0;margin:0;box-sizing:border-box;flex-wrap:nowrap;gap:22px;
background:transparent;border:0;box-shadow:none;font-family:var(--font);
}}
body>header.site-header>*{{pointer-events:auto}}
body>header.site-header .brand{{
{from_homepage(".logo")}
min-height:44px;display:inline-flex;justify-content:flex-start;flex-shrink:0;
margin:0;color:inherit;white-space:nowrap;line-height:1;
font-family:var(--font);text-transform:none;outline-offset:3px;
}}
body>header.site-header .brand svg{{{from_homepage(".logo svg")}flex:0 0 22px;display:block}}
body>header.site-header .brand span{{display:inline}}
body>header.site-header .site-head-actions{{{from_homepage(".top-actions")}min-width:0}}
body>header.site-header .site-nav{{{from_homepage(".header-links")}justify-content:flex-end;margin:0;padding:0;border:0;background:none;min-width:0}}
body>header.site-header .site-nav a,
body>header.site-header .site-menu-links a{{
{from_homepage(".blog-nav")}
min-height:44px;display:inline-flex;align-items:center;justify-content:center;
margin:0;background:transparent;color:inherit;line-height:1.2;letter-spacing:0;
font-family:var(--font);text-transform:none;
}}
body>header.site-header .site-nav a:hover,
body>header.site-header .site-nav a:focus-visible,
body>header.site-header .site-menu-links a:hover,
body>header.site-header .site-menu-links a:focus-visible{{{from_homepage(".blog-nav:hover")}}}
body>header.site-header .site-nav a[aria-current="page"]{{border-bottom-color:var(--cyan)}}
body>header.site-header .site-head-menu{{position:relative;flex-shrink:0;color:inherit}}
body>header.site-header .site-head-menu summary{{
display:inline-flex;align-items:center;justify-content:center;gap:8px;
min-height:44px;min-width:44px;padding:6px 0;border:0;background:none;
font:inherit;font-size:15px;font-weight:600;color:inherit;cursor:pointer;
list-style:none;user-select:none;
}}
body>header.site-header .site-head-menu summary::-webkit-details-marker{{display:none}}
body>header.site-header .site-menu-icon{{display:none;width:22px;height:22px;flex:0 0 22px}}
body>header.site-header .site-head-menu[open] summary{{color:var(--cyan)}}
body>header.site-header .site-menu-links{{
position:absolute;right:0;top:calc(100% + 10px);z-index:5;
display:flex;flex-direction:column;align-items:stretch;gap:2px;
width:max-content;min-width:210px;max-width:min(90vw,350px);
padding:15px 20px;background:#141414;color:#EDEDE9;
border:1px solid rgba(237,237,233,.18);border-radius:8px;
box-shadow:0 18px 55px rgba(0,0,0,.3);
}}
body>header.site-header .site-menu-links a{{justify-content:flex-start;white-space:normal;overflow-wrap:anywhere}}
body>header.site-header:has(.site-head-menu[open]){{
mix-blend-mode:normal;background:#141414;color:#EDEDE9;
}}
body>header.site-header a:focus-visible,
body>header.site-header summary:focus-visible{{outline:2px solid var(--cyan);outline-offset:4px}}
/* Keep the same fixed-header clearance as the existing website. */
body>header.site-header+main{{padding-top:76px!important}}
@media(max-width:900px){{
 body>header.site-header{{gap:12px}}
 body>header.site-header .site-head-actions{{gap:12px;flex-shrink:0}}
 body>header.site-header .site-nav{{gap:16px;flex-shrink:0}}
 body>header.site-header .site-menu-label{{display:none}}
 body>header.site-header .site-menu-icon{{display:block}}
}}
@media(max-width:760px){{
 body>header.site-header{{gap:8px;padding-left:20px;padding-right:20px}}
 body>header.site-header .brand{{font-size:clamp(13px,3.5vw,15px);gap:6px}}
 body>header.site-header .brand svg{{width:18px;height:18px;flex-basis:18px}}
 body>header.site-header .site-nav{{display:none}}
 body>header.site-header .site-head-actions{{gap:8px}}
 body>header.site-header+main{{padding-top:68px!important}}
 body>header.site-header .site-menu-links{{right:0;min-width:min(260px,calc(100vw - 40px));max-width:calc(100vw - 40px)}}
}}
@media(prefers-reduced-motion:reduce){{
 body>header.site-header .site-nav a,
 body>header.site-header .site-menu-links a{{transition:none}}
}}
'''
css_path = ROOT / "assets/shared-header.css"
css_path.write_text(css, encoding="utf-8")
css_version = sha256(css.encode("utf-8")).hexdigest()[:12]
css_tag = '<link rel="stylesheet" href="/assets/shared-header.css?v=' + css_version + '">'
old_css = re.compile(r'<link\b(?=[^>]*\bhref="/assets/shared-header\.css(?:\?[^"]*)?")[^>]*>\s*', re.I)

brand = '<a class="brand" href="/">' + brand_icon + '<span>Faraz Ansari</span></a>'
heading = re.compile(r'<header\b[^>]*>[\s\S]*?</header>', re.I)
anchor = re.compile(r'<a\b[^>]*>[\s\S]*?</a>', re.I)
nav_pattern = re.compile(r'<nav\b[^>]*>[\s\S]*?</nav>', re.I)
legacy_top = re.compile(r'<a\b[^>]*\bclass="top"[^>]*>[\s\S]*?</a>', re.I)
body_pattern = re.compile(r'<body\b[^>]*>', re.I)
main_pattern = re.compile(r'<main\b', re.I)

def build_header(links, label):
    if not links:
        return '<header class="site-header">' + brand + '</header>'
    content = "\n      ".join(links)
    attrs = ' aria-label="' + escape(label or "Main navigation", quote=True) + '"'
    nav = '<nav class="site-nav"' + attrs + '>\n      ' + content + '\n    </nav>'
    menu = ('<details class="site-head-menu"><summary>'
            '<span class="site-menu-label">Menu</span>'
            '<svg class="site-menu-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
            '<path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" '
            'stroke-width="2" stroke-linecap="round"/></svg>'
            '</summary><nav class="site-menu-links" aria-label="Site menu">\n      '
            + content + '\n    </nav></details>')
    return ('<header class="site-header">' + brand
            + '<div class="site-head-actions">' + nav + menu + '</div></header>')

def is_brand_link(html):
    tag = html.split(">", 1)[0]
    return bool(re.search(r'\bclass\s*=\s*["\x27][^"\x27]*\bbrand\b', tag, re.I))

def extract_navigation(site_header):
    original_nav = nav_pattern.search(site_header)
    if original_nav is None:
        return [], "Main navigation"
    a = [m.group() for m in anchor.finditer(original_nav.group())]
    links = [link for link in a if not is_brand_link(link)]
    label = re.search(r'\baria-label\s*=\s*"([^"]+)"', original_nav.group().split(">", 1)[0], re.I)
    return links, (label.group(1) if label else "Main navigation")

excluded = {".git", "node_modules", "templates", ".venv", "venv"}
changed = 0
scanned = 0
for page in sorted(ROOT.rglob("*.html")):
    relative = page.relative_to(ROOT)
    if any(part in excluded for part in relative.parts):
        continue
    # Preserve the canonical homepage header, menu, social links and JS intact.
    if str(relative) in ("index.html", "faraz-site/index.html"):
        continue

    original = page.read_text(encoding="utf-8")
    main = main_pattern.search(original)
    body = body_pattern.search(original)
    if not main or not body or main.start() <= body.end():
        raise ValueError(f"Missing body/main in {relative}")
    before_main = original[:main.start()]
    outer_headers = [m for m in heading.finditer(before_main) if m.start() >= body.end()]
    if len(outer_headers) > 1:
        raise ValueError(f"Multiple top-level site headers in {relative}")
    if outer_headers:
        m = outer_headers[0]
        links, nav_label = extract_navigation(m.group())
        html = original[:m.start()] + build_header(links, nav_label) + original[m.end():]
    else:
        top_link = legacy_top.search(before_main)
        if top_link:
            html = original[:top_link.start()] + build_header([], "") + original[top_link.end():]
        else:
            # Future pages get a valid homepage-style brand even when their
            # author forgot to include a site-wide header component.
            html = original[:main.start()] + build_header([], "") + "\n" + original[main.start():]

    html = old_css.sub("", html)
    if html.count("</head>") != 1:
        raise ValueError(f"Missing document head in {relative}")
    html = html.replace("</head>", css_tag + "\n</head>", 1)
    if len(heading.findall(html[:html.index("<main")])) != 1:
        raise ValueError(f"Cannot find one shared site header in {relative}")
    if original != html:
        page.write_text(html, encoding="utf-8")
        changed += 1
    scanned += 1

mirror = ROOT / "faraz-site/index.html"
if mirror.exists() and mirror.read_bytes() != (ROOT/"index.html").read_bytes():
    raise ValueError("The mirrored homepage must remain identical")
print(f"Synced homepage-style navigation across {scanned} published pages ({changed} updated).")

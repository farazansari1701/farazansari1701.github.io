"""Keep every page's site header visually consistent with the homepage.

The homepage owns the brand symbol and the canonical CSS design values.
Every page (including the homepage) loads the same generated header stylesheet
and the same menu controller, preserving page-specific top navigation links.
Run after blog generation, before minification.
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

# One canonical menu: copy the homepage's real full-screen overlay and button.
home_menu = re.search(r'<nav class="menu" id="menu"[\s\S]*?</nav>\s*</div>\s*</nav>', HOME)
home_button = re.search(r'<button class="tbtn" id="menu-btn"[\s\S]*?</button>', HOME)
if not home_menu or not home_button:
    raise ValueError("The homepage menu or toggle is missing")
menu_button = home_button.group()
menu_html = re.sub(r'href="#([A-Za-z][\w-]*)"', r'href="/#\1"', home_menu.group())
menu_html = menu_html.replace('id="menu" data-lenis-prevent', 'id="menu" aria-hidden="true" inert data-lenis-prevent', 1)
assert menu_html.count('id="menu"') == menu_html.count('id="menu-close"') == 1


def from_homepage(selector):
    expr = r'(?<![\w-])' + re.escape(selector) + r'\s*\{([^{}]+)\}'
    rule = re.search(expr, PORTFOLIO_CSS)
    if not rule:
        raise ValueError(f"Missing homepage CSS rule {selector}")
    # Homepage rules may omit a final semicolon. Concatenating declarations
    # without one produced "gap:22pxjustify-content" and cramped navigation.
    return rule.group(1).strip().rstrip(";") + ";"

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
background:#141414;border:0;border-bottom:1px solid #383838;box-shadow:none;
color:#F6F6F3;mix-blend-mode:normal;isolation:isolate;font-family:var(--font);
font-size:17px;line-height:1.55;
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
body>header.site-header .site-nav a:focus-visible{{{from_homepage(".blog-nav:hover")}}}
body>header.site-header .site-nav a[aria-current="page"]{{border-bottom-color:var(--cyan)}}
body>header.site-header a:focus-visible{{outline:2px solid var(--cyan);outline-offset:3px}}
/* The homepage uses an overlaying fixed header. A full-screen <nav id="menu">
   sits between the site header and <main> on secondary pages, so '+main'
   does not match. The general sibling selector deliberately includes it. */
body>header.site-header~main{{padding-top:0!important}}
/* The homepage deliberately has a hero behind the fixed header. Secondary
   blog and article pages instead need real, safe-area-aware flow clearance;
   leaving the offset at zero clipped the Blog eyebrow on iPhone Safari. */
body>header.site-header:not(.top)~main>.wrap{{
padding-top:calc(env(safe-area-inset-top,0px) + 92px)!important;
}}
/* Anchored sections must also clear the fixed header on notched phones. */
html{{scroll-padding-top:calc(env(safe-area-inset-top,0px) + 98px)}}
/* Breadcrumbs are given a modest local gap *after* the shared header
   clearance, not an independent hard-coded header offset. */
body>main>.wrap>.breadcrumbs{{
position:relative;padding-top:16px!important;
}}
/* Dark case-study heroes retain their own background behind the header.
   Place the breadcrumb and title below the fixed header. */
body>header.site-header~main>.hero:not(.sec){{
padding-top:calc(env(safe-area-inset-top,0px) + 122px)!important;
}}
/* Other pages (privacy and 404) have neither a hero nor a blog wrapper. */
body>header.site-header~main:not(:has(>.hero,>.wrap)){{
padding-top:calc(env(safe-area-inset-top,0px) + 90px)!important;
}}
@media(max-width:900px){{
 body>header.site-header{{gap:12px}}
 body>header.site-header .site-head-actions{{gap:12px;flex-shrink:0}}
 body>header.site-header .site-nav{{gap:16px;flex-shrink:0}}
 body>header.site-header .site-menu-label{{display:none}}
 body>header.site-header .site-menu-icon{{display:block}}
}}
@media(max-width:760px){{
 /* Keep Blog and CV accessible in the mobile header at 320px and above. */
 body>header.site-header{{gap:6px;padding-left:max(12px,env(safe-area-inset-left,0px));padding-right:max(12px,env(safe-area-inset-right,0px))}}
 /* On the Projects index the hero has a dark full-bleed background; move its
    contents, not the background, below the iPhone safe-area and fixed nav. */
 body>header.site-header:not(.top)~main>.hero.sec{{padding-top:calc(env(safe-area-inset-top,0px) + 112px)!important}}
 body>header.site-header .brand{{font-size:clamp(12px,3.5vw,15px);gap:6px;min-width:0;flex:0 1 auto}}
 body>header.site-header .brand span{{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
 body>header.site-header .brand svg{{width:18px;height:18px;flex-basis:18px}}
 body>header.site-header .site-nav{{display:flex;gap:clamp(6px,2vw,10px);flex-shrink:0}}
 body>header.site-header .site-nav a{{display:none;font-size:clamp(12px,3.4vw,13px);padding-inline:0}}
 body>header.site-header .site-nav a[href="/blog/"]{{display:inline-flex}}
 body>header.site-header .site-nav a[href*="Faraz-Ansari-CV.pdf"]{{display:inline-flex}}
 body>header.site-header .site-head-actions{{gap:6px;flex-shrink:0}}
 body>header.site-header~main>.hero:not(.sec){{padding-top:calc(env(safe-area-inset-top,0px) + 104px)!important}}
 body>header.site-header~main:not(:has(>.hero,>.wrap)){{padding-top:calc(env(safe-area-inset-top,0px) + 94px)!important}}
 body>header.site-header .site-menu-links{{right:0;min-width:min(260px,calc(100vw - 40px));max-width:calc(100vw - 40px)}}
}}
@media(prefers-reduced-motion:reduce){{
 body>header.site-header .site-nav a,
 body>header.site-header .site-menu-links a{{transition:none}}
}}
'''

# The homepage menu is full-screen, scrollable and numbered, not a dropdown.
# Reuse the original homepage rules and theme colours across every page.
css += f'''
/* Copy the homepage Menu button's actual CSS declarations.
   Its 15px type comes from .top-actions, like the homepage, not a separate
   hard-coded button font. Focus remains visible for keyboard users. */
body>header.site-header #menu-btn.tbtn{{
{from_homepage(".tbtn")}
min-width:44px;min-height:44px;display:inline-flex;
align-items:center;justify-content:center;
margin:0;padding:6px 0;color:inherit;
font:inherit;font-weight:600;line-height:inherit;
appearance:none;-webkit-appearance:none;
border-radius:0;box-shadow:none;text-decoration:none;
white-space:nowrap;flex-shrink:0;
}}
body>header.site-header #menu-btn .menu-icon{{{from_homepage(".menu-icon")}flex:none}}
body>header.site-header #menu-btn .menu-label{{display:inline}}
body>header.site-header #menu-btn:focus-visible{{outline:2px solid var(--cyan);outline-offset:3px}}
body>nav#menu{{
--paper:#F6F6F3;--ink:#1A1A1A;--mute:#60605E;
--cyan:{token("cyan")};--magenta:{token("magenta")};
--gutter:{token("gutter")};--ease:{token("ease")};--font:{token("font")};
{from_homepage(".menu")}
box-sizing:border-box;width:100%;height:100vh;height:100svh;
margin:0;overflow:hidden;font-family:var(--font);font-size:17px;
line-height:1.55;-webkit-font-smoothing:antialiased;
}}
body>nav#menu.open{{{from_homepage(".menu.open")}}}
body>nav#menu ol{{{from_homepage(".menu ol")}}}
body>nav#menu li a{{{from_homepage(".menu li a")}color:inherit}}
body>nav#menu li a::before{{{from_homepage(".menu li a::before")}}}
body>nav#menu li a:hover,body>nav#menu li a:focus-visible{{
font-variation-settings:"wdth" 125;color:var(--cyan);
}}
body>nav#menu .menu-close{{
{from_homepage(".menu-close")}
display:inline-flex;align-items:center;justify-content:center;
min-height:44px;padding:8px 12px;color:inherit;font:600 15px/1.2 var(--font);
z-index:2;
}}
body>nav#menu .menu-close:focus-visible{{outline:2px solid var(--cyan);outline-offset:4px}}
body>nav#menu .menu-scroll{{
min-height:0;flex:0 1 auto;margin-block:auto;overflow-y:auto;
overscroll-behavior:contain;touch-action:pan-y;scrollbar-width:thin;padding:4px 6px 8px 0;
}}
body>nav#menu .menu-scroll>ol,body>nav#menu .menu-scroll>.socials-menu{{flex-shrink:0}}
body>nav#menu li a{{overflow-wrap:anywhere;min-height:44px}}
body>nav#menu .socials{{display:flex;align-items:center;gap:0}}
body>nav#menu .socials a{{
display:grid;place-items:center;width:48px;height:48px;color:inherit;opacity:.9;
transition:transform .25s var(--ease),opacity .2s;
border:1px solid color-mix(in srgb,currentColor 35%,transparent);
border-radius:50%;margin-right:10px;text-decoration:none;
}}
body>nav#menu .socials svg{{width:21px;height:21px;display:block;max-width:100%}}
body>nav#menu .socials-menu{{margin-top:clamp(22px,4vh,40px)}}
body>nav#menu .socials a:hover,body>nav#menu .socials a:focus-visible{{
color:var(--cyan);border-color:var(--cyan);opacity:1;transform:translateY(-2px);
}}
body>nav#menu .socials a:focus-visible{{outline:2px solid var(--cyan);outline-offset:4px}}
html.menu-open,html.menu-open body{{overflow:hidden}}
@media(prefers-color-scheme:dark){{
 :root:not([data-theme="light"]) body>nav#menu{{--paper:#141414;--ink:#EDEDE9;--mute:#B7B7B0}}
}}
:root[data-theme="dark"] body>nav#menu{{--paper:#141414;--ink:#EDEDE9;--mute:#B7B7B0}}
@media(max-width:900px){{
 body>header.site-header #menu-btn .menu-label{{{from_homepage(".top .menu-label")}}}
 body>header.site-header #menu-btn .menu-icon{{{from_homepage(".top .menu-icon")}}}
}}
@media(max-width:760px){{
 body>nav#menu{{padding-top:calc(env(safe-area-inset-top,0px) + 70px);padding-bottom:24px}}
 body>nav#menu li a{{font-size:clamp(30px,8vw,56px)}}
}}
@media(prefers-reduced-motion:reduce){{
 body>nav#menu,body>nav#menu li a,body>nav#menu .socials a{{transition:none}}
}}
'''

css_path = ROOT / "assets/shared-header.css"
css_path.write_text(css, encoding="utf-8")
css_version = sha256(css.encode("utf-8")).hexdigest()[:12]
css_tag = '<link rel="stylesheet" href="/assets/shared-header.css?v=' + css_version + '">'
old_css = re.compile(r'<link\b(?=[^>]*\bhref="/assets/shared-header(?:\.min)?\.css(?:\?[^"]*)?")[^>]*>\s*', re.I)

brand = '<a class="brand" href="/">' + brand_icon + '<span>Faraz Ansari</span></a>'
heading = re.compile(r'<header\b[^>]*>[\s\S]*?</header>', re.I)
anchor = re.compile(r'<a\b[^>]*>[\s\S]*?</a>', re.I)
nav_pattern = re.compile(r'<nav\b[^>]*>[\s\S]*?</nav>', re.I)
legacy_top = re.compile(r'<a\b[^>]*\bclass="top"[^>]*>[\s\S]*?</a>', re.I)
body_pattern = re.compile(r'<body\b[^>]*>', re.I)
main_pattern = re.compile(r'<main\b', re.I)

old_menu = re.compile(r'<nav class="menu" id="menu"[\s\S]*?</nav>\s*</div>\s*</nav>', re.I)
menu_js = (ROOT / "assets/site-menu.js").read_text(encoding="utf-8")
menu_js_version = sha256(menu_js.encode("utf-8")).hexdigest()[:12]
js_tag = '<script src="/assets/site-menu.js?v=' + menu_js_version + '" defer></script>'
old_js = re.compile(r'<script\b(?=[^>]*\bsrc="/assets/site-menu(?:\.min)?\.js(?:\?[^"]*)?")[^>]*>\s*</script>\s*', re.I)


def build_header(links, label):
    # A direct Blog link is part of the site-wide header on every page.
    # Keep existing labels/navigation otherwise; rebuilds must be idempotent.
    if not any('href="/blog/"' in link for link in links):
        links = [*links, '<a href="/blog/">Blog</a>']
    if links:
        content = "\n      ".join(links)
        attrs = ' aria-label="' + escape(label or "Main navigation", quote=True) + '"'
        nav = '<nav class="site-nav"' + attrs + '>\n      ' + content + '\n    </nav>'
    else:
        nav = ""
    # Keep the local top-nav links and use the homepage's Menu toggle.
    return ('<header class="site-header">' + brand
            + '<div class="site-head-actions">' + nav + menu_button
            + '</div></header>')

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

excluded = {".git", "node_modules", "templates", "blogs", ".venv", "venv"}
changed = 0
scanned = 0
for page in sorted(ROOT.rglob("*.html")):
    relative = page.relative_to(ROOT)
    if any(part in excluded for part in relative.parts):
        continue
    # Preserve homepage-specific content; the shared CSS/JS are attached below.
    if str(relative) == "index.html":
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

    # Reserve actual in-flow clearance on blog pages with breadcrumbs.
    # CSS-only selectors have proved fragile across cached page-theme styles:
    # an inline rule stays with the generated HTML and moves both breadcrumb
    # and the content below it, while preserving the fixed homepage header.
    has_breadcrumbs = '<div class="breadcrumbs"' in html
    if has_breadcrumbs:
        wrap = re.compile(r'(<main\b[^>]*>\s*<div class="wrap")(?:\s+style="[^"]*")?(\s*>)', re.I)
        # Remove the legacy inline !important offset. The generated shared
        # stylesheet now owns a single safe-area-aware offset for every wrap.
        html, wrap_count = wrap.subn(
            lambda m: m.group(1) + m.group(2),
            html, count=1
        )
        if wrap_count != 1:
            raise ValueError(f"Cannot place breadcrumb clearance in {relative}")
        crumb = re.compile(r'<div class="breadcrumbs"(?:\s+style="[^"]*")?\s*>', re.I)
        html, crumb_count = crumb.subn(
            '<div class="breadcrumbs" style="padding-top:16px!important">',
            html, count=1
        )
        if crumb_count != 1:
            raise ValueError(f"Cannot normalise breadcrumb spacing in {relative}")

    # Case-study breadcrumbs sit inside a dark hero, not a blog wrapper.
    # Keep the hero's background behind the overlaying header instead of
    # creating an empty strip with padding on MAIN itself.
    if '<nav class="crumb"' in html:
        hero = re.compile(r'(<main\b[^>]*>\s*<section class="hero"[^>]*?)\s*(>)', re.I)
        def normalise_hero(m):
            # Legacy hard-coded hero padding could sit behind iOS safe areas.
            # The shared CSS keeps its dark background behind the header and
            # places its breadcrumb below the fixed navigation instead.
            opening = re.sub(r'\s+style="padding-top:[^"]*!important"', '', m.group(1))
            return opening + m.group(2)
        html, count = hero.subn(normalise_hero, html, count=1)
        if count != 1:
            raise ValueError(f"Cannot place case-study header clearance in {relative}")

    # Replace any prior shared overlay instead of duplicating it on rebuild.
    html, removed_menus = old_menu.subn("", html)
    if removed_menus > 1:
        raise ValueError(f"Duplicate menu overlays in {relative}")
    site_header = re.search(r'<header class="site-header">[\s\S]*?</header>', html)
    if not site_header or site_header.start() > html.index("<main"):
        raise ValueError(f"Canonical site header is missing: {relative}")
    html = html[:site_header.end()] + "\n" + menu_html + html[site_header.end():]
    if html.count('id="menu"') != 1 or html.count('id="menu-btn"') != 1:
        raise ValueError(f"Duplicate menu identifiers in {relative}")
    html = old_js.sub("", html)
    if html.count("</body>") != 1:
        raise ValueError(f"Missing body close in {relative}")
    html = html.replace("</body>", js_tag + "\n</body>", 1)
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

# The homepage uses exactly the same generated stylesheet and accessible menu
# controller as secondary pages. Remove earlier minified/unminified references
# first, then inject one fresh copy of each into stable document positions.
home_path = ROOT / "index.html"
home_before = home_path.read_text(encoding="utf-8")
if '<header class="top site-header">' not in home_before:
    raise ValueError("Homepage header must use the site-header design system")
if '<button class="logo brand" id="logo"' not in home_before:
    raise ValueError("Homepage logo must share canonical brand classes")
if '<nav class="header-links site-nav"' not in home_before:
    raise ValueError("Homepage navigation must share canonical classes")
if home_before.count("</head>") != 1 or home_before.count("</body>") != 1:
    raise ValueError("Homepage document structure is invalid")
home_after = old_css.sub("", home_before)
home_after = old_js.sub("", home_after)
home_after = home_after.replace("</head>", css_tag + "\n</head>", 1)
home_after = home_after.replace("</body>", js_tag + "\n</body>", 1)
if home_after.count("/assets/shared-header.css?v=") != 1:
    raise ValueError("Homepage must load one shared header stylesheet")
if home_after.count("/assets/site-menu.js?v=") != 1:
    raise ValueError("Homepage must load one shared menu controller")
if home_after != home_before:
    home_path.write_text(home_after, encoding="utf-8")
    changed += 1

print(f"Synced common header styling and menu on {scanned + 1} published pages ({changed} updated).")

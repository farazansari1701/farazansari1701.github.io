"""Synchronise the homepage's exact footer across every published HTML page.

Run after blog generation and asset minification. Existing pages and new project,
blog, privacy, and other pages all receive the same source markup and footer CSS.
The homepage remains the canonical owner; the two homepage copies must agree.
"""
from hashlib import sha256
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
HOME = ROOT / "index.html"
source_home = HOME.read_text(encoding="utf-8")
footer_pattern = re.compile(r"<footer\b[^>]*>[\s\S]*?</footer>", re.I)
home_footers = footer_pattern.findall(source_home)
if len(home_footers) != 1:
    raise ValueError("The homepage must contain exactly one canonical footer.")
footer = home_footers[0]
if '<svg class="skyline sky3"' not in footer or 'id="cookie-reset"' not in footer or 'id="to-top"' not in footer:
    raise ValueError("Homepage footer is missing required artwork or controls.")

# Canonical templates are real HTML (not client-side fetches) so pages remain
# readable and accessible even if JavaScript or external libraries are blocked.
for relative in ("templates/site-footer.html", "templates/blog-footer.html"):
    (ROOT / relative).write_text(footer + "\n", encoding="utf-8")

# This is generated from the same homepage CSS as the blog's shared footer.
# Keep appearance independent of page-specific themes and competing styles.
home_footer_css = (ROOT / "blog/assets/footer.css").read_text(encoding="utf-8")
if ".foot" not in home_footer_css or ".sky3" not in home_footer_css:
    raise ValueError("The generated homepage footer stylesheet is incomplete.")

site_css = (
    '@font-face{font-family:Archivo;font-style:normal;font-weight:100 900;'
    'font-stretch:62% 125%;font-display:swap;'
    'src:url(/assets/fonts/archivo-roman-latin.woff2?v=f18b05b319a8) format("woff2")}\n'
    + home_footer_css
    + """
/* Isolate the homepage footer from each page's own layout and theme CSS. */
#footer{
  --paper:#F6F6F3;--ink:#1A1A1A;
  --cyan:#00AEEF;--magenta:#EC008C;--yellow:#FFE500;
  --gutter:clamp(20px,5vw,72px);
  --ease:cubic-bezier(.2,.7,.1,1);
  --font:"Archivo","Helvetica Neue",Helvetica,Arial,sans-serif;
  --bg:var(--ink);--fg:var(--paper);
  margin:0!important;padding:0 var(--gutter) calc(env(safe-area-inset-bottom,0px) + 28px)!important;
  position:relative!important;display:flex!important;flex-direction:column!important;
  min-height:100svh!important;overflow:hidden!important;
  background:var(--bg)!important;color:var(--fg)!important;
  font-family:var(--font)!important;font-size:17px;line-height:1.55;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
}
@media(prefers-color-scheme:dark){
  :root:not([data-theme="light"]) #footer{--paper:#141414;--ink:#EDEDE9}
}
:root[data-theme="dark"] #footer{--paper:#141414;--ink:#EDEDE9}
#footer *,#footer *::before,#footer *::after{box-sizing:border-box}
#footer a{color:inherit}
#footer button{font:inherit;color:inherit}
#footer img,#footer svg{max-width:100%}
#footer>.pano{margin-bottom:auto}
#footer .pano .sky3{max-width:none;width:max(100%,1800px);display:block}
@media(prefers-reduced-motion:reduce){
  #footer .sk-kite{animation:none}
  #footer .socials a{transition:none}
}
"""
)
css_path = ROOT / "assets/site-footer.css"
css_path.write_text(site_css, encoding="utf-8")
css_version = sha256(site_css.encode("utf-8")).hexdigest()[:12]

# The blog already owns the footer's animation, wordmark fitting and controls.
# Ship that exact logic on standalone pages too; do not load it twice on blogs.
site_js = (ROOT / "blog/assets/footer.js").read_text(encoding="utf-8")
(ROOT / "assets/site-footer.js").write_text(site_js, encoding="utf-8")
js_version = sha256(site_js.encode("utf-8")).hexdigest()[:12]

css_tag = '<link rel="stylesheet" href="/assets/site-footer.css?v=' + css_version + '">'
js_tag = '<script src="/assets/site-footer.js?v=' + js_version + '" defer></script>'
old_css = re.compile(r'<link\b(?=[^>]*\bhref="/assets/site-footer\.css(?:\?[^"]*)?")[^>]*>\s*', re.I)
old_js = re.compile(r'<script\b(?=[^>]*\bsrc="/assets/site-footer\.js(?:\?[^"]*)?")[^>]*>\s*</script>\s*', re.I)
excluded = {".git", "node_modules", "templates", ".venv", "venv"}
updated = 0
scanned = 0
for page in sorted(ROOT.rglob("*.html")):
    relative = page.relative_to(ROOT)
    if any(part in excluded for part in relative.parts):
        continue
    scanned += 1
    initial = page.read_text(encoding="utf-8")
    matches = list(footer_pattern.finditer(initial))
    if len(matches) == 1:
        m = matches[0]
        html = initial[:m.start()] + footer + initial[m.end():]
    elif not matches and "</body>" in initial:
        html = initial.replace("</body>", footer + "\n</body>", 1)
    else:
        raise ValueError(f"Cannot reliably synchronise footer: {relative}")

    html = old_css.sub("", html)
    html = old_js.sub("", html)
    if html.count("</head>") != 1 or html.count("</body>") != 1:
        raise ValueError(f"Malformed head or body in {relative}")
    html = html.replace("</head>", css_tag + "\n</head>", 1)

    # The original homepage manages its own footer. On blog pages the existing
    # footer.min.js owns the interactions. Other pages use the same source JS.
    is_home = str(relative) in ("index.html", "faraz-site/index.html")
    is_blog = relative.parts[0] == "blog"
    if not is_home and not is_blog:
        html = html.replace("</body>", js_tag + "\n</body>", 1)

    if len(footer_pattern.findall(html)) != 1 or footer_pattern.search(html).group() != footer:
        raise ValueError(f"Footer differs from the homepage in {relative}")
    if initial != html:
        page.write_text(html, encoding="utf-8")
        updated += 1

mirror = ROOT / "faraz-site/index.html"
if mirror.exists() and mirror.read_bytes() != HOME.read_bytes():
    raise ValueError("The mirrored homepage must remain identical to index.html.")
print(f"Synced canonical homepage footer on {scanned} HTML pages ({updated} updated).")

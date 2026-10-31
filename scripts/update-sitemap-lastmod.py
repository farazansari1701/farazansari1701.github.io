"""Refresh XML sitemap lastmod dates from actual page changes.

Run after rendering/minification, not before: newly generated or modified HTML
gets today's date in Europe/London; unchanged HTML uses its latest Git commit.
This leaves dates of untouched pages alone when new articles are published.
"""
from datetime import datetime
from pathlib import Path
import subprocess
from urllib.parse import urlsplit
from xml.etree import ElementTree as ET
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
SITEMAP = ROOT / "sitemap.xml"
SITE = "farazansari1701.com"
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
LONDON = ZoneInfo("Europe/London")
TODAY = datetime.now(LONDON).date().isoformat()

ET.register_namespace("", NS)


def git(*args: str) -> bytes:
    """Return Git output or empty bytes when repository metadata is unavailable."""
    try:
        return subprocess.check_output(
            ("git", *args), cwd=ROOT, stderr=subprocess.DEVNULL
        )
    except (OSError, subprocess.CalledProcessError):
        return b""


# Include staged/unstaged modifications and new generated pages. In GitHub
# Actions the checkout uses fetch-depth: 0, so path history is available.
dirty = {
    p.decode("utf-8", errors="surrogateescape")
    for p in git("ls-files", "-m", "-o", "--exclude-standard", "-z").split(b"\0")
    if p
}


def last_changed_date(relative: str) -> str | None:
    if relative in dirty:
        return TODAY
    commit_date = git("log", "-1", "--format=%cI", "--", relative).decode().strip()
    if not commit_date:
        return None
    return datetime.fromisoformat(commit_date).astimezone(LONDON).date().isoformat()


tree = ET.parse(SITEMAP)
updated = 0
checked = 0
for url in tree.getroot().findall(f"{{{NS}}}url"):
    loc = url.find(f"{{{NS}}}loc")
    if loc is None or not loc.text:
        continue
    parsed = urlsplit(loc.text)
    if parsed.scheme != "https" or parsed.netloc != SITE or not parsed.path.endswith("/"):
        continue
    relative = parsed.path.lstrip("/") + "index.html"
    if not (ROOT / relative).is_file():
        raise FileNotFoundError(f"Sitemap points to missing page: {relative}")
    checked += 1
    changed = last_changed_date(relative)
    lastmod = url.find(f"{{{NS}}}lastmod")
    if lastmod is None:
        if not changed:
            raise ValueError(f"Cannot determine lastmod for {relative}")
        lastmod = ET.SubElement(url, f"{{{NS}}}lastmod")
        lastmod.text = changed
        updated += 1
    elif changed and (not lastmod.text or changed > lastmod.text):
        lastmod.text = changed
        updated += 1
    if not lastmod.text:
        raise ValueError(f"Missing lastmod for {relative}")

if updated:
    tree.write(SITEMAP, encoding="utf-8", xml_declaration=True)
print(f"Sitemap lastmod: verified {checked} pages, updated {updated}")

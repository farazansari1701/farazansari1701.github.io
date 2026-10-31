"""Update sitemap dates only for substantive page content changes.

Shared header/footer scripts, asset hashes, consent bootstrap and site chrome
must not make all URLs look freshly edited. Use persisted semantic fingerprints
and the existing lastmod for baseline; never retroactively invent dates.
"""
from datetime import datetime
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree as ET
from zoneinfo import ZoneInfo
import hashlib, json, re

ROOT=Path(__file__).resolve().parents[1]
SITEMAP=ROOT/'sitemap.xml'
STATE=ROOT/'scripts/sitemap-content-fingerprints.json'
NS='http://www.sitemaps.org/schemas/sitemap/0.9'
ET.register_namespace('',NS)
today=datetime.now(ZoneInfo('Europe/London')).date().isoformat()

def meaningful(page):
    source=page.read_text(encoding='utf-8')
    # Only content within main is relevant to search engines. Exclude global
    # scripts, the common footer, and asset version query parameters.
    main=re.search(r'<main\b[^>]*>([\s\S]*?)</main>',source,re.I)
    body=main.group(1) if main else source
    body=re.sub(r'<!--[\s\S]*?-->','',body)
    body=re.sub(r'<(?:script|style|svg)\b[^>]*>[\s\S]*?</(?:script|style|svg)>','',body,flags=re.I)
    body=re.sub(r'\?v=[a-zA-Z0-9]+','',body)
    body=re.sub(r'\s+(?:loading|decoding|fetchpriority)="[^"]*"','',body)
    body=re.sub(r'\s+',' ',body).strip()
    return hashlib.sha256(body.encode('utf-8')).hexdigest()

old={}
if STATE.exists():
    old=json.loads(STATE.read_text(encoding='utf-8'))
tree=ET.parse(SITEMAP)
state={}
updated=0
total=0
for item in tree.getroot().findall(f'{{{NS}}}url'):
    node=item.find(f'{{{NS}}}loc')
    if node is None or not node.text: continue
    url=urlsplit(node.text)
    if url.netloc!='farazansari1701.com' or not url.path.endswith('/'): continue
    relative=url.path.lstrip('/')+'index.html'
    target=ROOT/relative
    if not target.is_file(): raise FileNotFoundError(relative)
    total+=1
    fingerprint=meaningful(target)
    state[relative]=fingerprint
    existing=item.find(f'{{{NS}}}lastmod')
    if existing is None:
        existing=ET.SubElement(item,f'{{{NS}}}lastmod')
        existing.text=today
        updated+=1
    elif relative in old and old[relative]!=fingerprint and (not existing.text or existing.text<today):
        existing.text=today
        updated+=1
    elif not existing.text:
        existing.text=today
        updated+=1
# Preserve existing dates for all pages on first run; thereafter only content changes.
if updated: tree.write(SITEMAP,encoding='utf-8',xml_declaration=True)
if state!=old: STATE.write_text(json.dumps(state,indent=2,sort_keys=True)+'\n',encoding='utf-8')
print(f'Sitemap semantic lastmod: verified {total}, updated {updated}, fingerprints {len(state)}')

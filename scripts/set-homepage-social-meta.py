"""Set approved homepage social card metadata on both mirrored homepages."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
IMAGE="https://farazansari1701.com/assets/faraz-home-social-2026.jpg"
OLD="https://farazansari1701.com/blog/assets/marketing-journey-social.jpg"
ALT="Faraz Ansari personal website cover illustrating his journey from Varanasi and Mussoorie through Cambridge to London, alongside digital marketing, AI and storytelling."
for rel in ("index.html","faraz-site/index.html"):
    path=ROOT/rel
    text=path.read_text(encoding="utf-8")
    if OLD in text:
        text=text.replace(OLD,IMAGE)
    assert 'property="og:image" content="'+IMAGE+'"' in text, rel+" image missing"
    text=text.replace('content="Digital marketing journey linking website, email and CRM"','content="'+ALT+'"')
    assert 'property="og:image:alt" content="'+ALT+'"' in text
    tw='<meta name="twitter:image" content="'+IMAGE+'">'
    assert tw in text
    if 'name="twitter:image:alt"' not in text:
        text=text.replace(tw,tw+'<meta name="twitter:image:alt" content="'+ALT+'">')
    path.write_text(text,encoding="utf-8")
print("Homepage Open Graph and Twitter image metadata updated.")

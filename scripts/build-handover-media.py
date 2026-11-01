"""Source-original marketing handover illustration; no private campaign data."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "blog" / "assets"
POST = ROOT / "blog" / "content" / "marketing-sales-handover-acceptance.json"
FONT_CHOICES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
]

def font(n):
    for path in FONT_CHOICES:
        if Path(path).is_file():
            return ImageFont.truetype(path, max(10, round(n)))
    return ImageFont.load_default()

def scene(width, height):
    sx, sy = width/1600, height/900
    sc = min(sx, sy)
    pt = lambda x, y: (round(x*sx), round(y*sy))
    rect = lambda x, y, w, h: (*pt(x,y),*pt(x+w,y+h))
    img = Image.new("RGB", (width,height), "#f7f4ed")
    d = ImageDraw.Draw(img)
    ink, cyan, magenta, yellow = "#252a31", "#18a9c3", "#da347d", "#f5c83f"
    d.ellipse(rect(-100,170,540,540), fill="#dbeef0")
    d.ellipse(rect(1300,-150,500,490), fill="#fff0bd")
    d.ellipse(rect(1350,570,390,390), fill="#f7dbe6")
    d.text(pt(83,83), "FARAZ ANSARI / MARKETING OPERATIONS", font=font(24*sc), fill=ink)
    cards = [
        (55,"01 / QUALIFY", "Why now?", "Fit and intent",cyan),
        (445,"02 / ASSIGN", "Who owns it?", "Named next action",yellow),
        (835,"03 / ACCEPT", "Picked up?", "Acknowledged",magenta),
        (1225,"04 / LEARN", "What next?", "Outcome and return",cyan),
    ]
    for x,label,big,small,accent in cards:
        d.rounded_rectangle(rect(x,245,322,388), radius=round(24*sc), fill="#ffffff",outline="#d9d6d1",width=max(1,round(3*sc)))
        d.rounded_rectangle(rect(x+25,275,273,10),radius=round(5*sc), fill=accent)
        d.text(pt(x+24,320), label, font=font(20*sc),fill=ink)
        d.text(pt(x+24,422),big,font=font(27*sc),fill=ink)
        d.text(pt(x+24,498),small,font=font(19*sc),fill="#525862")
    for x in (381,771,1161):
        d.line([pt(x,434),pt(x+52,434)],fill=ink,width=max(2,round(5*sc)))
        d.polygon([pt(x+62,434),pt(x+48,423),pt(x+48,445)],fill=ink)
    d.text(pt(84,760),"A HANDOVER IS A DECISION, NOT A FIELD CHANGE.",font=font(34*sc),fill=ink)
    return img

def main():
    meta=json.loads(POST.read_text())
    assert meta["heroPrefix"] == "marketing-sales-handover"
    ASSETS.mkdir(parents=True,exist_ok=True)
    prefix=meta["heroPrefix"]
    files=[ASSETS/(prefix+"-1600.jpg"), ASSETS/(prefix+"-social.jpg")]
    files.extend(ASSETS/(prefix+"-"+str(w)+".webp") for w in (640,1200,1600))
    if all(p.is_file() for p in files):
        print("Handover artwork already complete")
        return
    if any(p.exists() for p in files):
        raise RuntimeError("Incomplete handover asset set: refusing to overwrite")
    hero=scene(1600,900)
    hero.save(files[0],format="JPEG",quality=85,optimize=True)
    scene(1200,630).save(files[1],format="JPEG",quality=85,optimize=True)
    for w in (640,1200,1600):
        hero.resize((w,round(w*900/1600)),Image.Resampling.LANCZOS).save(
            ASSETS/(prefix+"-"+str(w)+".webp"),format="WEBP",quality=83,method=5)
    print("Built five original marketing handover images")

if __name__ == "__main__":
    main()

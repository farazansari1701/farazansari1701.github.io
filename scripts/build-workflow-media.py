"""Generate source-original diagram assets for the 26 October workflow article."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT / "blog" / "assets"
POST=ROOT / "blog" / "content" / "hubspot-workflow-eligibility-suppression-rules.json"
FONT_PATHS=[
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    "/Library/Fonts/Arial.ttf",
]

def f(size):
    for path in FONT_PATHS:
        if Path(path).exists():
            return ImageFont.truetype(path, max(10, round(size)))
    return ImageFont.load_default()

def artwork(width, height):
    sx, sy=width/1600, height/900
    sc=min(sx, sy)
    xy=lambda x,y:(round(x*sx), round(y*sy))
    box=lambda a,b,c,d:(*xy(a,b),*xy(c,d))
    ink="#252a31"; paper="#f7f4ed"; white="#fffefd"
    cyan="#18a9c3"; magenta="#da347d"; yellow="#f5c83f"
    img=Image.new("RGB",(width,height),paper)
    d=ImageDraw.Draw(img)
    d.ellipse(box(104,174,550,675),fill="#d7edf0")
    d.ellipse(box(1270,111,1575,416),fill="#ffe9a0")
    d.ellipse(box(1250,611,1710,1030),fill="#f5e5ee")
    d.text(xy(99,92),"FARAZ ANSARI  /  MARKETING AUTOMATION",font=f(26*sc),fill=ink)
    cards=[
        (65,250,490,639,"01 / TRIGGER","New enquiry","A defined entry event",cyan),
        (575,194,1055,687,"02 / ELIGIBILITY","Right audience","Correct journey",yellow),
        (1140,250,1555,639,"03 / NEXT ACTION","Send or assign","Or leave the workflow",cyan),
    ]
    for x1,y1,x2,y2,label,big,small,accent in cards:
        d.rounded_rectangle(box(x1,y1,x2,y2),radius=round(26*sc),fill=white,outline="#d5d3cb",width=max(1,round(3*sc)))
        d.rounded_rectangle(box(x1+27,y1+34,x2-27,y1+43),radius=round(4*sc),fill=accent)
        d.text(xy(x1+32,y1+72),label,font=f(24*sc),fill=ink)
        d.text(xy(x1+32,y1+139),big,font=f(38*sc),fill=ink)
        d.text(xy(x1+32,y1+212),small,font=f(21*sc),fill="#535862")
    d.rounded_rectangle(box(621,523,1009,623),radius=round(18*sc),fill="#fae2eb",outline=magenta,width=max(1,round(3*sc)))
    d.text(xy(642,541),"SUPPRESSION GATE",font=f(23*sc),fill=magenta)
    d.text(xy(642,575),"Exclude / exit when needed",font=f(18*sc),fill=ink)
    for x1,y1,x2,y2 in [(493,436,566,436),(1057,436,1131,436)]:
        d.line([xy(x1,y1),xy(x2,y2)],fill=cyan,width=max(4,round(9*sc)))
        d.polygon([xy(x2,y2),xy(x2-22,y2-13),xy(x2-22,y2+13)],fill=cyan)
    d.text(xy(104,773),"Automate decisions, not assumptions.",font=f(42*sc),fill=ink)
    return img

def main():
    data=json.loads(POST.read_text())
    assert data["heroPrefix"]=="workflow-eligibility"
    ASSETS.mkdir(parents=True,exist_ok=True)
    prefix=data["heroPrefix"]
    files=[
        ASSETS/(prefix+"-1600.jpg"),
        ASSETS/(prefix+"-social.jpg"),
        *(ASSETS/(prefix+"-"+str(w)+".webp") for w in (640,1200,1600)),
    ]
    existing=[p.exists() for p in files]
    if all(existing):
        print("Workflow artwork present")
        return
    if any(existing):
        raise RuntimeError("Partial workflow media found: refusing inconsistent rewrite")
    hero=artwork(1600,900)
    hero.save(files[0],format="JPEG",quality=85,optimize=True)
    artwork(1200,630).save(files[1],format="JPEG",quality=85,optimize=True)
    for width in (640,1200,1600):
        hero.resize((width,round(width*900/1600)),Image.Resampling.LANCZOS).save(
            ASSETS/(prefix+"-"+str(width)+".webp"),format="WEBP",quality=83,method=5
        )
    print("Built five original workflow diagram assets")

if __name__=="__main__":
    main()

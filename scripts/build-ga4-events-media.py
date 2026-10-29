"""Create original, non-campaign editorial artwork for the GA4 measurement audit."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"blog"/"assets"
META=ROOT/"blog"/"content"/"ga4-key-events-enquiry-measurement-audit.json"
FONTS=["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf","/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf","/Library/Fonts/Arial.ttf"]

def font(size):
    for path in FONTS:
        if Path(path).exists():
            return ImageFont.truetype(path,max(10,round(size)))
    return ImageFont.load_default()

def artwork(width,height):
    sx,sy=width/1600,height/900
    scale=min(sx,sy)
    p=lambda x,y:(round(x*sx),round(y*sy))
    rect=lambda x,y,w,h:(*p(x,y),*p(x+w,y+h))
    ink="#252a31";cyan="#18a9c3";magenta="#da347d";yellow="#f5c83f"
    im=Image.new("RGB",(width,height),"#f7f4ed")
    d=ImageDraw.Draw(im)
    d.ellipse(rect(100,150,530,570),fill="#d7eef0")
    d.ellipse(rect(1200,300,490,490),fill="#fae9a9")
    d.text(p(100,103),"FARAZ ANSARI  /  MEASUREMENT DESIGN",font=font(26*scale),fill=ink)
    cards=[
        (67,245,467,585,"01  PAGE VIEW","Recorded","Not a lead",cyan),
        (600,245,1000,585,"02  CONTACT INTENT","Clicked","Not confirmed",yellow),
        (1133,245,1533,585,"03  ENQUIRY","Confirmed","Verified success",magenta)
    ]
    for x1,y1,x2,y2,label,main,sub,accent in cards:
        d.rounded_rectangle((*p(x1,y1),*p(x2,y2)),radius=round(26*scale),fill="#fffefd",outline="#d6d3cc",width=max(1,round(3*scale)))
        d.rounded_rectangle(rect(x1+31,y1+32,x2-x1-62,12),radius=round(5*scale),fill=accent)
        d.text(p(x1+30,y1+79),label,font=font(23*scale),fill=ink)
        d.text(p(x1+30,y1+161),main,font=font(39*scale),fill=ink)
        d.text(p(x1+30,y1+233),sub,font=font(24*scale),fill="#61656b")
    for left,right in [(474,583),(1006,1116)]:
        d.line([p(left,405),p(right,405)],fill=cyan,width=max(4,round(9*scale)))
        d.polygon([p(right,405),p(right-23,391),p(right-23,419)],fill=cyan)
    d.text(p(106,722),"ACTIVITY IS NOT THE SAME AS OUTCOME.",font=font(40*scale),fill=ink)
    return im

def main():
    meta=json.loads(META.read_text())
    assert meta["heroPrefix"]=="ga4-enquiry-evidence"
    ASSETS.mkdir(parents=True,exist_ok=True)
    prefix=meta["heroPrefix"]
    files=[ASSETS/(prefix+"-1600.jpg"),ASSETS/(prefix+"-social.jpg")]
    files += [ASSETS/(prefix+"-"+str(w)+".webp") for w in (640,1200,1600)]
    flags=[file.exists() for file in files]
    if all(flags):
        print("Original GA4 artwork already present")
        return
    if any(flags):
        raise RuntimeError("Incomplete original GA4 image set")
    hero=artwork(1600,900)
    hero.save(files[0],format="JPEG",quality=85,optimize=True)
    artwork(1200,630).save(files[1],format="JPEG",quality=85,optimize=True)
    for w in (640,1200,1600):
        hero.resize((w,round(w*900/1600)),Image.Resampling.LANCZOS).save(ASSETS/(prefix+"-"+str(w)+".webp"),format="WEBP",quality=84,method=5)
    print("Five original GA4 measurement assets built")

if __name__=="__main__":
    main()

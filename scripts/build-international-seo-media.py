"""Create original public-safe international SEO route infographic for blog."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"blog"/"assets"
META=ROOT/"blog"/"content"/"multilingual-seo-hreflang-canonical-b2b.json"
FONTS=["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf","/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf","/Library/Fonts/Arial.ttf"]
def font(s):
    for p in FONTS:
        if Path(p).exists():return ImageFont.truetype(p,max(11,int(s)))
    return ImageFont.load_default()
def create(w,h):
    sx=w/1600;sy=h/900;scale=min(sx,sy)
    P=lambda x,y:(int(x*sx),int(y*sy))
    base=Image.new("RGB",(w,h),"#f7f4ed")
    d=ImageDraw.Draw(base)
    ink="#252a31";cyan="#18a9c3";pink="#da347d";yellow="#f5c83f"
    d.ellipse((*P(-170,30),*P(510,710)),fill="#daeff2")
    d.ellipse((*P(1180,60),*P(1810,720)),fill="#fcebc9")
    d.text(P(88,92),"FARAZ ANSARI / INTERNATIONAL SEO",fill=ink,font=font(22*scale))
    d.text(P(88,160),"LANGUAGE PAGES. CLEAR SIGNALS.",fill=ink,font=font(46*scale))
    cards=[(100,"ENGLISH","/en/",cyan),(595,"FRANCAIS","/fr/",pink),(1090,"DEUTSCH","/de/",yellow)]
    for x,lang,url,c in cards:
        d.rounded_rectangle((*P(x,290),*P(x+402,622)),radius=int(22*scale),fill="white",outline="#d8d6cf",width=max(2,int(3*scale)))
        d.rounded_rectangle((*P(x+30,320),*P(x+372,333)),radius=int(5*scale),fill=c)
        d.text(P(x+31,370),lang,fill=ink,font=font(31*scale))
        d.text(P(x+31,435),url,fill=ink,font=font(49*scale))
        d.text(P(x+31,544),"USEFUL LOCAL PAGE",fill=ink,font=font(17*scale))
    d.line([P(504,466),P(588,466)],fill=ink,width=max(2,int(5*scale)))
    d.line([P(999,466),P(1084,466)],fill=ink,width=max(2,int(5*scale)))
    d.rounded_rectangle((*P(470,683),*P(1126,765)),radius=int(18*scale),fill=ink)
    d.text(P(492,704),"HREFLANG ALTERNATES + CANONICAL CLARITY",fill="white",font=font(24*scale))
    d.text(P(95,820),"Illustrative only - not a client campaign or measured result",fill=ink,font=font(20*scale))
    return base
def main():
    meta=json.loads(META.read_text())
    assert meta["heroPrefix"]=="hreflang-language-routes"
    ASSETS.mkdir(parents=True,exist_ok=True)
    prefix=meta["heroPrefix"]
    outputs=[ASSETS/(prefix+"-1600.jpg"),ASSETS/(prefix+"-social.jpg")]
    outputs.extend(ASSETS/(prefix+"-"+str(w)+".webp") for w in (640,1200,1600))
    existing=[p.exists() for p in outputs]
    if all(existing):
        print("International SEO art already complete");return
    if any(existing):raise RuntimeError("Partial international SEO asset set")
    img=create(1600,900)
    img.save(outputs[0],"JPEG",quality=86,optimize=True)
    create(1200,630).save(outputs[1],"JPEG",quality=86,optimize=True)
    for width in (640,1200,1600):
        img.resize((width,int(width*900/1600)),Image.Resampling.LANCZOS).save(ASSETS/(prefix+"-"+str(width)+".webp"),"WEBP",quality=84,method=5)
    print("Created five original international SEO assets")
if __name__=="__main__":main()

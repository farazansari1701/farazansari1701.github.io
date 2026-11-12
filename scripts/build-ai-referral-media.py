"""Generate original conceptual two-lens AI referral measurement illustration."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"blog"/"assets"
META=ROOT/"blog"/"content"/"ga4-ai-assistant-referrals-search-console.json"
FONTS=["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf","/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf","/Library/Fonts/Arial.ttf"]

def font(size):
    for candidate in FONTS:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate,max(10,round(size)))
    return ImageFont.load_default()

def draw_art(width,height):
    sx,sy=width/1600,height/900
    scale=min(sx,sy)
    xy=lambda a,b:(round(a*sx),round(b*sy))
    image=Image.new("RGB",(width,height),"#f7f4ed")
    d=ImageDraw.Draw(image)
    ink="#252a31";cyan="#18a9c3";magenta="#da347d";yellow="#f5c83f"
    d.ellipse((*xy(-140,50),*xy(550,730)),fill="#dcedf0")
    d.ellipse((*xy(1160,50),*xy(1780,660)),fill="#f9eec2")
    d.text(xy(92,80),"FARAZ ANSARI  /  MARKETING MEASUREMENT",font=font(24*scale),fill=ink)
    d.text(xy(92,150),"AI DISCOVERY NEEDS TWO LENSES",font=font(44*scale),fill=ink)
    cards=[(92,cyan,"01 / GA4","AI ASSISTANT",["Session referrals","Visitor arrivals"]), (837,magenta,"02 / SEARCH CONSOLE","GOOGLE AI SEARCH",["Feature impressions","Search visibility"])]
    for x,accent,kicker,title,lines in cards:
        d.rounded_rectangle((*xy(x,275),*xy(x+660,647)),radius=round(25*scale),fill="#fff",outline="#dad6cf",width=max(1,round(3*scale)))
        d.rounded_rectangle((*xy(x+31,304),*xy(x+629,316)),radius=round(6*scale),fill=accent)
        d.text(xy(x+35,347),kicker,font=font(24*scale),fill=ink)
        d.text(xy(x+35,400),title,font=font(36*scale),fill=ink)
        for i,line in enumerate(lines):
            d.text(xy(x+35,488+54*i),line,font=font(29*scale),fill=ink)
    d.rounded_rectangle((*xy(572,669),*xy(1023,763)),radius=round(16*scale),fill=ink)
    d.text(xy(609,693),"OUTCOMES NEED PROOF",font=font(27*scale),fill=yellow)
    d.line([xy(800,647),xy(800,668)],fill=ink,width=max(2,round(4*scale)))
    d.text(xy(96,815),"Separate sources. Separate units. No invented totals.",font=font(24*scale),fill=ink)
    return image

def main():
    metadata=json.loads(META.read_text())
    assert metadata["heroPrefix"]=="ai-referrals-two-lenses"
    ASSETS.mkdir(exist_ok=True,parents=True)
    prefix=metadata["heroPrefix"]
    outputs=[ASSETS/(prefix+"-1600.jpg"),ASSETS/(prefix+"-social.jpg")]
    outputs.extend(ASSETS/(prefix+"-"+str(width)+".webp") for width in (640,1200,1600))
    exists=[p.exists() for p in outputs]
    if all(exists):
        print("Original two-lens artwork already available")
        return
    if any(exists):
        raise RuntimeError("Partial two-lens artwork set")
    main_img=draw_art(1600,900)
    main_img.save(outputs[0],format="JPEG",quality=86,optimize=True)
    draw_art(1200,630).save(outputs[1],format="JPEG",quality=86,optimize=True)
    for width in (640,1200,1600):
        main_img.resize((width,round(width*900/1600)),Image.Resampling.LANCZOS).save(ASSETS/(prefix+"-"+str(width)+".webp"),format="WEBP",quality=84,method=5)
    print("Generated five original two-lens illustrations")

if __name__=="__main__":
    main()

"""Generate an original answer-first writing editorial illustration for the blog."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"blog"/"assets"
META=ROOT/"blog"/"content"/"answer-first-marketing-article-writing.json"
FONTS=["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf","/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf","/Library/Fonts/Arial.ttf"]

def get_font(size):
    for path in FONTS:
        if Path(path).exists():
            return ImageFont.truetype(path,max(10,round(size)))
    return ImageFont.load_default()

def artwork(width,height):
    sx,sy=width/1600,height/900
    scale=min(sx,sy)
    p=lambda x,y:(round(x*sx),round(y*sy))
    img=Image.new("RGB",(width,height),"#f7f4ed")
    draw=ImageDraw.Draw(img)
    ink="#252a31";cyan="#18a9c3";magenta="#da347d";yellow="#f5c83f"
    draw.ellipse((*p(110,110),*p(660,665)),fill="#d8edf0")
    draw.ellipse((*p(1060,130),*p(1510,740)),fill="#faedb8")
    draw.text(p(95,85),"FARAZ ANSARI  /  CONTENT STRATEGY",font=get_font(25*scale),fill=ink)
    cards=[
      (85,"01 / QUESTION",["What needs","deciding?"],cyan),
      (450,"02 / ANSWER",["Lead with","the decision"],yellow),
      (815,"03 / EVIDENCE",["Show why","and when"],magenta),
      (1180,"04 / NEXT",["Make action","clear"],cyan)
    ]
    for x,label,lines,accent in cards:
        draw.rounded_rectangle((*p(x,255),*p(x+325,620)),radius=round(24*scale),fill="#ffffff",outline="#d7d4ce",width=max(1,round(3*scale)))
        draw.rounded_rectangle((*p(x+25,282),*p(x+300,294)),radius=round(5*scale),fill=accent)
        draw.text(p(x+25,327),label,font=get_font(20*scale),fill=ink)
        for idx,line in enumerate(lines):
            draw.text(p(x+25,410+idx*57),line,font=get_font(30*scale),fill=ink)
    for x in (420,785,1150):
        draw.line([p(x,436),p(x+20,436)],fill=ink,width=max(2,round(5*scale)))
        draw.polygon([p(x+26,436),p(x+15,425),p(x+15,447)],fill=ink)
    draw.text(p(96,723),"CLARITY BEFORE OPTIMISATION.",font=get_font(45*scale),fill=ink)
    return img

def main():
    metadata=json.loads(META.read_text())
    assert metadata["heroPrefix"]=="answer-first-content-path"
    ASSETS.mkdir(parents=True,exist_ok=True)
    prefix=metadata["heroPrefix"]
    files=[ASSETS/(prefix+"-1600.jpg"),ASSETS/(prefix+"-social.jpg")]
    files.extend(ASSETS/(prefix+"-"+str(w)+".webp") for w in (640,1200,1600))
    existing=[file.exists() for file in files]
    if all(existing):
        print("Answer-first editorial artwork already exists")
        return
    if any(existing):
        raise RuntimeError("Partial answer-first image asset set")
    img=artwork(1600,900)
    img.save(files[0],format="JPEG",quality=86,optimize=True)
    artwork(1200,630).save(files[1],format="JPEG",quality=86,optimize=True)
    for width in (640,1200,1600):
        img.resize((width,round(width*900/1600)),Image.Resampling.LANCZOS).save(ASSETS/(prefix+"-"+str(width)+".webp"),format="WEBP",quality=84,method=5)
    print("Generated five original answer-first content illustrations")

if __name__=="__main__":
    main()

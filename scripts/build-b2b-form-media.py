"""Generate original editorial art for the B2B form design guide; no external assets."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "blog" / "assets"
PREFIX = "b2b-form-purpose"
INK, IVORY, CYAN, MAGENTA, YELLOW = "#252a31", "#f7f4ed", "#18a9c3", "#da347d", "#f5c83f"
def art(w, h):
    sx, sy = w / 1600, h / 900
    pt = lambda x,y: (round(x*sx),round(y*sy))
    rect = lambda a,b,c,d: (*pt(a,b),*pt(c,d))
    im=Image.new("RGB",(w,h),IVORY)
    d=ImageDraw.Draw(im)
    d.ellipse(rect(90,135,560,625),fill="#d8edf0")
    d.ellipse(rect(1275,525,1630,870),fill=YELLOW)
    d.rounded_rectangle(rect(155,150,1080,785),radius=int(42*min(sx,sy)),fill="#fffefd",outline="#d3d3ce",width=max(2,int(4*sx)))
    d.rounded_rectangle(rect(210,208,1020,290),radius=12,fill=INK)
    for y, color in ((345,CYAN),(460,CYAN),(575,MAGENTA)):
        d.rounded_rectangle(rect(230,y,650,y+30),radius=10,fill="#dfe2e1")
        d.rounded_rectangle(rect(230,y+44,805,y+91),radius=12,fill="#f4f3ef",outline="#c3c8c8",width=3)
        d.ellipse(rect(840,y+40,895,y+95),fill=color)
        d.line([pt(851,y+66),pt(866,y+81),pt(886,y+51)],fill="#ffffff",width=max(3,int(7*sx)))
    d.rounded_rectangle(rect(355,705,875,756),radius=18,fill=CYAN)
    d.rounded_rectangle(rect(1140,285,1520,620),radius=35,fill=INK)
    for j,c in enumerate((CYAN,YELLOW,MAGENTA)):
        x=1200+j*92
        d.ellipse(rect(x,370,x+55,425),fill=c)
    d.line([pt(1200,520),pt(1440,520)],fill="#fffefd",width=max(2,int(9*sx)))
    d.line([pt(1200,562),pt(1370,562)],fill="#fffefd",width=max(2,int(9*sx)))
    return im
def main():
    OUT.mkdir(parents=True, exist_ok=True)
    files=[OUT/(PREFIX+"-1600.jpg"),OUT/(PREFIX+"-social.jpg")]+[OUT/(PREFIX+"-"+str(w)+".webp") for w in (640,1200,1600)]
    if all(f.is_file() for f in files):
        print("Form artwork complete");return
    if any(f.exists() for f in files):
        raise RuntimeError("Partial form artwork; inspect before rebuilding")
    hero=art(1600,900)
    hero.save(files[0],quality=86,optimize=True)
    art(1200,630).save(files[1],quality=86,optimize=True)
    for w in (640,1200,1600):
        hero.resize((w,round(w*900/1600)),Image.Resampling.LANCZOS).save(OUT/(PREFIX+"-"+str(w)+".webp"),"WEBP",quality=84,method=5)
if __name__=="__main__":main()

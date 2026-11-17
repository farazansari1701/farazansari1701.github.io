"""Produce distinct, text-free supporting illustrations for approved personal essays.

Illustrations draw only from public editorial topics. All outputs are deterministic,
responsive, and owned by the site build. They never depend on external images.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import hashlib
import json
import math
import random

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'blog' / 'assets'
CONFIG = ROOT / 'scripts' / 'personal-inline-art.json'
VERSION = 'personal-inline-v1-2026-11-17'
W, H = 1200, 675

def rgb(s):
    return tuple(int(s[i:i + 2], 16) for i in (1, 3, 5))

def blend(a, b, t):
    return tuple(round(a[i] * (1 - t) + b[i] * t) for i in range(3))

def arc(draw, bounds, start, end, color, width=4):
    draw.arc(tuple(int(v) for v in bounds), start=start, end=end, fill=color, width=width)

def line(draw, coordinates, color, width=3):
    draw.line(coordinates, fill=color, width=width, joint='curve')

def ellipse(draw, bounds, fill=None, outline=None, width=3):
    draw.ellipse(tuple(int(v) for v in bounds), fill=fill, outline=outline, width=width)

def palette(spec):
    return [rgb(c) for c in spec['palette']]

def backdrop(spec, seed):
    a, b, gold, mint = palette(spec)
    im = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(im)
    for y in range(H):
        t = (y / H)**0.91
        left = blend(a, b, t)
        warm = math.exp(-((y - 200) / 430)**2) * 0.13
        d.line([(0, y), (W, y)], fill=blend(left, gold, warm), width=1)
    light = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(light)
    ld.ellipse((470, -240, 1350, 640), fill=(*gold, 38))
    light = light.filter(ImageFilter.GaussianBlur(100))
    im = Image.alpha_composite(im.convert('RGBA'), light)
    d = ImageDraw.Draw(im, 'RGBA')
    rng = random.Random(seed)
    for i in range(90):
        x, y = rng.randrange(25, 1180), rng.randrange(28, 643)
        radius = rng.choice((1, 1, 2, 2, 3))
        d.ellipse((x-radius,y-radius,x+radius,y+radius), fill=(*mint,rng.randint(20,100)))
    for i in range(6):
        x = 140 + 167*i
        arc(d, (x-170, 130+i*11, x+255, 660-i*8), 192, 345, (*mint, 23), 2)
    return im, d

def draw_motif(im, d, motif, spec):
    a, b, gold, mint = palette(spec)
    G = (*gold, 218)
    M = (*mint, 196)
    soft = (*mint, 70)
    warm = (*gold, 70)
    if motif == 'awareness':
        for r in (260, 210, 161, 113):
            ellipse(d, (770-r, 290-r, 770+r, 290+r), outline=(*mint, 45 + (260-r)//3), width=5)
        ellipse(d,(686,212,852,378),outline=G,width=8)
        d.polygon([(700,410),(785,372),(868,413),(951,600),(622,600)],fill=(10,25,41,245))
        ellipse(d,(734,333,827,437),fill=(*gold,200))
        d.polygon([(720,420),(833,418),(890,588),(668,588)],fill=(9,22,38,240))
        line(d,[(469,587),(999,587)],(*gold,128),4)
        for t in range(8):
            x=308+t*95
            ellipse(d,(x,532-15*(t%3),x+5,537-15*(t%3)),fill=M)
    elif motif == 'release':
        d.rounded_rectangle((225,245,492,497),radius=18,fill=(*mint,32),outline=soft,width=5)
        d.rounded_rectangle((750,179,1010,430),radius=18,fill=(*gold,25),outline=warm,width=5)
        line(d,[(393,499),(493,565),(609,516),(733,570),(842,424)],M,6)
        for x,y in [(393,499),(493,565),(609,516),(733,570),(842,424)]:
            ellipse(d,(x-9,y-9,x+9,y+9),fill=G)
        d.arc((450,160,912,623),20,300,fill=(*mint,127),width=7)
        d.polygon([(530,420),(671,341),(662,478),(584,544)],fill=(*gold,50))
    elif motif == 'origin':
        d.polygon([(0,555),(390,500),(730,557),(1200,477),(1200,675),(0,675)],fill=(*mint,54))
        for r in (78,133,197,265):
            arc(d,(670-r,315-r,670+r,315+r),14+r/9,285,(*gold,235-r//2),max(3,int(r/29)))
        ellipse(d,(638,284,703,349),fill=G)
        line(d,[(681,382),(680,505),(651,537)],M,8)
        for x,y in [(646,432),(715,450),(643,477)]:
            ellipse(d,(x-24,y-13,x+24,y+13),fill=(*mint,153))
    elif motif == 'promise':
        ellipse(d,(268,222,652,608),outline=M,width=18)
        ellipse(d,(545,157,931,543),outline=G,width=18)
        for x in [338,450,562,674,786,898]:
            line(d,[(x,568),(x-24,629)],(*mint,60),3)
        ellipse(d,(514,373,671,501),fill=(*gold,55))
    elif motif == 'time':
        d.polygon([(390,120),(810,120),(620,325)],fill=(*mint,42))
        d.polygon([(390,570),(810,570),(620,345)],fill=(*gold,70))
        line(d,[(390,120),(810,120),(620,335),(810,570),(390,570),(620,335),(390,120)],M,10)
        for i in range(34):
            x=584+(i%9)*7
            y=355+i*5
            ellipse(d,(x,y,x+3,y+3),fill=G)
        ellipse(d,(570,287,670,388),outline=(*mint,75),width=5)
    elif motif == 'trust':
        for x,y,c in [(255,320,M),(727,310,G)]:
            d.rounded_rectangle((x,y,x+177,y+170),radius=25,fill=(*mint,35),outline=c,width=7)
            arc(d,(x+145,y+33,x+233,y+141),270,99,c,7)
            for j in range(3):
                arc(d,(x+38+j*17,y-87-j*11,x+95+j*17,y+37),200,333,(*gold,140-j*28),3)
        line(d,[(429,292),(512,267),(603,293),(724,290)],G,5)
        for x,y in [(429,292),(512,267),(603,293),(724,290)]:
            ellipse(d,(x-6,y-6,x+6,y+6),fill=M)
        line(d,[(160,498),(1010,498)],(*mint,90),5)
    elif motif == 'becoming':
        positions=[(223,507,365,572),(342,440,492,500),(463,361,618,428),(597,288,757,351),(751,203,914,271)]
        for i,(x1,y1,x2,y2) in enumerate(positions):
            d.polygon([(x1,y1),(x2,y1-19),(x2,y2),(x1,y2+17)],fill=(*mint,66+i*27))
            line(d,[(x1,y1),(x2,y1-19)],G,5)
        arc(d,(727,85,1088,444),200,350,M,14)
        d.line([(740,295),(740,533)],fill=soft,width=5)
        for i in range(7):
            ellipse(d,(919+i*24,189-i*8,926+i*24,196-i*8),fill=G)
    elif motif == 'balance':
        line(d,[(605,176),(605,553)],M,12)
        ellipse(d,(573,144,638,207),fill=G)
        line(d,[(326,288),(888,243)],G,12)
        for x,y,yy in [(398,282,447),(820,249,465)]:
            line(d,[(x,y),(x-74,yy)],M,4)
            line(d,[(x,y),(x+74,yy)],M,4)
            arc(d,(x-114,yy-29,x+114,yy+60),7,172,G,9)
        d.polygon([(533,564),(686,564),(738,594),(481,594)],fill=(*mint,184))
        ellipse(d,(334,397,472,455),fill=(*mint,139))
        for j in range(3):
            d.rounded_rectangle((750+j*9,402-j*19,870+j*7,420-j*19),radius=4,fill=(*gold,88+j*30))
    elif motif == 'language':
        for x,y,fill in [(235,180,(*mint,43)),(427,142,(*gold,31)),(608,199,(*mint,45))]:
            d.rounded_rectangle((x,y,x+332,y+337),radius=16,fill=fill,outline=M,width=4)
        for i in range(7):
            y=319+i*25
            arc(d,(270,y-30,1040,y+125),189,344,(*gold,130-i*8),3)
        line(d,[(535,170),(535,542)],(*gold,138),4)
    elif motif == 'choice':
        d.polygon([(555,410),(650,410),(1030,675),(762,675)],fill=(*gold,54))
        d.polygon([(552,410),(647,410),(414,675),(126,675)],fill=(*mint,66))
        line(d,[(602,408),(235,675)],M,7)
        line(d,[(602,408),(899,675)],G,7)
        ellipse(d,(575,331,635,393),fill=G)
        d.polygon([(572,396),(643,394),(668,525),(549,525)],fill=(15,27,45,235))
        line(d,[(575,512),(558,578)],M,12)
        line(d,[(635,512),(659,577)],M,12)
    elif motif == 'identity':
        d.rounded_rectangle((195,137,532,567),radius=16,fill=(*mint,38),outline=M,width=5)
        for i in range(7):
            d.rounded_rectangle((253,230+i*40,463,240+i*40),radius=5,fill=(*mint,61))
        d.rounded_rectangle((697,114,1012,576),radius=10,fill=(*gold,37),outline=G,width=9)
        d.polygon([(777,142),(958,142),(952,552),(777,552)],fill=(*gold,78))
        d.polygon([(780,141),(1011,101),(1011,570),(780,552)],fill=(*mint,47))
        ellipse(d,(846,276,895,325),fill=G)
        d.polygon([(828,329),(918,329),(956,494),(788,494)],fill=(*mint,158))
    elif motif == 'roots':
        line(d,[(598,485),(600,249)],G,11)
        for p in [[(599,255),(515,172),(417,125)],[(599,269),(698,166),(805,117)],[(594,346),(460,309)],[(605,345),(745,298)]]:
            line(d,p,M,8)
        for x,y in [(420,131),(494,170),(805,123),(722,291),(465,306)]:
            ellipse(d,(x-39,y-17,x+39,y+17),fill=(*mint,162))
        for x in (470,530,595,660,734):
            line(d,[(596,493),(x,575)],(*gold,149),5)
        d.polygon([(0,553),(300,474),(620,535),(900,474),(1200,555),(1200,675),(0,675)],fill=(*mint,43))
    elif motif == 'question':
        for i in range(5):
            x=240+i*175
            y=390+(i%2)*80
            d.rounded_rectangle((x,y,x+140,y+115),radius=9,fill=(*mint,25),outline=(*mint,69),width=3)
        arc(d,(433,101,847,501),209,352,G,16)
        ellipse(d,(599,538,643,580),fill=G)
        line(d,[(642,573),(668,602)],(*gold,88),5)
    else:
        raise ValueError('Unknown inline illustration motif: '+str(motif))
    d.rounded_rectangle((18,18,W-19,H-19),radius=12,outline=(*mint,80),width=2)
    return im.convert('RGB')

def produce(slug, spec):
    prefix = 'personal-inline-' + slug
    files = [ASSETS / (prefix + '-1200.jpg')]
    files += [ASSETS / (prefix + '-' + str(n) + '.webp') for n in (640,1200)]
    version = ASSETS / (prefix + '-visual-version.txt')
    signature = VERSION + ':' + hashlib.sha256(json.dumps(spec,sort_keys=True).encode()).hexdigest()[:12]
    if all(p.is_file() and p.stat().st_size > 0 for p in files) and version.exists() and version.read_text().strip() == signature:
        return False
    im, d = backdrop(spec, int(hashlib.sha256(slug.encode()).hexdigest()[:8],16))
    im = draw_motif(im, d, spec['motif'], spec)
    im.save(files[0], format='JPEG', quality=87, optimize=True, progressive=True)
    for n in (640, 1200):
        resize = im if n == 1200 else im.resize((n, round(n * H / W)), Image.Resampling.LANCZOS)
        resize.save(ASSETS / (prefix + '-' + str(n) + '.webp'), 'WEBP', quality=82, method=5)
    version.write_text(signature+'\n')
    return True

def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    config = json.loads(CONFIG.read_text())
    updated=[]
    for slug,spec in sorted(config.items()):
        meta=json.loads((ROOT/'blog'/'content'/(slug+'.json')).read_text())
        if meta['category'] != 'Personal perspectives' or not meta.get('approvedForPublication') or not meta.get('privacyChecked'):
            raise ValueError('Unapproved or non-personal content: '+slug)
        if len(spec['palette'])!=4 or len({spec['alt'],spec['caption']}) != 2:
            raise ValueError('Invalid media metadata: '+slug)
        if produce(slug,spec):
            updated.append(slug)
    print('Personal inline illustrations generated:',len(updated),'of',len(config),'configured essays')

if __name__ == '__main__':
    main()

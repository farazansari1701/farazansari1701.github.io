"""Context-led original editorial artwork for approved personal reflections.

Each illustration is a deliberately different visual interpretation of the
published essay. No private interview material or third-party identifiers are
used. Outputs keep the site's existing image paths and responsive formats.
Pillow >= 10 is the only dependency.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import hashlib
import json
import math
import random
import re

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'blog/assets'
ART_VERSION = 'contextual-v2-2026-10-31'

# Each motif maps to one already-published essay, not to private journal notes.
SCENES = {
    'what-someone-trusts-you-with': ('trust', '#111F2D', '#394C58', '#E6B587', '#A4CCC2'),
    'the-freedom-to-remain-unfinished': ('unfinished', '#142538', '#40545E', '#DAB38F', '#AECAC5'),
    'the-cost-of-having-a-conscience': ('conscience', '#172722', '#384B43', '#E7B67E', '#A2C1AC'),
    'who-owns-the-words-we-speak': ('words', '#19273B', '#394B62', '#E6B58C', '#87C1C5'),
    'someone-will-be-disappointed': ('choice', '#272335', '#593F4B', '#E5AA9C', '#CEB8AF'),
    'the-answer-that-isnt-on-my-cv': ('cv', '#132736', '#3E5361', '#E6B993', '#A6CCC3'),
    'the-life-im-building-doesnt-fit-a-simple-timeline-2026-10-25': ('timeline', '#162934', '#3C5358', '#E8B794', '#99C5B6'),
    'more-questions-than-answers-2026-10-24': ('questions', '#161D35', '#39415F', '#E2BE99', '#ABB8D8'),
}

FONT_BOLD = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSerif-Regular.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
]
FONT_SANS = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf',
]

def font(size, serif=False):
    for name in FONT_BOLD if serif else FONT_SANS:
        if Path(name).exists():
            return ImageFont.truetype(name, size)
    return ImageFont.load_default(size=size)

def rgb(x):
    return tuple(int(x[i:i+2], 16) for i in (1, 3, 5))

def mix(a, b, t):
    return tuple(round(a[i] * (1-t) + b[i] * t) for i in range(3))

def wash(img, upper, lower):
    d=ImageDraw.Draw(img)
    a=rgb(upper); b=rgb(lower)
    for y in range(900):
        t=(y/899)**0.88
        d.line((0,y,1599,y),fill=mix(a,b,t),width=1)
    # Darken the text-facing half while letting the scene remain luminous.
    overlay=Image.new('RGBA',(1600,900),(0,0,0,0))
    od=ImageDraw.Draw(overlay)
    for x in range(1020):
        alpha=round(92*(1-max(0,x-180)/840)**1.4)
        od.line((x,0,x,899),fill=(8,14,23,max(0,alpha)))
    img.alpha_composite(overlay)

def glow(img, x, y, radius, color, opacity=90):
    layer=Image.new('RGBA',(1600,900),(0,0,0,0))
    d=ImageDraw.Draw(layer)
    d.ellipse((x-radius,y-radius,x+radius,y+radius),fill=(*rgb(color),opacity))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(max(16, radius//2))))

def ln(d, points, color, width=2, joint='curve'):
    d.line(points,fill=color,width=width,joint=joint)

def dashed(d, xy, color, width=2, dash=16, space=13):
    x1,y1,x2,y2=xy
    total=math.dist((x1,y1),(x2,y2))
    if not total: return
    ux=(x2-x1)/total; uy=(y2-y1)/total
    cur=0
    while cur<total:
        nex=min(cur+dash,total)
        d.line((x1+cur*ux,y1+cur*uy,x1+nex*ux,y1+nex*uy),fill=color,width=width)
        cur=nex+space

def arc(d, box, start, end, color, width=3):
    d.arc(box, start=start, end=end, fill=color, width=width)

def shadow_ellipse(img,box,fill=(0,0,0,105),blur=20):
    lay=Image.new('RGBA',(1600,900),(0,0,0,0)); d=ImageDraw.Draw(lay)
    d.ellipse(box,fill=fill)
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(blur)))

def base_details(img,seed,accent,secondary):
    rng=random.Random(seed)
    dr=ImageDraw.Draw(img,'RGBA')
    for i in range(250):
        x=rng.randrange(32,1590); y=rng.randrange(28,875)
        if x<920 and rng.random()<0.77: continue
        v=rng.randint(8,25);rad=rng.choice((1,1,1,2))
        dr.ellipse((x-rad,y-rad,x+rad,y+rad),fill=(255,245,223,v))
    # Delicate print-like horizontal strokes, an editorial rather than clip-art feel.
    for y in (147,158,806,817):
        dr.line((980,y,1500,y),fill=(*rgb(secondary),22),width=1)
    dr.arc((900,-245,1865,890),45,150,fill=(*rgb(accent),26),width=2)
    dr.arc((1060,-55,1700,700),182,285,fill=(*rgb(secondary),34),width=2)

def draw_trust(img,d,a,s):
    glow(img,1268,427,312,a,86)
    shadow_ellipse(img,(925,695,1596,810),blur=22)
    d.line((880,725,1580,725),fill='#A9A79C',width=11)
    d.line((941,737,919,870),fill='#293340',width=23)
    d.line((1505,737,1520,870),fill='#293340',width=23)
    # Two cups facing each other: a private conversation without faces or details.
    d.rounded_rectangle((1014,598,1139,700),radius=18,fill='#CFAB89',outline='#F3D9B2',width=4)
    arc(d,(1120,608,1192,690),262,98,'#EAD5BF',9)
    d.rounded_rectangle((1350,594,1473,698),radius=18,fill='#A6C6BF',outline='#DDE8DF',width=4)
    arc(d,(1453,605,1534,691),262,99,'#DAEEE2',9)
    for x,y in ((1070,543),(1411,539)):
        for j in range(3):
            arc(d,(x-22+j*4,y-110-j*11,x+26+j*4,y+23-j*11),195,325,(*rgb(s),120-j*28),3)
    d.ellipse((1129,551,1364,569),outline='#F3D0AD',width=3)
    # A fragile shared thread joins the spaces above the table.
    for i in range(75):
        x=1154+i*2.4;y=477+18*math.sin(i/74*math.pi)
        d.ellipse((x-1,y-1,x+2,y+2),fill=(*rgb(a),160))
    d.line((995,578,1475,578),fill=(*rgb(a),64),width=2)
    d.ellipse((1230,498,1279,547),outline=(*rgb(s),140),width=3)

def draw_unfinished(img,d,a,s):
    glow(img,1340,312,290,a,72)
    d.arc((1140,120,1590,575),180,360,fill=(*rgb(s),160),width=11)
    d.line((1141,337,1141,764),fill=(*rgb(s),125),width=8)
    d.line((1588,335,1588,764),fill=(*rgb(s),125),width=8)
    # Steps ascend into an incomplete arch and an opening in the sky.
    steps=[(930,698,1060,761),(1038,628,1174,699),(1148,548,1295,630),(1266,454,1422,550)]
    for k,(x1,y1,x2,y2) in enumerate(steps):
        d.polygon([(x1,y1),(x2,y1-18),(x2,y2-22),(x1,y2)],fill=(*rgb(s),80+k*18))
        d.line((x1,y1,x2,y1-18),fill=(*rgb(a),210),width=6)
        d.line((x2,y1-18,x2,y2-22),fill=(*rgb(a),78),width=3)
    dashed(d,(1170,255,1535,106),(*rgb(a),130),width=3,dash=14)
    for x,y in ((1144,336),(1586,338),(1495,216)):
        d.ellipse((x-7,y-7,x+7,y+7),fill=a)
    d.arc((1130,120,1610,610),225,310,fill=(*rgb(a),230),width=8)
    d.line((1143,759,1557,759),fill=(*rgb(s),90),width=5)

def draw_conscience(img,d,a,s):
    glow(img,1265,385,330,a,65)
    d.line((1285,248,1285,679),fill=(*rgb(a),215),width=12)
    d.ellipse((1255,220,1315,280),fill=(*rgb(s),210),outline=a,width=5)
    d.line((1100,332,1470,315),fill=(*rgb(a),225),width=13)
    d.polygon([(1202,685),(1370,685),(1423,726),(1147,726)],fill=(*rgb(s),170))
    for x,ytop,ybot in ((1135,333,493),(1431,322,532)):
        d.line((x,ytop,x-41,ybot),fill=(*rgb(a),198),width=3)
        d.line((x,ytop,x+41,ybot),fill=(*rgb(a),198),width=3)
        arc(d,(x-92,ybot-16,x+92,ybot+52),5,175,(*rgb(a),215),6)
    # One pan carries a small green plant, the other a column of blank ledgers.
    d.line((1128,484,1124,433),fill=s,width=5)
    d.ellipse((1089,415,1128,449),fill=(*rgb(s),230))
    d.ellipse((1123,405,1155,438),fill=(*rgb(s),165))
    for i in range(3):
        d.rounded_rectangle((1378+i*9,461-i*22,1493+i*8,473-i*22),radius=2,fill=(*rgb(s),100+i*36))
    d.line((1176,606,1384,606),fill=(*rgb(a),95),width=3)
    for x in range(1187,1400,24):
        d.line((x,604,x+7,621),fill=(*rgb(s),110),width=2)

def draw_words(img,d,a,s):
    glow(img,1250,421,346,s,80)
    # Three translucent, overlapping sheets: languages traveling beyond borders.
    sheets=[((996,267,1260,689),(*rgb(a),46)),((1116,221,1402,668),(*rgb(s),56)),((1264,299,1547,727),(234,216,198,45))]
    for (x1,y1,x2,y2),c in sheets:
        d.rounded_rectangle((x1,y1,x2,y2),radius=12,fill=c,outline=(*rgb(a),135),width=3)
    rng=random.Random(887)
    for k in range(33):
        x=rng.randint(1050,1470);y=rng.randint(320,630)
        clen=rng.randint(26,88)
        d.arc((x,y,x+clen,y+rng.randint(25,65)),start=18,end=153,fill=(*rgb(s),rng.randint(94,180)),width=rng.choice((2,3,4)))
    # A dashed border does not interrupt the rivers of words.
    dashed(d,(1201,174,1201,744),(*rgb(a),140),width=3,dash=12,space=16)
    for yy in (374,454,555):
        pts=[(965,yy),(1080,yy-32),(1200,yy+14),(1330,yy-41),(1535,yy+3)]
        d.line(pts,fill=(*rgb(s),125),width=4,joint='curve')
    d.ellipse((1200,447,1220,467),fill=a)

def draw_choice(img,d,a,s):
    glow(img,1345,289,315,a,76)
    # A single figure at converging roads. No family or other person is depicted.
    d.polygon([(1203,708),(1060,899),(1370,899)],fill=(*rgb(a),65))
    d.polygon([(1220,703),(1500,900),(1599,900)],fill=(*rgb(s),95))
    d.polygon([(1177,703),(931,900),(855,900)],fill=(*rgb(a),70))
    for x1,y1,x2,y2 in ((1204,711,971,900),(1205,711,1538,900),(1204,711,1212,900)):
        dashed(d,(x1,y1,x2,y2),(*rgb(a),135),width=3,dash=22)
    d.ellipse((1188,569,1245,626),fill='#E8CABD')
    d.polygon([(1191,626),(1246,625),(1267,735),(1167,735)],fill='#192332')
    d.line((1194,667,1164,736),fill='#192332',width=17)
    d.line((1241,660,1270,735),fill='#192332',width=17)
    d.line((1197,723,1186,817),fill='#192332',width=19)
    d.line((1238,725,1256,817),fill='#192332',width=19)
    d.line((1184,818,1152,826),fill='#111820',width=14)
    d.line((1255,818,1282,826),fill='#111820',width=14)
    for box in ((961,438,1114,477),(1274,408,1460,449)):
        d.rounded_rectangle(box,radius=6,fill=(*rgb(a),130),outline=(*rgb(s),150),width=2)
    d.line((1199,527,1199,465),fill=(*rgb(s),145),width=7)
    d.line((1038,474,1385,474),fill=(*rgb(s),105),width=5)

def draw_cv(img,d,a,s):
    glow(img,1310,402,313,s,81)
    shadow_ellipse(img,(1020,730,1560,835),blur=22)
    # A plain application form on one side, an open illuminated door behind it.
    d.rounded_rectangle((1238,177,1578,757),radius=8,fill=(*rgb(s),45),outline=(*rgb(a),166),width=7)
    d.polygon([(1358,217),(1498,217),(1498,682),(1358,682)],fill=(*rgb(a),145))
    d.polygon([(1427,217),(1575,130),(1575,712),(1427,682)],fill=(*rgb(a),85))
    d.rounded_rectangle((967,243,1267,723),radius=12,fill='#DFD9C9',outline='#A9C6C2',width=6)
    d.ellipse((1003,278,1056,332),outline='#718785',width=5)
    for yy in (287,315,370,409,446,486,538,580,626):
        x1=1072 if yy<333 else 1007
        x2=1224 if yy<333 else 1229
        d.rounded_rectangle((x1,yy,x2,yy+9),radius=3,fill='#A6AEAA')
    for yy in (485,581):
        d.line((1006,yy-13,1228,yy-13),fill='#BCC2BB',width=2)
    d.line((1392,727,1590,799),fill=(*rgb(a),110),width=14)
    for yy in range(508,685,46):
        d.line((1468,yy,1519,yy),fill=(*rgb(s),110),width=3)

def draw_timeline(img,d,a,s):
    glow(img,1319,355,320,a,73)
    # Two landscapes and a winding, imperfect timeline between them.
    d.polygon([(941,585),(1030,511),(1126,585)],fill=(*rgb(s),58))
    d.polygon([(1342,581),(1470,472),(1575,585)],fill=(*rgb(a),65))
    d.line((950,680,1565,680),fill=(*rgb(s),145),width=5)
    d.arc((1046,455,1435,914),192,332,fill=(*rgb(a),235),width=10)
    d.arc((1100,386,1497,794),6,171,fill=(*rgb(a),195),width=9)
    for x,y in ((1090,635),(1262,493),(1456,624)):
        d.ellipse((x-9,y-9,x+9,y+9),fill=a,outline='#F5E6C8',width=3)
    # Roots and the sprouting of a life across cities.
    d.line((1280,574,1280,422),fill=(*rgb(s),240),width=8)
    d.ellipse((1219,407,1280,445),fill=(*rgb(s),210))
    d.ellipse((1277,377,1355,431),fill=(*rgb(s),180))
    for x in (1235,1280,1325):
        d.line((1281,575,x,645),fill=(*rgb(a),95),width=4)
    for x,y in ((963,541),(1493,538)):
        d.rounded_rectangle((x,y,x+80,y+100),radius=2,fill=(*rgb(a),90))
        d.line((x+12,y+22,x+68,y+22),fill=(*rgb(s),150),width=3)
        for k in range(3):d.line((x+14,y+43+k*17,x+54,y+43+k*17),fill=(*rgb(s),125),width=2)

def draw_questions(img,d,a,s):
    glow(img,1258,356,314,s,69)
    # Two facing pages open to a sky that still has more stars than answers.
    shadow_ellipse(img,(940,668,1577,803),blur=20)
    d.polygon([(967,640),(1193,597),(1240,664),(1240,793),(966,738)],fill=(*rgb(a),90))
    d.polygon([(1241,664),(1292,598),(1529,640),(1530,737),(1241,792)],fill=(*rgb(s),100))
    d.line((1241,665,1241,795),fill=(*rgb(a),200),width=6)
    for base,sgn in ((981,1),(1518,-1)):
        for j in range(5):
            y=662+j*15
            d.line((base,y,base+sgn*210,y+sgn*12),fill=(*rgb(a),65),width=2)
    # A constellation spells uncertainty without publishing any private words.
    dots=[(1044,360),(1131,297),(1240,347),(1355,267),(1495,333),(1434,462),(1277,484),(1158,423)]
    for i in range(len(dots)-1):
        d.line((*dots[i],*dots[i+1]),fill=(*rgb(s),115),width=3)
    for i,(x,y) in enumerate(dots):
        r=5 if i%2==0 else 8
        d.ellipse((x-r,y-r,x+r,y+r),fill=(*rgb(a),225))
    arc(d,(1191,340,1312,476),195,305,(*rgb(a),220),8)
    d.ellipse((1244,497,1266,519),fill=a)
    for x,y in ((1105,194),(1467,183),(1535,515)):
        d.line((x-12,y,x+12,y),fill=(*rgb(a),135),width=2)
        d.line((x,y-12,x,y+12),fill=(*rgb(a),135),width=2)

SCENE_FUNCS={
    'trust':draw_trust,'unfinished':draw_unfinished,'conscience':draw_conscience,
    'words':draw_words,'choice':draw_choice,'cv':draw_cv,
    'timeline':draw_timeline,'questions':draw_questions,
}

def wrap_words(d, text, f, max_width):
    lines=[]; current=''
    for word in text.split():
        nextline=(current+' '+word).strip()
        if current and d.textbbox((0,0),nextline,font=f)[2]>max_width:
            lines.append(current);current=word
        else:current=nextline
    if current:lines.append(current)
    return lines

def typeset(img, p, accent, secondary):
    d=ImageDraw.Draw(img,'RGBA')
    d.rounded_rectangle((94,99,577,145),radius=18,fill=(9,16,24,90),outline=(*rgb(secondary),92),width=2)
    d.text((118,109),'PERSONAL PERSPECTIVES   /   FARAZ ANSARI',font=font(20),fill='#E7E7DD',stroke_width=0)
    d.line((98,211,196,211),fill=(*rgb(accent),235),width=6)
    d.text((98,242),'REFLECTIONS',font=font(21),fill=secondary,stroke_width=0)
    title=p['title']
    # Text stays in left visual-safe area for narrow card crops.
    max_width=758;f=None;lines=None
    for pt in (75,71,67,63,59,55,51,47,43):
        ff=font(pt,serif=True)
        l=wrap_words(d,title,ff,max_width)
        if len(l)<=4 and all(d.textbbox((0,0),x,font=ff)[2]<=max_width for x in l):
            f,lines=ff,l;break
    if f is None:
        f=font(42,serif=True);lines=wrap_words(d,title,f,max_width)
    lh=int(f.size*1.22)
    y=308
    for line in lines:
        d.text((96,y),line,font=f,fill='#FAF5EB',stroke_width=0)
        y+=lh
    if y<676:
        d.line((99,y+31,270,y+31),fill=(*rgb(accent),180),width=3)
    d.text((96,800),p['publishedAt'][:10].replace('-','  /  '),font=font(23),fill='#E3DACF')
    d.text((96,845),'ESSAYS  /  LIFE  /  PEOPLE',font=font(16),fill=(*rgb(secondary),165))

def scene_for(p):
    if p['slug'] in SCENES:
        return SCENES[p['slug']]
    # For future approved posts, select an illustration from *public* article
    # metadata rather than blocking publication or reading private answers.
    description=' '.join(str(p.get(k,'')) for k in ('title','deck','description','heroAlt')).lower()
    guides=[
        ('trust',('friend','trust','vulnerab','care','listen')),
        ('unfinished',('change','growth','unfinished','becoming')),
        ('conscience',('ethic','conscience','principle','justice','moral')),
        ('words',('language','words','speech','identity','border')),
        ('choice',('choice','expectation','disappoint','freedom','family')),
        ('cv',('career','work','job','cv','ambition','application')),
        ('timeline',('home','belong','migration','timeline','journey','settled')),
        ('questions',('uncertainty','question','meaning','doubt','reflection')),
    ]
    candidates={row[0]:row for row in SCENES.values()}
    score=lambda tags:sum(description.count(t) for t in tags)
    motif=max(guides,key=lambda pair:score(pair[1]))[0]
    return candidates[motif]

def artwork(p):
    scene,up,down,a,s=scene_for(p)
    img=Image.new('RGBA',(1600,900),(0,0,0,255))
    wash(img,up,down)
    seed=int(hashlib.sha256(p['slug'].encode()).hexdigest()[:8],16)
    base_details(img,seed,a,s)
    d=ImageDraw.Draw(img,'RGBA')
    SCENE_FUNCS[scene](img,d,a,s)
    # Darken the left again after drawing scene, so the text is always legible.
    layer=Image.new('RGBA',(1600,900),(0,0,0,0));od=ImageDraw.Draw(layer)
    for x in range(905):
        strength=int(86*(1-(x/905)**1.7))
        od.line((x,0,x,900),fill=(5,11,19,strength))
    img.alpha_composite(layer)
    typeset(img,p,a,s)
    return img.convert('RGB')

def create_assets(p):
    prefix=p['heroPrefix'];slug=p['slug']
    assert re.fullmatch(r'personal-\d{4}-\d{2}-\d{2}(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?',prefix)
    assert prefix=='personal-'+p['entryDate'] or (p.get('editorialBasis')=='standalone-approved' and p.get('standaloneApproved') is True and prefix.startswith('personal-'+p['entryDate']+'-'))
    # Existing site paths remain unchanged, avoiding broken links and duplicate metadata.
    files=[ASSETS/(prefix+'-1600.jpg'),ASSETS/(prefix+'-social.jpg')]
    files.extend(ASSETS/(prefix+'-'+str(w)+'.webp') for w in (640,1200,1600))
    stamp=ASSETS/(prefix+'-visual-version.txt')
    if all(f.exists() for f in files) and stamp.exists() and stamp.read_text().strip()==ART_VERSION+':'+slug:
        return False
    base=artwork(p)
    base.save(files[0],'JPEG',quality=90,optimize=True,progressive=True)
    for width in (640,1200,1600):
        target=base if width==1600 else base.resize((width,round(width*900/1600)),Image.Resampling.LANCZOS)
        target.save(ASSETS/(prefix+'-'+str(width)+'.webp'),'WEBP',quality=85,method=6)
    social=base.resize((1200,675),Image.Resampling.LANCZOS).crop((0,22,1200,652))
    social.save(files[1],'JPEG',quality=89,optimize=True,progressive=True)
    stamp.write_text(ART_VERSION+':'+slug+'\n')
    return True

def main():
    ASSETS.mkdir(parents=True,exist_ok=True)
    changed=[]
    for source in sorted((ROOT/'blog/content').glob('*.json')):
        p=json.loads(source.read_text())
        if p.get('category')!='Personal perspectives':continue
        assert p.get('approvedForPublication') is True and p.get('privacyChecked') is True
        if p.get('heroDisabled'):continue
        if create_assets(p):changed.append(p['slug'])
    print('Contextual personal cover assets refreshed:', len(changed), ', '.join(changed))

if __name__=='__main__':main()
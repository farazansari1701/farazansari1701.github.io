"""Generate deterministic, original cover and social art for approved personal essays.
Never ingest private interview answers; use only public title and publication date.
Installed in CI: Pillow >=10.
"""
from pathlib import Path
from datetime import datetime
import hashlib, json, re
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'blog/assets'
FONT_CANDIDATES=[
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf',
    '/Library/Fonts/Arial Bold.ttf',
]
SMALL_FONT_CANDIDATES=[
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf',
    '/Library/Fonts/Arial.ttf',
]

def font(size, bold=True):
    for candidate in (FONT_CANDIDATES if bold else SMALL_FONT_CANDIDATES):
        if Path(candidate).exists():
            return ImageFont.truetype(candidate,size)
    return ImageFont.load_default(size=size)

def split_lines(draw,text,f,max_width):
    words=text.strip().split()
    lines=[];line=''
    for word in words:
        test=(line+' '+word).strip()
        if line and draw.textbbox((0,0),test,font=f)[2]>max_width:
            lines.append(line);line=word
        else:line=test
    if line:lines.append(line)
    return lines

def artwork(p,width,height):
    seed=int(hashlib.sha256(p['title'].encode('utf8')).hexdigest()[:8],16)
    palettes=[('#111a27','#f9f4e9','#e8ae83','#82c3b2'),('#202030','#fff2e0','#f5b771','#b5a7de'),('#132b31','#f8f1df','#ecb896','#9bcbd7')]
    bg,fg,accent,secondary=palettes[seed%len(palettes)]
    img=Image.new('RGB',(width,height),bg)
    d=ImageDraw.Draw(img)
    scale=width/1600
    def n(x):return round(x*scale)
    d.ellipse((n(1050),-n(160),n(1740),n(520)),fill=accent)
    d.ellipse((n(1220),n(120),n(1570),n(470)),fill=secondary)
    d.rounded_rectangle((n(1090),n(495),n(1540),n(760)),radius=n(44),outline=accent,width=max(2,n(5)))
    d.line((n(1130),n(535),n(1465),n(725)),fill=secondary,width=max(3,n(9)))
    d.line((n(1465),n(535),n(1130),n(725)),fill=accent,width=max(3,n(9)))
    d.text((n(100),n(100)), 'FARAZ ANSARI  /  PERSONAL PERSPECTIVES',font=font(n(24),False),fill=secondary)
    max_width=n(1000)
    chosen=None;lines=[]
    for size in [88,82,76,70,64,58,52]:
        f=font(n(size))
        candidate=split_lines(d,p['title'],f,max_width)
        if len(candidate)<=4:
            chosen=f;lines=candidate;break
    if chosen is None:
        chosen=font(n(48));lines=split_lines(d,p['title'],chosen,max_width)
    y=n(260)
    step=max(n(65),round(chosen.size*1.15)) if hasattr(chosen,'size') else n(70)
    for line in lines[:5]:
        d.text((n(100),y),line,font=chosen,fill=fg)
        y+=step
    d.rounded_rectangle((n(100),height-n(137),n(255),height-n(129)),radius=n(4),fill=accent)
    d.text((n(100),height-n(95)),p['publishedAt'][:10],font=font(n(27),False),fill=fg)
    return img

def create_assets(p):
    prefix=p['heroPrefix']
    assert re.fullmatch(r'personal-\d{4}-\d{2}-\d{2}(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?',prefix), 'Personal art prefix must include the London date and optional unique post suffix'
    assert prefix=='personal-'+p['entryDate'] or (p.get('editorialBasis')=='standalone-approved' and p.get('standaloneApproved') is True and prefix.startswith('personal-'+p['entryDate']+'-')), 'Personal art date must match journal entry; extra prefix requires standalone approval'
    files=[ASSETS/(prefix+'-1600.jpg'),ASSETS/(prefix+'-social.jpg')]
    files += [ASSETS/(prefix+'-'+str(w)+'.webp') for w in (640,1200,1600)]
    existing=[f.exists() for f in files]
    if all(existing):return
    if any(existing):raise RuntimeError('Partial personal-art assets: complete set required for '+prefix)
    img=artwork(p,1600,900)
    img.save(files[0],format='JPEG',quality=87,optimize=True)
    artwork(p,1200,630).save(files[1],format='JPEG',quality=87,optimize=True)
    for width in (640,1200,1600):
        scaled=img.resize((width,round(900*width/1600)),Image.Resampling.LANCZOS)
        scaled.save(ASSETS/(prefix+'-'+str(width)+'.webp'),format='WEBP',quality=84,method=5)

def main():
    ASSETS.mkdir(parents=True,exist_ok=True)
    created=0
    for source in sorted((ROOT/'blog/content').glob('*.json')):
        p=json.loads(source.read_text())
        if p.get('category')!='Personal perspectives':continue
        assert p.get('approvedForPublication') is True and p.get('privacyChecked') is True and (p.get('answerCount')==10 or (p.get('editorialBasis')=='standalone-approved' and p.get('standaloneApproved') is True and (p.get('answerCount')==0 or (p.get('answerCount')==20 and p.get('interviewDate')==p.get('entryDate'))))),'Not approved'
        create_assets(p)
        created+=1
    print('Personal artwork validated for',created,'approved posts')

if __name__=='__main__':main()

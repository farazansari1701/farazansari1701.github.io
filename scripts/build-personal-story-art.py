"""Distinct visual scenes for every approved personal essay; public material only."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import json, math, random
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'blog/assets'
SCENES={
'the-freedom-to-remain-unfinished':('unfinished','#f7eee3','#93b0b5','#e47f94'),
'the-cost-of-having-a-conscience':('conscience','#1e2638','#616374','#efbb74'),
'who-owns-the-words-we-speak':('words','#f4ece0','#91c7c9','#d84781'),
'someone-will-be-disappointed':('choices','#21314e','#bb8188','#f5c878'),
'the-answer-that-isnt-on-my-cv':('cv','#e8f0ed','#91b4bf','#de6b92'),
'the-life-im-building-doesnt-fit-a-simple-timeline-2026-10-25':('timeline','#f3e7d8','#8aafb9','#e6a36f'),
'more-questions-than-answers-2026-10-24':('questions','#1d3046','#5c8597','#f2c875')
}
def draw_scene(meta):
    scene,bg,mid,accent=SCENES[meta['slug']]
    im=Image.new('RGB',(1600,900),bg);d=ImageDraw.Draw(im)
    rng=random.Random(scene)
    for j in range(28):
        x=rng.randint(-200,1600);y=rng.randint(-100,900);r=rng.randint(18,220)
        d.ellipse((x-r,y-r,x+r,y+r),outline=mid,width=rng.randint(1,4))
    d.ellipse((1130,95,1490,455),fill=accent)
    if scene=='unfinished':
        d.polygon([(0,730),(360,630),(650,735),(920,570),(1600,750),(1600,900),(0,900)],fill=mid)
        for x,y in [(510,700),(660,640),(812,581),(970,523),(1120,465)]:
            d.line((x,y,x+145,y-55),fill='#f7f4ed',width=17)
        d.arc((220,265,520,570),20,325,fill=accent,width=21)
    elif scene=='conscience':
        for x in range(0,1650,115): d.rectangle((x,425+rng.randrange(180),x+85,900),fill='#303748')
        d.ellipse((600,280,1010,690),fill='#d29b59')
        for x in range(0,1600,100):d.ellipse((x,705,x+70,845),fill='#1d2433')
        d.rounded_rectangle((742,405,864,725),radius=25,fill='#fff0c4',outline='#3c3540',width=14)
    elif scene=='words':
        d.arc((-170,125,1820,870),3,175,fill=accent,width=34)
        for x,y in [(180,280),(615,520),(1080,250)]:
            d.rounded_rectangle((x,y,x+310,y+195),radius=16,fill='#fffbf3',outline='#536874',width=4)
            for k in range(5):d.line((x+34,y+45+k*26,x+257,y+40+k*26),fill=mid,width=3)
    elif scene=='choices':
        d.polygon([(0,600),(480,500),(740,660),(1600,540),(1600,900),(0,900)],fill=mid)
        d.line((790,890,790,620),fill='#fff0cb',width=84)
        d.line((790,620,340,425),fill='#fff0cb',width=72)
        d.line((790,620,1335,395),fill='#eeb7a4',width=72)
        d.ellipse((758,574,822,638),fill='#2f3448')
    elif scene=='cv':
        d.rounded_rectangle((270,170,810,800),radius=16,fill='#fffdf8',outline='#95a8ae',width=7)
        for k in range(11):d.rounded_rectangle((350,290+k*42,660+(k%3)*29,300+k*42),radius=5,fill=mid)
        d.arc((965,220,1485,770),-90,145,fill=accent,width=24)
        d.ellipse((1130,470,1250,590),fill='#3e5464')
    elif scene=='timeline':
        for i,(x,h) in enumerate([(660,270),(755,355),(880,220),(1010,395),(1160,300),(1330,420)]):
            d.rectangle((x,850-h,x+100,850),fill='#547784')
        d.line([(80,790),(370,650),(660,750),(900,620),(1210,745),(1510,560)],fill=accent,width=14)
        for x,y in [(80,790),(370,650),(660,750),(900,620),(1210,745),(1510,560)]:d.ellipse((x-15,y-15,x+15,y+15),fill='#ffebd4')
    elif scene=='questions':
        d.arc((620,100,995,490),-60,230,fill='#f4d49a',width=27)
        d.ellipse((802,525,825,549),fill='#f4d49a')
        d.polygon([(140,630),(600,580),(765,735),(315,780)],fill='#e2b5ac')
        for i in range(10):d.line((280,650+i*10,545,625+i*8),fill='#536b7c',width=3)
        d.ellipse((1210,300,1440,530),fill='#f4e0ba')
    d.rounded_rectangle((56,56,1544,844),radius=25,outline='#f9f6ef',width=4)
    return im
def main():
    OUT.mkdir(exist_ok=True,parents=True)
    for path in sorted((ROOT/'blog/content').glob('*.json')):
        meta=json.loads(path.read_text())
        if meta['slug'] not in SCENES:continue
        assert meta['approvedForPublication'] and meta['privacyChecked']
        prefix=meta['heroPrefix'];img=draw_scene(meta)
        img.save(OUT/(prefix+'-1600.jpg'),quality=86,optimize=True)
        img.crop((0,30,1600,870)).resize((1200,630),Image.Resampling.LANCZOS).save(OUT/(prefix+'-social.jpg'),quality=86,optimize=True)
        for w in [640,1200,1600]:
            img.resize((w,int(w*900/1600)),Image.Resampling.LANCZOS).save(OUT/(prefix+'-'+str(w)+'.webp'),format='WEBP',quality=83,method=5)
    print('Seven distinct public essay illustrations generated')
if __name__=='__main__':main()

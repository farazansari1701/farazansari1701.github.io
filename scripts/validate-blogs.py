"""Static release checks. Runtime interactions also need browser or DOM verification."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, urljoin, unquote
from xml.etree import ElementTree as ET
import json,re,sys

ROOT=Path(__file__).resolve().parents[1]
BASE='https://farazansari1701.com'
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__();self.tags=[];self.ids=set();self.json=[];self.in_json=False;self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs);self.tags.append((tag,a))
        if 'id' in a:
            assert a['id'] not in self.ids, 'Duplicate ID '+a['id']
            self.ids.add(a['id'])
        if tag=='script' and a.get('type')=='application/ld+json':self.in_json=True
    def handle_data(self,data):
        if self.in_json:self.json.append(json.loads(data))
    def handle_endtag(self,tag):
        if tag=='script':self.in_json=False

htmls=[ROOT/'index.html',*(ROOT/'blogs').rglob('*.html')]
pages={('/' if p.name=='index.html' and p.parent==ROOT else '/'+str(p.relative_to(ROOT).parent)+'/'):Page(p.read_text()) for p in htmls}
titles=[];results=[]
for p in htmls:
    text=p.read_text();path='/' if p.parent==ROOT else '/'+str(p.relative_to(ROOT).parent)+'/'
    parsed=pages[path]
    canonical=[a['href'] for tag,a in parsed.tags if tag=='link' and a.get('rel')=='canonical']
    assert canonical==[BASE+path],(path,canonical)
    assert len([x for x in parsed.tags if x[0]=='h1'])==1,path+' H1 count'
    assert len([x for x in parsed.tags if x[0]=='footer'])==1,path+' footer count'
    title=re.search('<title>(.*?)</title>',text,re.S).group(1);titles.append(title)
    assert len(title)<=65,(path,'Title too long',len(title))
    assert re.search('<meta name="description" content="[^"]+"',text)
    assert parsed.json,path+' structured data missing'
    assert not re.search(r'(?<!s)/blog(?:/|["\s<>])',text),path+' legacy blog URL'
    for tag,a in parsed.tags:
        if tag=='a' and a.get('href'):
            url=urlparse(urljoin(BASE+path,a['href']))
            if url.netloc=='farazansari1701.com' and url.path in pages and url.fragment:
                assert unquote(url.fragment) in pages[url.path].ids,(path,a['href'],'missing anchor')
        if tag=='img':assert 'alt' in a,(path,'missing alt')
    if path.startswith('/blogs/'):
        for asset in ['blog.min.js','footer.min.js','blog.min.css','footer.min.css']:
            assert text.count('/blogs/assets/'+asset+'?')==1,(path,asset,'asset duplicate/missing')
        assert 'data-footer-art=' in text and '<image href="/blogs/assets/portfolio-skyline.svg' in text,path+' static footer art missing'
    results.append({'path':path,'bytes':len(text.encode()),'title':title})
assert len(set(titles))==len(titles),'Duplicate titles'
assert titles[1:] or titles
assert re.search('<title>(.*?)</title>',(ROOT/'blogs/index.html').read_text()).group(1)=='Digital Marketing Insights - Practical reflections from my work'
posts=json.loads((ROOT/'blogs/posts.json').read_text())
assert len({p['url'] for p in posts})==len(posts)
for post in posts:
    assert post['url'] in pages,post['url']+' missing'
    incoming={path for path,page in pages.items() for tag,a in page.tags if tag=='a' and a.get('href')==post['url'] and path!=post['url']}
    assert incoming,post['url']+' orphan'
    assert 1000<=post['wordCount']<=1200,post['url']+' word count'
for name in ['sitemap.xml','blogs/feed.xml','blogs/assets/portfolio-skyline.svg']:ET.parse(ROOT/name)
assert (ROOT/'index.html').read_bytes()==(ROOT/'faraz-site/index.html').read_bytes(),'Homepage copies differ'
print(json.dumps({'status':'PASS','pages':results,'posts':len(posts)},indent=2))

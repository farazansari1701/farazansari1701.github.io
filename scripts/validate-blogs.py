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

htmls=[ROOT/'index.html',*(ROOT/'blog').rglob('*.html')]
pages={('/' if p.name=='index.html' and p.parent==ROOT else '/'+str(p.relative_to(ROOT).parent)+'/'):Page(p.read_text()) for p in htmls}
titles=[];results=[]
for p in htmls:
    text=p.read_text();path='/' if p.parent==ROOT else '/'+str(p.relative_to(ROOT).parent)+'/'
    parsed=pages[path]
    assert text.count('data-container="GTM-57BRSKXB"')==1,path+' GTM bootstrap duplicate/missing'
    assert text.index('/assets/analytics.min.js')<text.index('</head>'),path+' analytics must initialise in head'
    assert text.count('<!-- Google Tag Manager -->')==1,path+' standard GTM snippet missing/duplicate'
    assert text.count('googletagmanager.com/ns.html?id=GTM-57BRSKXB')==1,path+' noscript missing/duplicate'
    assert text.index("gtag('consent', 'default'")<text.index('<!-- Google Tag Manager -->')<text.index('</head>'),path+' consent/head order'
    assert re.search(r'<body[^>]*>\s*<!-- Google Tag Manager \(noscript\) -->',text),path+' noscript placement' 
    canonical=[a['href'] for tag,a in parsed.tags if tag=='link' and a.get('rel')=='canonical']
    assert canonical==[BASE+path],(path,canonical)
    assert len([x for x in parsed.tags if x[0]=='h1'])==1,path+' H1 count'
    assert len([x for x in parsed.tags if x[0]=='footer'])==1,path+' footer count'
    title=re.search('<title>(.*?)</title>',text,re.S).group(1);titles.append(title)
    assert len(title)<=65,(path,'Title too long',len(title))
    assert re.search('<meta name="description" content="[^"]+"',text)
    assert parsed.json,path+' structured data missing'
    assert not re.search(r'/blogs(?:/|["\s<>])',text),path+' legacy blog URL'
    for tag,a in parsed.tags:
        if tag=='a' and a.get('href'):
            url=urlparse(urljoin(BASE+path,a['href']))
            if url.netloc=='farazansari1701.com' and url.path in pages and url.fragment:
                assert unquote(url.fragment) in pages[url.path].ids,(path,a['href'],'missing anchor')
        if tag=='img':assert 'alt' in a,(path,'missing alt')
    if path.startswith('/blog/'):
        for asset in ['blog.min.js','footer.min.js','blog.min.css','footer.min.css']:
            assert text.count('/blog/assets/'+asset+'?')==1,(path,asset,'asset duplicate/missing')
        footer_svg=re.search(r'<svg class="skyline sky3"[\s\S]*?</svg>',text)
        portfolio_svg=re.search(r'<svg class="skyline sky3"[\s\S]*?</svg>',(ROOT/'index.html').read_text())
        assert footer_svg and portfolio_svg and footer_svg.group()==portfolio_svg.group(),path+' original portfolio footer artwork missing or changed'
    results.append({'path':path,'bytes':len(text.encode()),'title':title})
assert len(set(titles))==len(titles),'Duplicate titles'
assert titles[1:] or titles
assert re.search('<title>(.*?)</title>',(ROOT/'blog/index.html').read_text()).group(1)=='Marketing & Personal Perspectives | Faraz Ansari'
landing=(ROOT/'blog/index.html').read_text()
assert '<div class="hero-actions" aria-label="Explore the blog">' in landing, 'Homepage blog CTA group missing'
assert '<a class="button hero-cta hero-cta--primary" href="/blog/about/">Get to Know Me <span aria-hidden="true">↗</span></a>' in landing, 'Get to Know Me button missing'
assert '<a class="button hero-cta hero-cta--secondary" href="/blog/topics/personal-perspectives/">Read My Reflections <span aria-hidden="true">↗</span></a>' in landing, 'Read My Reflections button missing'
about=(ROOT/'blog/about/index.html').read_text()
assert "<h1>I'm Faraz." in about and 'id="author-work"' in about and 'id="author-life"' in about, 'About biography missing work or life'
assert 'class="author-copy"' in about and 'More than metrics.' in about, 'About hero headline missing'
assert "Between where I'm from" in about and 'Since moving to the UK in 2019' in about, 'About personal introduction missing'
assert 'grid-template-columns:minmax(0,1fr) minmax(280px,370px)' in about and '.author-intro .author-copy{min-width:0;max-width:none}' in about, 'About editorial grid or full-width copy missing'
assert '@media(max-width:1020px){.author-intro{grid-template-columns:minmax(0,1fr)' in about, 'About tablet stacking missing'
assert '@media(max-width:540px){.author-intro{grid-template-columns:minmax(0,1fr)' in about, 'About mobile stacking missing'
assert 'id="author-professional-writing"' in about and 'id="author-personal-writing"' in about, 'About writing categories missing'
assert '/blog/topics/personal-perspectives/' in about, 'Personal essay path missing on About page'
assert '<!-- managed-post-cards:start -->' in about and '<!-- managed-post-cards:end -->' in about, 'About article registry missing'
posts=json.loads((ROOT/'blog/posts.json').read_text())
assert len({p['url'] for p in posts})==len(posts)
for post in posts:
    assert post['url'] in pages,post['url']+' missing'
    incoming={path for path,page in pages.items() for tag,a in page.tags if tag=='a' and a.get('href')==post['url'] and path!=post['url']}
    assert incoming,post['url']+' orphan'
    if post.get('category')=='Personal perspectives':
        assert 200<=post['wordCount']<=2500,post['url']+' personal word count'
        assert post.get('answerCount')==10 and post.get('approvedForPublication') is True and post.get('privacyChecked') is True, post['url']+' journal safeguards'
        assert post.get('entryDate')==post.get('date'),post['url']+' journal date'
    else:
        assert 1000<=post['wordCount']<=1200,post['url']+' professional word count'
for name in ['sitemap.xml','blog/feed.xml','blog/assets/portfolio-skyline.svg']:ET.parse(ROOT/name)
assert (ROOT/'index.html').read_bytes()==(ROOT/'faraz-site/index.html').read_bytes(),'Homepage copies differ'
print(json.dumps({'status':'PASS','pages':results,'posts':len(posts)},indent=2))

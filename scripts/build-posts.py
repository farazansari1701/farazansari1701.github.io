"""Render managed Markdown posts, update archives/feed/sitemap without changing old posts.
Add blogs/content/<slug>.md and a matching JSON record. Keep publication dates stable.
Only a small, safe Markdown subset is supported: headings, paragraphs, lists and links.
"""
from pathlib import Path
from datetime import datetime
from email.utils import format_datetime
from xml.etree import ElementTree as ET
import re, html, json

ROOT=Path(__file__).resolve().parents[1]
BASE='https://farazansari1701.com'
ASSET='/blogs/assets/'

def e(text):return html.escape(str(text),quote=True)
def inline(text):
    result=e(text)
    def link(m):
        label,url=m.groups()
        assert url.startswith(('/', 'https://')), 'Unsupported link protocol'
        return '<a href="'+url+'">'+label+'</a>'
    return re.sub(r'\[([^\]]+)\]\(([^)]+)\)',link,result)

def markdown(text):
    out=[];toc=[];used=set()
    for part in text.strip().split('\n\n'):
        if part.startswith('#'):
            level=3 if part.startswith('### ') else 2
            title=part[level+1:]
            ident=re.sub('[^a-z0-9]+','-',title.lower()).strip('-')
            assert ident not in used;used.add(ident)
            out.append(f'<h{level} id="{ident}">{inline(title)}</h{level}>')
            if level==2:toc.append((ident,title))
        elif part.startswith('- '):out.append('<ul>'+''.join('<li>'+inline(x[2:])+'</li>' for x in part.splitlines())+'</ul>')
        else:out.append('<p>'+inline(part.replace('\n',' '))+'</p>')
    return '\n'.join(out),toc

def picture(p,eager=False):
    prefix=p.get('heroPrefix','marketing-journey');w=p.get('heroWidth',1200);h=p.get('heroHeight',800)
    candidates=[640,1200,1600] if w==1600 else [640,1200]
    sizes=', '.join(ASSET+prefix+'-'+str(n)+'.webp '+str(n)+'w' for n in candidates)
    return f'<figure class="journey-art"><picture><source type="image/webp" srcset="{sizes}" sizes="(max-width:680px) 100vw, 48vw"><img src="{ASSET}{prefix}-{w}.jpg" width="{w}" height="{h}" alt="{e(p.get("heroAlt","Conceptual illustration connecting email, landing pages and CRM"))}" loading="{"eager" if eager else "lazy"}" '+('fetchpriority="high" ' if eager else '')+f'decoding="async"></picture><figcaption>{e(p.get("heroCaption","Email. Landing page. CRM. One connected journey."))}<span>Conceptual illustration</span></figcaption></figure>'

def date_label(date):return datetime.fromisoformat(date).strftime('%-d %B %Y')
def card(p):
    return f'<article class="post-card">{picture(p)}<div><div class="eyebrow">{e(p["category"])}</div><h2><a href="{p["url"]}">{e(p["title"])}</a></h2><p>{e(p.get("deck",p["description"]))}</p><p class="small-meta">{date_label(p.get("publishedAt",p["date"]))} · 6 minute read</p><a class="button" href="{p["url"]}">Read the article <span aria-hidden="true">↗</span></a></div></article>'

posts=json.loads((ROOT/'blogs/posts.json').read_text())
assert len({p['url'] for p in posts})==len(posts), 'Duplicate article URLs'
for source in sorted((ROOT/'blogs/content').glob('*.json')):
    p=json.loads(source.read_text());slug=p['slug']
    assert re.fullmatch('[a-z0-9]+(?:-[a-z0-9]+)*',slug)
    p['url']='/blogs/'+slug+'/'
    p['date']=p['publishedAt'][:10];p['author']='Faraz Ansari';p['status']='published'
    text=source.with_suffix('.md').read_text()
    count_text=' '.join(x for x in text.splitlines() if not x.startswith('#'))
    p['wordCount']=len(re.sub(r'\[([^\]]+)\]\([^)]+\)',r'\1',count_text).split())
    assert 1000<=p['wordCount']<=1200, f'Body words outside range: {p["wordCount"]}'
    for old in posts:
        if old['url']==p['url']:assert old.get('publishedAt',p['publishedAt'])==p['publishedAt'], 'Original publication date changed'
    body,toc=markdown(text);url=BASE+p['url'];social=BASE+ASSET+p['heroPrefix']+'-social.jpg'
    graph={'@context':'https://schema.org','@graph':[
        {'@type':'BlogPosting','@id':url+'#article','headline':p['title'],'description':p['description'],'url':url,'mainEntityOfPage':url,'datePublished':p['publishedAt'],'dateModified':p['modifiedAt'],'inLanguage':'en-GB','wordCount':p['wordCount'],'articleSection':p['category'],'keywords':p['keywords'],'image':social,'author':{'@id':BASE+'/blogs/about/#person'},'publisher':{'@id':BASE+'/blogs/about/#person'},'isPartOf':{'@type':'Blog','name':'Digital Marketing Insights','url':BASE+'/blogs/'}},
        {'@type':'Person','@id':BASE+'/blogs/about/#person','name':'Faraz Ansari','url':BASE+'/blogs/about/','jobTitle':'Senior Digital Marketing Executive','sameAs':['https://www.linkedin.com/in/farazansari1701/']},
        {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':BASE+'/'},{'@type':'ListItem','position':2,'name':'Blogs','item':BASE+'/blogs/'},{'@type':'ListItem','position':3,'name':p['title'],'item':url}]}
    ]}
    foot=(ROOT/'templates/blog-footer.html').read_text()
    source_links=''.join('<li><a href="'+e(x['url'])+'">'+e(x['name'])+'</a> — '+e(x['context'])+'</li>' for x in p['sources'])
    author='<aside class="author-card" aria-label="About the author"><div class="avatar" aria-hidden="true">FA</div><div><h2>Written by Faraz Ansari</h2><p>Senior Digital Marketing Executive at OKI Europe, based in London. Personal reflections on digital marketing, campaigns and automation.</p><a href="/blogs/about/">About the author ↗</a></div></aside>'
    toc_html=''.join('<li><a href="#'+ident+'">'+e(title)+'</a></li>' for ident,title in toc)
    schema_text=json.dumps(graph,ensure_ascii=False).replace('</','<\\/')
    output=f'''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{e(p['seoTitle'])}</title><meta name="description" content="{e(p['description'])}"><meta name="author" content="Faraz Ansari"><link rel="canonical" href="{url}">
<meta property="og:type" content="article"><meta property="og:locale" content="en_GB"><meta property="og:site_name" content="Faraz Ansari"><meta property="og:title" content="{e(p['title'])}"><meta property="og:description" content="{e(p['description'])}"><meta property="og:url" content="{url}"><meta property="og:image" content="{social}"><meta property="og:image:alt" content="{e(p['heroAlt'])}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="article:published_time" content="{p['publishedAt']}"><meta property="article:modified_time" content="{p['modifiedAt']}"><meta property="article:author" content="{BASE}/blogs/about/"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(p['title'])}"><meta name="twitter:description" content="{e(p['description'])}"><meta name="twitter:image" content="{social}">
<link rel="icon" href="/blogs/assets/registration.svg" type="image/svg+xml"><link rel="alternate" type="application/rss+xml" title="Faraz Ansari — Field notes" href="/blogs/feed.xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&amp;display=swap" rel="stylesheet"><link rel="stylesheet" href="/blogs/assets/blog.css"><link rel="stylesheet" href="/blogs/assets/footer.css"><script type="application/ld+json">{schema_text}</script><script src="/blogs/assets/blog.js" defer></script><script src="/assets/measurement.min.js?v=20261021" defer></script></head>
<body><div class="reading-progress" aria-hidden="true"></div><a class="skip" href="#main">Skip to content</a><header class="site-header"><a class="brand" href="/">Faraz Ansari</a><nav class="site-nav" aria-label="Main navigation"><a class="portfolio-link" href="/#work">Portfolio</a><a href="/blogs/">Blogs</a><a href="/#contact">Let’s talk ↗</a></nav></header><main id="main"><div class="wrap"><div class="breadcrumbs"><a href="/">Home</a><span>/</span><a href="/blogs/">Blogs</a><span>/</span>{e(p['category'])}</div><article><header class="hero"><div class="eyebrow">{e(p['category'])}<span>·</span>Practical framework</div><div class="hero-grid"><div><h1>{e(p['title'])}</h1><p class="deck">{e(p['deck'])}</p><div class="byline"><a class="avatar" href="/blogs/about/" aria-label="About Faraz Ansari">FA</a><div><strong><a href="/blogs/about/">Faraz Ansari</a></strong><small>Senior Digital Marketing Executive</small></div><span class="divider" aria-hidden="true"></span><span><time datetime="{p['date']}">{date_label(p['publishedAt'])}</time><br>6 minute read</span></div><div class="article-tools"><button id="copy-link" type="button" hidden>Copy article link</button><span id="share-status" role="status"></span></div></div>{picture(p,True)}</div></header><div class="context-strip"><span>{e(p['context'])}</span><a href="/blogs/">All insights ↗</a></div><div class="reading-layout"><aside class="toc"><div class="toc-label">Inside this article</div><ol>{toc_html}</ol></aside><div class="prose" id="article-body">{body}<section class="sources" aria-labelledby="sources-title"><h2 id="sources-title">Sources &amp; context</h2><ol>{source_links}</ol><p>This article reflects my own views and experience. It is not an official statement from OKI Europe.</p></section>{author}<a class="back-top" href="#main">Back to top ↑</a></div></div></article></div></main><section class="cta" aria-labelledby="cta-title"><div><h2 id="cta-title">Good marketing starts with a conversation.</h2><p>Explore my work in digital marketing, automation and campaign delivery.</p></div><a class="button light" href="/#contact">Get in touch ↗</a></section>{foot}<aside class="cookie" id="blog-cookie" aria-label="Analytics cookie preferences" hidden><p>Allow Google Analytics on these blog pages? Analytics loads only if you choose Allow analytics. You can change your choice in Cookie settings.</p><div class="cookie-actions"><button type="button" data-consent="granted">Allow analytics</button><button type="button" data-consent="denied">Decline</button></div></aside><script src="/blogs/assets/footer.js" defer></script></body></html>'''
    path=ROOT/p['url'].strip('/')/'index.html';path.parent.mkdir(parents=True,exist_ok=True);path.write_text(output)
    posts=[old for old in posts if old['url']!=p['url']]+[p]

posts.sort(key=lambda p:p.get('publishedAt',p['date']),reverse=True)
(ROOT/'blogs/posts.json').write_text(json.dumps(posts,ensure_ascii=False,indent=2)+'\n')
for rel in ['blogs/index.html','blogs/about/index.html']:
    path=ROOT/rel;s=path.read_text();block='\n'.join(card(p) for p in posts)
    mark=r'<!-- managed-post-cards:start -->[\s\S]*?<!-- managed-post-cards:end -->'
    if re.search(mark,s):s=re.sub(mark,lambda m:'<!-- managed-post-cards:start -->'+block+'<!-- managed-post-cards:end -->',s)
    else:s=re.sub(r'<article class="post-card">[\s\S]*?</article>',lambda m:'<!-- managed-post-cards:start -->'+block+'<!-- managed-post-cards:end -->',s,count=1)
    s=s.replace('01 article',f'{len(posts):02} articles').replace('<span>Latest article</span><span>01</span>',f'<span>Published articles</span><span>{len(posts):02}</span>')
    # Synchronise the collection's machine-readable list with the visible archive.
    def schema_update(m):
        d=json.loads(m.group(1))
        if d.get('@type')=='CollectionPage':d['mainEntity']={'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'url':BASE+p['url'],'name':p['title']} for i,p in enumerate(posts)]}
        return '<script type="application/ld+json">'+json.dumps(d,ensure_ascii=False)+'</script>'
    s=re.sub(r'<script type="application/ld\+json">([\s\S]*?)</script>',schema_update,s)
    path.write_text(s)

ns='http://www.sitemaps.org/schemas/sitemap/0.9';ET.register_namespace('',ns)
tree=ET.parse(ROOT/'sitemap.xml');seen={x.text for x in tree.findall('.//{'+ns+'}loc')}
for p in posts:
    if BASE+p['url'] not in seen:
        node=ET.SubElement(tree.getroot(),'{'+ns+'}url');ET.SubElement(node,'{'+ns+'}loc').text=BASE+p['url'];ET.SubElement(node,'{'+ns+'}lastmod').text=p['date']
tree.write(ROOT/'sitemap.xml',encoding='utf-8',xml_declaration=True)
ET.register_namespace('atom','http://www.w3.org/2005/Atom')
rss=ET.Element('rss',{'version':'2.0'});channel=ET.SubElement(rss,'channel')
for tag,value in [('title','Faraz Ansari — Digital Marketing Insights'),('link',BASE+'/blogs/'),('description','Practical digital marketing experiences and lessons.'),('language','en-gb')]:ET.SubElement(channel,tag).text=value
ET.SubElement(channel,'{http://www.w3.org/2005/Atom}link',{'href':BASE+'/blogs/feed.xml','rel':'self','type':'application/rss+xml'})
for p in posts:
    item=ET.SubElement(channel,'item')
    for tag,value in [('title',p['title']),('link',BASE+p['url']),('description',p['description']),('category',p['category'])]:ET.SubElement(item,tag).text=value
    ET.SubElement(item,'guid',{'isPermaLink':'true'}).text=BASE+p['url']
    published=p.get('publishedAt','2026-10-21T13:21:06+01:00');ET.SubElement(item,'pubDate').text=format_datetime(datetime.fromisoformat(published))
ET.ElementTree(rss).write(ROOT/'blogs/feed.xml',encoding='utf-8',xml_declaration=True)
print(json.dumps({'posts':len(posts),'managed':[p['url'] for p in posts if 'slug' in p]},indent=2))

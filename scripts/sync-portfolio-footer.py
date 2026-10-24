"""Copy the portfolio footer and its CSS into the shared blog footer assets."""
from pathlib import Path
import re
from compact_skyline import compact_svg
ROOT=Path(__file__).resolve().parents[1]
home_path=ROOT/'index.html'
home=home_path.read_text()
# Shorten equivalent SVG syntax without rounding coordinates or changing nodes.
# Keep the canonical portfolio and every generated footer on the same artwork.
skyline=re.search(r'<svg class="skyline sky3"[\s\S]*?</svg>',home)
compact=compact_svg(skyline.group())
if compact != skyline.group():
 home=home[:skyline.start()]+compact+home[skyline.end():]
 home_path.write_text(home)
footer=re.search(r'<footer\b[^>]*>[\s\S]*?</footer>',home).group()
# Keep the portfolio's exact SVG in the shared footer so its animated elements
# are available immediately, without a separate fetch/parse/hydration stage.
# Preserve the cascade and media queries of the portfolio's footer rules.
def relevant(selector):
 return bool(re.search(r'\.(?:foot(?:-row)?|wordmark|pano|sky3|socials(?:-foot)?)\b',selector)) and not bool(re.search(r'\.(?:socials-top|socials-menu)',selector))
def rules(css):
 css=re.sub(r'/\*[\s\S]*?\*/','',css);out=[];pos=0
 while pos<len(css):
  start=css.find('{',pos)
  if start<0:break
  head=css[pos:start].strip();depth=1;end=start+1
  while end<len(css) and depth:
   if css[end]=='{':depth+=1
   elif css[end]=='}':depth-=1
   end+=1
  body=css[start+1:end-1]
  if head.startswith('@media'):
   nested=rules(body)
   if nested:out.append(head+'{'+nested+'}')
  elif head.startswith('@keyframes kite'):out.append(head+'{'+body+'}')
  elif not head.startswith('@'):
   selected=[x.strip() for x in head.split(',') if relevant(x)]
   if selected:out.append(','.join(selected)+'{'+body+'}')
  pos=end
 return '\n'.join(out)
portfolio_css=ROOT/'assets/portfolio.css'
styles=[portfolio_css.read_text()] if portfolio_css.exists() else re.findall(r'<style[^>]*>([\s\S]*?)</style>',home)
css='\n'.join(rules(x) for x in styles)
responsive=ROOT/'assets/portfolio-responsive.css'
if responsive.exists():css+='\n'+rules(responsive.read_text())
base='''/* Generated from the main portfolio footer by scripts/sync-portfolio-footer.py. */
.foot{--paper:#F6F6F3;--ink:#1A1A1A;--cyan:#00AEEF;--magenta:#EC008C;--yellow:#FFE500;--gutter:clamp(20px,5vw,72px);--ease:cubic-bezier(.2,.7,.1,1);--font:"Archivo","Helvetica Neue",Helvetica,Arial,sans-serif;--bg:var(--ink);--fg:var(--paper);background:var(--bg);color:var(--fg);font-family:var(--font);font-size:17px;line-height:1.55;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .foot{--paper:#141414;--ink:#EDEDE9}}
:root[data-theme="dark"] .foot{--paper:#141414;--ink:#EDEDE9}
.foot :where(p){margin:1em 0}.foot a{color:inherit}.foot button{font:inherit;color:inherit}.foot img,.foot svg{max-width:100%}
'''
(ROOT/'blog/assets/footer.css').write_text(base+css+'\n@media print{.foot{display:none!important}}\n')
# Also export the same artwork as a standalone asset for existing asset links.
svg = re.search(r'<svg class="skyline sky3"[\s\S]*?</svg>', footer).group()
svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ', 1)
palette = ':root{--paper:#F6F6F3;--ink:#1A1A1A;--cyan:#00AEEF;--magenta:#EC008C;--yellow:#FFE500;--bg:var(--ink);--fg:var(--paper)}@media(prefers-color-scheme:dark){:root{--paper:#141414;--ink:#EDEDE9}}'
asset = svg.replace('><defs>', '><defs>', 1)
position = asset.index('>') + 1
asset = asset[:position] + '<style>' + palette + css + '</style>' + asset[position:]
(ROOT/'blog/assets/portfolio-skyline.svg').write_text(asset)
(ROOT/'templates/blog-footer.html').write_text(footer+'\n')
print('Synced portfolio footer, shared SVG artwork and styles')

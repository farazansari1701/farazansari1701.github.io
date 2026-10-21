"""Copy the portfolio footer and its CSS into the shared blog footer assets."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
home=(ROOT/'index.html').read_text()
footer=re.search(r'<footer\b[^>]*>[\s\S]*?</footer>',home).group()
(ROOT/'templates/blog-footer.html').write_text(footer+'\n')
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
css='\n'.join(rules(x) for x in re.findall(r'<style[^>]*>([\s\S]*?)</style>',home))
base='''/* Generated from the main portfolio footer by scripts/sync-portfolio-footer.py. */
.foot{--paper:#F6F6F3;--ink:#1A1A1A;--cyan:#00AEEF;--magenta:#EC008C;--yellow:#FFE500;--gutter:clamp(20px,5vw,72px);--ease:cubic-bezier(.2,.7,.1,1);--font:"Archivo","Helvetica Neue",Helvetica,Arial,sans-serif;--bg:var(--ink);--fg:var(--paper);background:var(--bg);color:var(--fg);font-family:var(--font);font-size:17px;line-height:1.55;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .foot{--paper:#141414;--ink:#EDEDE9}}
:root[data-theme="dark"] .foot{--paper:#141414;--ink:#EDEDE9}
.foot :where(p){margin:1em 0}.foot a{color:inherit}.foot button{font:inherit;color:inherit}.foot img,.foot svg{max-width:100%}
'''
(ROOT/'blog/assets/footer.css').write_text(base+css+'\n@media print{.foot{display:none!important}}\n')
print('Synced footer markup and styles from index.html')

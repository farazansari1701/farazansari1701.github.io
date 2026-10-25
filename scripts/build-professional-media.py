"""Create deterministic visual assets for the landing-page editorial article.

Pillow is installed by the GitHub Actions blog workflow. Existing complete
artwork sets are never overwritten. The illustration contains no private
analytics, employer data, screenshots, customer details or measured results.
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'blog' / 'assets'
FONT_PATHS = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf',
    '/Library/Fonts/Arial.ttf',
]

def font(size):
    for path in FONT_PATHS:
        if Path(path).exists():
            return ImageFont.truetype(path, max(10, round(size)))
    return ImageFont.load_default()

def artwork(width, height):
    sx, sy = width / 1600, height / 900
    xy = lambda x, y: (round(x * sx), round(y * sy))
    box = lambda a, b, c, d: (*xy(a, b), *xy(c, d))
    scale = min(sx, sy)
    ink = '#252a31'
    pale = '#f7f4ed'
    white = '#fffefd'
    cyan = '#18a9c3'
    magenta = '#da347d'
    yellow = '#f5c83f'
    gray = '#d7d6d2'
    img = Image.new('RGB', (width, height), pale)
    draw = ImageDraw.Draw(img)
    draw.ellipse(box(145, 165, 600, 670), fill='#d5edf0')
    draw.ellipse(box(1370, 480, 1710, 825), fill=yellow)
    draw.ellipse(box(915, 80, 1180, 345), fill='#ffe7a0')
    draw.rounded_rectangle(box(72, 265, 496, 610), radius=round(28 * scale), fill=white, outline='#d5d3cb', width=max(1, round(scale * 3)))
    draw.rounded_rectangle(box(560, 120, 1110, 720), radius=round(30 * scale), fill=white, outline='#d5d3cb', width=max(1, round(scale * 3)))
    draw.rounded_rectangle(box(1184, 275, 1570, 625), radius=round(28 * scale), fill=white, outline='#d5d3cb', width=max(1, round(scale * 3)))
    for x in (603, 633, 663):
        draw.ellipse(box(x, 160, x + 14, 174), fill=ink)
    draw.rectangle(box(112, 325, 405, 352), fill=ink)
    draw.rectangle(box(112, 383, 452, 401), fill=gray)
    draw.rectangle(box(112, 422, 360, 440), fill=gray)
    draw.rounded_rectangle(box(115, 502, 188, 550), radius=round(8 * scale), fill=yellow)
    draw.rounded_rectangle(box(625, 285, 797, 310), radius=round(6 * scale), fill=ink)
    draw.rounded_rectangle(box(625, 331, 750, 353), radius=round(6 * scale), fill=ink)
    draw.rounded_rectangle(box(830, 268, 1051, 450), radius=round(17 * scale), fill='#e2e1dc')
    draw.ellipse(box(985, 289, 1032, 336), fill='#b3b4b2')
    draw.polygon([xy(841, 433), xy(897, 348), xy(968, 435)], fill='#b4b6b7')
    draw.rounded_rectangle(box(692, 497, 975, 559), radius=round(16 * scale), fill=cyan)
    for x in (632, 780, 929):
        draw.rounded_rectangle(box(x, 594, x + 117, 645), radius=round(9 * scale), fill='#e8e6e0')
    draw.rounded_rectangle(box(1228, 342, 1518, 368), radius=round(4 * scale), fill=ink)
    for yy in (415, 465, 515):
        draw.rounded_rectangle(box(1228, yy, 1532, yy + 28), radius=round(7 * scale), fill='#e9e7e2')
    draw.rounded_rectangle(box(1248, 558, 1515, 606), radius=round(12 * scale), fill=cyan)
    draw.line([xy(465, 460), xy(580, 500), xy(675, 516)], fill=cyan, width=max(4, round(12 * scale)), joint='curve')
    draw.polygon([xy(675, 516), xy(654, 499), xy(656, 532)], fill=cyan)
    draw.line([xy(966, 537), xy(1112, 556), xy(1237, 580)], fill=cyan, width=max(4, round(12 * scale)), joint='curve')
    draw.polygon([xy(1237, 580), xy(1215, 564), xy(1219, 596)], fill=cyan)
    draw.line([xy(1082, 468), xy(1165, 390), xy(1228, 390)], fill=magenta, width=max(3, round(7 * scale)), joint='curve')
    draw.ellipse(box(1139, 355, 1210, 426), fill=magenta)
    draw.line([xy(1160, 376), xy(1189, 405)], fill=white, width=max(2, round(7 * scale)))
    draw.line([xy(1189, 376), xy(1160, 405)], fill=white, width=max(2, round(7 * scale)))
    draw.text(xy(94, 89), 'FARAZ ANSARI  /  MARKETING OPERATIONS', font=font(26 * scale), fill=ink)
    draw.text(xy(105, 775), 'The promise. The proof. The next action.', font=font(43 * scale), fill=ink)
    return img

def generate():
    ASSETS.mkdir(parents=True, exist_ok=True)
    source = ROOT / 'blog' / 'content' / 'landing-page-promise-next-action.json'
    post = json.loads(source.read_text())
    assert post['heroPrefix'] == 'landing-promise'
    prefix = post['heroPrefix']
    files = [ASSETS / (prefix + '-1600.jpg'), ASSETS / (prefix + '-social.jpg')]
    files += [ASSETS / (prefix + '-' + str(w) + '.webp') for w in (640, 1200, 1600)]
    if all(f.exists() for f in files):
        print('Existing professional art verified')
        return
    if any(f.exists() for f in files):
        raise RuntimeError('Partial professional art: complete set required')
    hero = artwork(1600, 900)
    hero.save(files[0], format='JPEG', quality=85, optimize=True)
    artwork(1200, 630).save(files[1], format='JPEG', quality=85, optimize=True)
    for w in (640, 1200, 1600):
        hero.resize((w, round(w * 900 / 1600)), Image.Resampling.LANCZOS).save(
            ASSETS / (prefix + '-' + str(w) + '.webp'), format='WEBP', quality=84, method=5)
    print('Professional art generated for landing-page article')

if __name__ == '__main__':
    generate()

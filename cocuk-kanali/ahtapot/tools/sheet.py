# Kullanım: python3 tools/sheet.py çıktı.png kare1.png kare2.png ...  → 2 sütunlu temas föyü (token tasarrufu için tek görsel)
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
tw, th = 960, 540; cols = 2; rows = (len(files) + 1) // 2
sheet = Image.new('RGB', (tw * cols, th * rows), (0, 0, 0)); d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((tw, th)); x, y = (i % cols) * tw, (i // cols) * th
    sheet.paste(im, (x, y)); d.rectangle([x, y, x + 150, y + 26], fill=(0, 0, 0)); d.text((x + 6, y + 6), f.split('/')[-1], fill=(255, 255, 0))
sheet.save(out); print(out)

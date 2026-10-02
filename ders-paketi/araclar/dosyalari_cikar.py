# Modelin cevabındaki "@@@ DOSYA: yol ... @@@ SON" bloklarını bölüm klasörüne dosya olarak yazar.
# Kullanım: python3 araclar/dosyalari_cikar.py cevap.txt bolumler/02-yunus [--zorla]
import os, re, sys
if len(sys.argv) < 3: sys.exit('Kullanım: python3 araclar/dosyalari_cikar.py cevap.txt <bölüm_klasörü> [--zorla]')
cevap, hedef, zorla = sys.argv[1], sys.argv[2], '--zorla' in sys.argv
KORUMALI = {'js/core.js', 'js/octopus.js', 'js/main.js', 'index.html'}  # motor: model yazamaz
metin = open(cevap, encoding='utf-8').read().replace('\r\n', '\n')
bloklar = re.findall(r'^@@@ DOSYA:\s*(\S+)\s*\n(.*?)^@@@ SON\s*$', metin, re.M | re.S)
if not bloklar: sys.exit('Hiç "@@@ DOSYA:" bloğu bulunamadı. Modelden çıktı formatına uymasını iste.')
yazilan, atlanan = [], []
for yol, icerik in bloklar:
    yol = yol.strip().lstrip('./')
    if yol.startswith('/') or '..' in yol.split('/'): atlanan.append(f'{yol} (güvensiz yol)'); continue
    if (yol in KORUMALI or yol.startswith('tools/')) and not zorla: atlanan.append(f'{yol} (motor dosyası — değiştirilmez)'); continue
    satirlar = icerik.rstrip('\n').split('\n')
    if satirlar and satirlar[0].strip().startswith('```'): satirlar = satirlar[1:]       # kod çiti varsa temizle
    if satirlar and satirlar[-1].strip().startswith('```'): satirlar = satirlar[:-1]
    if any(re.fullmatch(r'\s*(//|#)?\s*(\.\.\.|…)\s*(önceki gibi|aynı|değişmedi)?.*', s, re.I) for s in satirlar[:3]): atlanan.append(f'{yol} (eksik içerik: "…")'); continue
    p = os.path.join(hedef, yol); os.makedirs(os.path.dirname(p) or '.', exist_ok=True)
    open(p, 'w', encoding='utf-8').write('\n'.join(satirlar) + '\n'); yazilan.append(f'{yol} ({len(satirlar)} satır)')
print('YAZILDI:'); [print('  ' + y) for y in yazilan]
if atlanan: print('ATLANDI:'); [print('  ' + a) for a in atlanan]
# yeni sahne dosyası bolum.js SAHNELER listesinde mi?
bj = os.path.join(hedef, 'js/bolum.js')
if os.path.exists(bj):
    liste = open(bj, encoding='utf-8').read()
    for y in yazilan:
        m = re.match(r'js/scenes/(\S+)\.js', y)
        if m and f"'{m.group(1)}'" not in liste and f'"{m.group(1)}"' not in liste: print(f'UYARI: {m.group(1)} bolum.js → SAHNELER listesinde yok, yüklenmeyecek')

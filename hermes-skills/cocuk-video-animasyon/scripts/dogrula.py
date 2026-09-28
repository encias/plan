# Bölüm denetçisi — render'dan ÖNCE çalıştır. Hata varsa çıkış kodu 1.
# Kullanım: node tools/cues.mjs && python3 tools/dogrula.py
# Denetler: sahne zaman çizelgesi, seslendirme hızı/çakışması, efekt adları/yoğunluğu, kod kuralları, ekran yazısı uzunluğu, motor bütünlüğü.
import hashlib, json, os, re, sys, glob
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
HATA, UYARI = [], []
def hata(m): HATA.append(m)
def uyari(m): UYARI.append(m)

if not os.path.exists('out/cues.json'): sys.exit('out/cues.json yok → önce: node tools/cues.mjs')
d = json.load(open('out/cues.json'))
DUR = d['duration']

# 1) sahneler: boşluksuz, çakışmasız, 0'dan DURATION'a
sc = sorted(d['scenes'], key=lambda s: s['start'])
if not sc: hata('hiç sahne yok')
else:
    if abs(sc[0]['start']) > 1e-6: hata(f"ilk sahne 0'da başlamıyor ({sc[0]['id']} {sc[0]['start']})")
    if abs(sc[-1]['end'] - DUR) > 1e-6: hata(f"son sahne DURATION'da bitmiyor ({sc[-1]['end']} ≠ {DUR})")
    for a, b in zip(sc, sc[1:]):
        if abs(a['end'] - b['start']) > 1e-6: hata(f"sahne boşluğu/çakışması: {a['id']} {a['end']} → {b['id']} {b['start']}")
    for i, n in Counter(s['id'] for s in sc).items():
        if n > 1: hata(f'yinelenen sahne id: {i}')

# 2) seslendirme
vo = d['vo']; bounds = [s['start'] for s in sc[1:]]; perde = [s['start'] for s in sc[1:] if s.get('transition') != 'cut']
for i, (a, b, t) in enumerate(vo):
    w = len(t.split()); dur = b - a
    if dur <= 0: hata(f'VO#{i+1} süresi ≤ 0'); continue
    hiz = w / dur
    if hiz > 3.1: hata(f'VO#{i+1} çok hızlı: {hiz:.1f} kelime/sn (üst sınır 2.8) — "{t[:40]}"')
    elif hiz > 2.8: uyari(f'VO#{i+1} hızlı: {hiz:.1f} kelime/sn — "{t[:40]}"')
    if w > 16: uyari(f'VO#{i+1} {w} kelime; çocuk için cümleyi böl')
    if a < 0 or b > DUR: hata(f'VO#{i+1} süre dışında')
    for x in bounds:
        if a < x < b: hata(f'VO#{i+1} sahne sınırını ({x}) aşıyor — "{t[:40]}"')
    for x in perde:
        if 0 <= a - x < .4 or 0 <= x - b < .2: uyari(f'VO#{i+1} kabarcık geçişine çok yakın (sınır {x}) — görsel perde altında kalabilir')
for (a1, b1, t1), (a2, b2, t2) in zip(vo, vo[1:]):
    if a2 < b1 + .2: hata(f'VO çakışması/nefes yok: "{t1[:25]}" → "{t2[:25]}" ({b1}→{a2})')

# 3) efektler
core = open('js/core.js', encoding='utf-8').read()
m = re.search(r'const SFX = \[(.*?)\];', core, re.S)
izinli = set(re.findall(r"'(\w+)'", m.group(1))) if m else set()
cs = sorted(d['cues'], key=lambda c: c['t'])
for c in cs:
    if c['sfx'] not in izinli: hata(f"izinsiz sfx '{c['sfx']}' ({c['scene']} t={c['t']})")
    if not 0 <= c['t'] < DUR: hata(f"sfx süre dışında: {c}")
for a, b in zip(cs, cs[1:]):
    if b['t'] - a['t'] < .12: uyari(f"sfx çok yakın: {a['sfx']}@{a['t']} + {b['sfx']}@{b['t']}")
for k in range(int(DUR // 10) + 1):
    n = sum(1 for c in cs if k * 10 <= c['t'] < k * 10 + 10)
    if n > 12: uyari(f'{k*10}–{k*10+10} sn arası {n} efekt (≤12 önerilir)')

# 4) kod kuralları
for f in glob.glob('js/**/*.js', recursive=True):
    src = open(f, encoding='utf-8').read()
    if 'Math.random' in re.sub(r'//.*', '', src): hata(f'{f}: Math.random kullanılmış (rng/hash kullan)')
for f in sorted(glob.glob('js/scenes/*.js')):
    src = open(f, encoding='utf-8').read(); on = os.path.basename(f)[:4]  # 'sXX_'
    for fn in re.findall(r'^function (\w+)', src, re.M):
        if not fn.startswith(on): hata(f'{f}: global fonksiyon "{fn}" sahne önekiyle ({on}) başlamıyor')
    for sub in re.findall(r"^(?:const|let|var) (\w+)", src, re.M):
        if not sub.startswith(on) and not sub.upper().startswith(on.upper()): uyari(f'{f}: global değişken "{sub}" öneksiz')
    if src.count('ctx.save()') != src.count('ctx.restore()'): uyari(f'{f}: save/restore sayısı eşit değil ({src.count("ctx.save()")}/{src.count("ctx.restore()")})')
    # 5) ekran yazısı ≤ 3 kelime (çocuklar okumaz; yazı vurgu içindir)
    for fn, s in re.findall(r"\b(txt|pill|popWords)\(ctx,\s*'([^']+)'", src):
        if len(s.split()) > 3: uyari(f'{f}: ekran yazısı 3 kelimeden uzun: "{s}"')

# 6) motor bütünlüğü (yeni_bolum.sh MOTOR_SHA256.txt bırakır)
if os.path.exists('MOTOR_SHA256.txt'):
    for line in open('MOTOR_SHA256.txt'):
        h, p = line.split()
        if os.path.exists(p) and hashlib.sha256(open(p, 'rb').read()).hexdigest() != h:
            uyari(f'motor dosyası değişmiş: {p} — bilinçli değilse geri al (seri tutarlılığı)')

print(f'Sahne: {len(sc)}  VO: {len(vo)}  SFX: {len(cs)}  Süre: {DUR} sn')
for u in UYARI: print('UYARI  ', u)
for h in HATA: print('HATA   ', h)
print('SONUÇ:', 'GEÇTİ' if not HATA else f'{len(HATA)} HATA — render etme')
sys.exit(1 if HATA else 0)

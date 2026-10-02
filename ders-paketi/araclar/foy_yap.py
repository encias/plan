# Modele geri göndermek için önizleme föyleri + denetim raporu üretir.
# Kullanım: python3 araclar/foy_yap.py bolumler/02-yunus [sahne_id ...|hepsi] [--kare=6]
#   sahne verilmezse sadece denetim (dogrula.py) çalışır. Çıktılar: <bölüm>/out/foy/
import json, os, subprocess, sys
if len(sys.argv) < 2: sys.exit('Kullanım: python3 araclar/foy_yap.py <bölüm_klasörü> [sahne_id ...|hepsi]')
B = os.path.abspath(sys.argv[1]); args = [a for a in sys.argv[2:] if not a.startswith('--')]
n = int(next((a.split('=')[1] for a in sys.argv if a.startswith('--kare=')), 6))
out = os.path.join(B, 'out', 'foy'); os.makedirs(out, exist_ok=True)
def run(cmd): return subprocess.run(cmd, cwd=B, capture_output=True, text=True)
r = run(['node', 'tools/cues.mjs']); print((r.stdout + r.stderr).strip().splitlines()[-1] if (r.stdout + r.stderr).strip() else '')
d = run(['python3', 'tools/dogrula.py']); rapor = d.stdout + d.stderr
open(os.path.join(out, 'dogrula.txt'), 'w', encoding='utf-8').write(rapor); print(rapor)
if not args: sys.exit(0)
sc = json.load(open(os.path.join(B, 'out', 'cues.json')))['scenes']
secili = sc if args == ['hepsi'] else [s for s in sc if s['id'] in args or s['id'][:3] in args]
for s in secili:
    a, b = s['start'] + .5, s['end'] - .5; ts = [round(a + (b - a) * (i + .5) / n, 2) for i in range(n)]
    tmp = os.path.join(out, '_' + s['id']); os.makedirs(tmp, exist_ok=True)
    p = run(['node', 'tools/preview.mjs', tmp] + [str(t) for t in ts])
    pngs = [os.path.join(tmp, f't{t:.2f}.png') for t in ts]
    hata = [l for l in p.stdout.splitlines() if 'HATA' in l or 'Error' in l]
    foy = os.path.join(out, f'{s["id"]}.png'); run(['python3', 'tools/sheet.py', foy] + pngs)
    print(f'{foy}   kareler: {", ".join(map(str, ts))}' + (f'   KONSOL HATASI: {hata}' if hata else ''))
print('\nModele gönder: out/foy/*.png + out/foy/dogrula.txt (+ varsa konsol hataları)')

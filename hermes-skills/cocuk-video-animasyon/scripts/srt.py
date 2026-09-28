# VO → altyazı (SRT). Kullanım: python3 tools/srt.py out/cues.json [out/<bolum>_tr.srt]
import json, sys
d = json.load(open(sys.argv[1]))
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'out/altyazi_tr.srt'
with open(OUT, 'w', encoding='utf-8') as f:
    for i, (a, b, t) in enumerate(d['vo'], 1): f.write(f'{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n')
print(OUT, len(d['vo']), 'satır')

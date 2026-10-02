# Final videodan sahne başına ~2 sn aralıkla kare çıkarır + kare başına VO/efekt bilgisi (build/kareler.json)
import json, subprocess, os
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
A = '../cocuk-kanali/ahtapot'
d = json.load(open(f'{A}/out/cues.json'))
out = []
for sc in d['scenes']:
    dur = sc['end'] - sc['start']; n = min(12, max(4, round(dur / 2)))
    for i in range(n):
        t = round(sc['start'] + (i + .5) * dur / n, 2)
        f = f'build/kareler/{sc["id"]}_{i:02d}.jpg'
        if not os.path.exists(f):
            subprocess.run([FF, '-loglevel', 'error', '-y', '-ss', str(t), '-i', f'{A}/out/ahtapot_final.mp4', '-frames:v', '1',
                            '-vf', 'scale=640:360:flags=lanczos', '-q:v', '4', f], check=True)
        vo = [v[2] for v in d['vo'] if v[0] - .3 <= t <= v[1] + .3]
        sfx = sorted({c['sfx'] for c in d['cues'] if abs(c['t'] - t) <= 1.0})
        out.append({'scene': sc['id'], 't': t, 'img': f, 'vo': vo, 'sfx': sfx})
json.dump(out, open('build/kareler.json', 'w'), ensure_ascii=False, indent=1)
print(len(out), 'kare')

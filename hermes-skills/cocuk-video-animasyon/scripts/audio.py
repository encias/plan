# Müzik + efekt sentezi (tamamen özgün, telifsiz — Content ID riski yok).
# Kullanım: python3 tools/audio.py out/cues.json out/muzik_sfx.wav
# Seslendirme (VO) aralıklarında müzik otomatik kısılır (ducking) → kendi sesini üstüne koyman yeterli.
import json, sys, wave
import numpy as np

SR = 48000
DUR = 180.0  # main() içinde cues.json'daki 'duration' ile güncellenir
N = int(SR * DUR)
R = np.random.default_rng(7)
TAU = 2 * np.pi


def ta(d): return np.arange(int(SR * d)) / SR
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def phase(f): return TAU * np.cumsum(f) / SR


def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.clip(np.minimum((f - lo) / (lo * .3 + 1), (hi - f) / (hi * .3 + 1)), 0, 1)
    return np.fft.irfft(X * m, len(x))


def noise(d): return R.standard_normal(int(SR * d))


# ---------- enstrümanlar ----------
def marimba(f, d=.7, v=1.):
    t = ta(d)
    y = np.sin(TAU * f * t) * np.exp(-t * 6.5) + .32 * np.sin(TAU * f * 4 * t) * np.exp(-t * 20) + .1 * np.sin(TAU * f * 9.8 * t) * np.exp(-t * 45)
    return y * np.minimum(1, t / .003) * v


def bell(f, d=1.6, v=1.):
    t = ta(d)
    y = np.sin(TAU * f * t) * np.exp(-t * 3) + .45 * np.sin(TAU * f * 2.76 * t) * np.exp(-t * 6) + .2 * np.sin(TAU * f * 5.4 * t) * np.exp(-t * 11)
    return y * np.minimum(1, t / .002) * v


def bass(f, d=.55, v=1.):
    t = ta(d)
    y = np.sin(TAU * f * t) + .35 * np.sin(TAU * 2 * f * t) + .12 * np.sin(TAU * 3 * f * t)
    y = np.tanh(1.4 * y) * np.exp(-t * 4.2) * np.minimum(1, t / .006)
    return y * v


def pad(freqs, d, v=1., det=.004):
    t = ta(d); L = np.zeros_like(t); Rr = np.zeros_like(t)
    for f in freqs:
        L += np.sin(TAU * f * (1 + det) * t) + .25 * np.sin(TAU * 2 * f * t)
        Rr += np.sin(TAU * f * (1 - det) * t) + .25 * np.sin(TAU * 2 * f * (1 + det / 2) * t)
    e = np.minimum(1, t / .45) * np.minimum(1, (d - t) / .6)
    return np.stack([L * e, Rr * e]) * v / len(freqs)


def kick():
    t = ta(.32); f = 45 + 85 * np.exp(-t * 28)
    return np.sin(phase(f)) * np.exp(-t * 11)


def snap():
    t = ta(.14)
    return band(noise(.14), 1200, 6000) * np.exp(-t * 34) * .8 + np.sin(TAU * 210 * t) * np.exp(-t * 40) * .3


def shaker(acc=1.):
    t = ta(.06)
    return band(noise(.06), 5000, 14000) * np.exp(-t * 70) * .5 * acc


def crash():
    t = ta(2.2)
    return band(noise(2.2), 3500, 15000) * np.exp(-t * 2.4) * .55


# ---------- efektler ----------
def sfx_pop():
    t = ta(.1); f = 250 + 750 * np.exp(-t * 30)
    return np.sin(phase(f)) * np.exp(-t * 32)


def sfx_whoosh(d=.6, lo=400, hi=3200):
    x = noise(d); t = ta(d); u = t / d
    bands = [band(x, c * .7, c * 1.4) for c in np.geomspace(lo, hi, 5)]
    pos = np.clip(np.sin(np.pi * u) * 4, 0, 4)
    y = np.zeros_like(t)
    for i, b in enumerate(bands): y += b * np.clip(1 - np.abs(pos - i), 0, 1)
    return y * np.sin(np.pi * u) ** 1.5 * .9


def blip(f0, f1, d=.075):
    t = ta(d); f = f0 + (f1 - f0) * np.sqrt(t / d)
    return np.sin(phase(f)) * np.sin(np.pi * t / d)


def place(buf, x, at, g=1.):
    x = x.copy(); fl = min(len(x) // 4, 480); x[-fl:] *= np.linspace(1, 0, fl)  # nota sonu tıklamasın
    i = int(at * SR); j = min(len(buf), i + len(x))
    if i < len(buf) and j > i: buf[i:j] += x[:j - i] * g


def seq(parts, d):
    y = np.zeros(int(SR * d))
    for x, at, g in parts: place(y, x, at, g)
    return y


def sfx_bubble(): return seq([(blip(320, 1300), 0, .8), (blip(420, 1600), .085, .6), (blip(360, 1450), .16, .45)], .3)
def sfx_ding(): return bell(1568, 1.4, .7) + np.pad(bell(2349, 1.2, .3), (0, int(SR * .2)))[:int(SR * 1.4)]
def thump(): t = ta(.3); return np.sin(phase(50 + 70 * np.exp(-t * 30))) * np.exp(-t * 13)
def sfx_heartbeat(): return seq([(thump(), 0, 1.), (thump(), .22, .7)], .6)
def sfx_tick(): t = ta(.08); return np.sin(TAU * 1900 * t) * np.exp(-t * 95) * .7 + np.sin(TAU * 950 * t) * np.exp(-t * 60) * .5
def sfx_click(): t = ta(.035); return np.sin(TAU * 2600 * t) * np.exp(-t * 180) * .8


def sfx_tada():
    parts = [(marimba(hz(m), .9, .8), i * .07, 1.) for i, m in enumerate([72, 76, 79])]
    parts += [(bell(hz(84), 1.6, .8), .21, 1.), (marimba(hz(84), 1.2, .6), .21, 1.), (sfx_shimmer() * .5, .2, 1.)]
    return seq(parts, 1.9)


def sfx_splat():
    t = ta(.55)
    return band(noise(.55), 60, 900) * np.exp(-t * 9) * 1.3 + np.sin(phase(70 + 170 * np.exp(-t * 9))) * np.exp(-t * 8) * .8


def sfx_jet():
    y = sfx_whoosh(1.1, 300, 2600) * 1.1
    for k in range(7): place(y, blip(300 + 90 * k, 1200 + 150 * k) * .35, .15 + k * .11)
    return y


def sfx_sparkle():
    notes = [96, 100, 103, 105, 108, 100, 103]
    return seq([(bell(hz(m), .5, .35), i * .065 + R.random() * .02, 1.) for i, m in enumerate(notes)], 1.)


def sfx_boing():
    t = ta(.7); f = 170 + 110 * np.sin(TAU * 9 * t) * np.exp(-t * 4) + 90 * t
    return np.sin(phase(f)) * np.exp(-t * 3.8) * .9


def sfx_swoosh_up():
    t = ta(.5); f = 350 * (1500 / 350) ** (t / .5)
    return np.sin(phase(f)) * np.sin(np.pi * t / .5) * .35 + sfx_whoosh(.5, 800, 5000) * .6


def sfx_magic():
    notes = [84, 86, 88, 91, 93, 96, 98, 100]
    y = seq([(bell(hz(m), .7, .4), i * .055, 1.) for i, m in enumerate(notes)], 1.6)
    return y + np.pad(sfx_shimmer() * .45, (0, int(SR * 1.6) - int(SR * 1.5)))


def sfx_drum():
    hits = []; tt = 0.; gap = .11; k = 0
    while tt < 1.0: hits.append((snap(), tt, .25 + .6 * tt)); tt += gap; gap = max(.035, gap * .88); k += 1
    hits += [(snap(), 1.08, 1.2), (kick(), 1.08, 1.)]
    return seq(hits, 1.5)


def sfx_squish():
    t = ta(.45)
    y = band(noise(.45), 100, 1400) * (.6 + .4 * np.sin(TAU * 17 * t)) * np.exp(-t * 6)
    return y + np.sin(phase(150 - 60 * t / .45 + 12 * np.sin(TAU * 20 * t))) * np.exp(-t * 5) * .6


def sfx_wrong():
    def tone(f, d):
        t = ta(d); ff = f * (1 - .06 * t / d)
        return (np.sin(phase(ff)) + .3 * np.sin(3 * phase(ff))) * np.minimum(1, t / .01) * np.exp(-t * 4)
    return seq([(tone(392, .28), 0, .6), (tone(311, .45), .24, .6)], .75)


def sfx_shimmer():
    t = ta(1.5); y = np.zeros_like(t); rr = np.random.default_rng(3)
    for _ in range(9): y += np.sin(TAU * rr.uniform(2200, 6000) * t) * (.5 + .5 * np.sin(TAU * rr.uniform(5, 11) * t + rr.random() * 6))
    return y / 9 * np.minimum(1, t / .25) * np.exp(-t * 2.2) * .8


SFX = {k[4:]: v for k, v in globals().items() if k.startswith('sfx_')}


# ---------- müzik ----------
BPM = 104; BEAT = 60 / BPM; BAR = 4 * BEAT; G0 = 10.0; END = 178.4; QUIET = []  # main() bölüm verisiyle (MUSIC) günceller
CHORDS = [  # (bas kökü, pad sesleri)
    (48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]
_ = None
MEL_A = [76, _, 79, 81, 79, _, 76, _, 74, _, 79, _, 74, 76, 74, _, 72, _, 76, _, 81, _, 79, 76, 77, _, 76, 74, 72, _, _, _]
MEL_B = [84, _, 81, _, 79, _, 76, _, 79, _, 74, _, 71, _, 74, _, 76, _, 72, _, 69, _, 72, 76, 77, _, 81, _, 79, _, _, _]


def groove_gain(t):
    # ritim yoğunluğu: G0'da başlar, QUIET aralıklarında kısılır/susar, END'de biter (final akoru muaf)
    k = [(0, 0), (G0 - .01, 0), (G0, 1)]
    for a, b, lvl in QUIET: k += [(a - .3, 1), (a, lvl), (b, lvl), (b + .15, 1)]
    k += [(END - .1, 1), (END + .1, 0), (DUR, 0)]
    xs, ys = zip(*k)
    return np.interp(t, xs, ys)


def build_music():
    L = np.zeros(N); Rr = np.zeros(N)
    def put(x, at, g=1., pan=0.):
        if x.ndim == 2: place(L, x[0], at, g); place(Rr, x[1], at, g); return
        place(L, x, at, g * (1 - max(0, pan))); place(Rr, x, at, g * (1 + min(0, pan)))
    # KANCA (0–10): gizemli minör ped + çıngıraklar + yükselen geçiş
    q = G0 / 4; hook = [([57, 60, 64], 0), ([53, 57, 60], q), ([50, 57, 62], 2 * q), ([52, 56, 59], 3 * q)]
    for notes, at in hook: put(pad([hz(m) for m in notes], q + .4, .5), at)
    rr = np.random.default_rng(11)
    for k in range(int(G0 / .66)):
        put(bell(hz(rr.choice([81, 84, 86, 88, 91, 93])), 1.4, .12), .3 + k * .62 + rr.random() * .1, 1., rr.uniform(-.6, .6))
    rise = sfx_whoosh(1.6, 200, 6000) * np.linspace(0, 1, int(SR * 1.6)) ** 2
    put(rise * .5, G0 - 1.6)
    put(crash(), G0, .8); put(kick(), G0, 1.)
    # ANA RİTİM
    FIN = G0 + np.ceil((END - G0) / BAR) * BAR  # final akoru: END'den sonraki ilk ölçü başı
    for b in range(int((FIN - G0) / BAR) + 1):
        t0 = G0 + b * BAR
        if t0 > FIN - .01: break
        root, voic = CHORDS[b % 4]
        put(pad([hz(m) for m in voic], BAR + .5, .3), t0)
        for bt in (0, 2): put(bass(hz(root), .55, .55), t0 + bt * BEAT)
        put(bass(hz(root + 7), .3, .3), t0 + 3.5 * BEAT)
        for bt in (0, 2): put(kick(), t0 + bt * BEAT, .55)
        for bt in (1, 3): put(snap(), t0 + bt * BEAT, .22)
        for e in range(8): put(shaker(1 if e % 2 else .6), t0 + e * BEAT / 2, .5, .3)
        phrase = b // 4
        if phrase % 4 != 3:  # her 4. cümle nefes: melodi yok
            mel = MEL_B if phrase % 4 == 2 else MEL_A
            for s in range(8):
                m = mel[(b % 4) * 8 + s]
                if m: put(marimba(hz(m), .6, .28), t0 + s * BEAT / 2, 1., -.15)
    # FİNAL akoru
    for i, m in enumerate([60, 64, 67, 72]): put(marimba(hz(m), 1.6, .4), FIN + i * .03)
    put(pad([hz(60), hz(64), hz(67)], 1.5, .35), FIN)
    tt = np.arange(N) / SR
    g = groove_gain(tt); g = np.where(tt < G0, 1.0, g)
    # final akoru groove_gain'den muaf
    g = np.where(tt >= FIN - .05, 1.0, g)
    return np.stack([L * g, Rr * g])


def main():
    cues_path, out = sys.argv[1], sys.argv[2]
    data = json.load(open(cues_path))
    global DUR, N, BPM, BEAT, BAR, G0, END, QUIET
    DUR = float(data.get('duration', DUR)); N = int(SR * DUR)
    mu = data.get('music') or {}
    BPM = mu.get('bpm', BPM); BEAT = 60 / BPM; BAR = 4 * BEAT
    G0, END, QUIET = mu.get('start', G0), mu.get('end', END), mu.get('quiet', QUIET)
    music = build_music()
    music /= np.sqrt(np.mean(music ** 2)) + 1e-9
    music *= 10 ** (-21 / 20)  # ~ -21 dBFS RMS
    # VO ducking
    tt = np.arange(N) / SR; duck = np.ones(N)
    for a, b, _ in data['vo']:
        duck = np.minimum(duck, np.interp(tt, [a - .35, a - .12, b + .15, b + .45], [1, .42, .42, 1], left=1, right=1))
    music *= duck
    sfx = np.zeros((2, N)); cache = {}
    for c in data['cues']:
        name = c['sfx']
        if name not in SFX: print('bilinmeyen sfx:', name); continue
        if name not in cache:
            x = SFX[name](); cache[name] = x / (np.max(np.abs(x)) + 1e-9)
        g = .32 * c.get('vol', 1)
        place(sfx[0], cache[name], c['t'], g); place(sfx[1], cache[name], c['t'], g)
    sfx *= .65 + .35 * (duck - .42) / .58  # konuşma anlarında efektler de %35 kısılır
    mix = music + sfx
    tt2 = np.arange(N) / SR
    mix *= np.interp(tt2, [0, .05, DUR - .8, DUR], [0, 1, 1, 0])
    mix = np.tanh(mix * 1.1) / 1.1  # yumuşak limit
    pk = np.max(np.abs(mix));
    if pk > .89: mix *= .89 / pk
    pcm = (mix.T * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(f'{out}  cue:{len(data["cues"])}  tepe:{20*np.log10(np.max(np.abs(mix))):.1f} dBFS  RMS:{20*np.log10(np.sqrt(np.mean(mix**2))):.1f} dBFS')


if __name__ == '__main__':
    main()

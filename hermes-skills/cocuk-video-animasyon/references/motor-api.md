# Motor API — core.js, octopus.js, main.js

Tuval 1920x1080, 30 fps. Koordinat: sol üst (0,0). Tüm fonksiyonlar global.

## Sahne kaydı
```js
registerScene({
  id: 's03_kalpler', start: T.s03[0], end: T.s03[1],
  transition: 'bubbles',            // varsayılan; 'cut' = kabarcık perdesi yok (özel geçiş yapıyorsan)
  cues: [{ t: 2.2, sfx: 'heartbeat', vol: .7 }],   // t = sahne içi saniye
  draw(ctx, lt, t) { ... }          // lt = sahne içi zaman (0'dan), t = mutlak zaman
});
```
- Kabarcık geçişi sahne sınırında ±0.42 sn ekranı kapatır ve "whoosh" sesi otomatik eklenir.
- `main.js` her karede transform, alpha, composite ve lineDash'i sıfırlar; yine de `save/restore` dengeli olmalı.
- Sahne içi hata yakalanır ve konsola yazılır. `tools/tara.mjs` bunları raporlar.

## Sabitler
- `W, H, FPS`. Bölüm verisi (`bolum.js`): `DURATION, T, VO, FACTS, MUSIC, EKLER, SAHNELER`.
- `PAL` renkleri: `navy` (kontur/yazı), `sea1..3`, `foam/foam2`, `sand/sand2/sand3`, `octo/octoDark/octoLight/sucker`, `blush`, `yellow/yellowDark`, `mint`, `coral`, `pink`, `purple`, `inkCloud`, `heart`, `blueBlood`, `redBlood`, `white`, `seaweed/seaweed2`, `rock/rock2`. Palet dışına çıkma; türev için `mix/shade`.
- `SFX` (izinli efektler): `pop whoosh bubble ding heartbeat tick tada splat jet sparkle boing swoosh_up magic click drum squish wrong shimmer`.

## Zaman / animasyon
| Fonksiyon | Döner | Kullanım |
|---|---|---|
| `prog(t, a, b)` | 0..1 | a→b aralığında doğrusal ilerleme (kırpılmış) |
| `ease.out / in / inOut / smooth / outBack / outElastic / inBack(p)` | 0..1 | ilerlemeyi yumuşat |
| `pop(t, start, dur=.45)` | 0 → ~1.1 → 1 | zıplayarak belirme ölçeği; start'tan önce 0 |
| `win(t, a, b, fin=.3, fout=.3)` | 0..1 | [a,b] aralığında görünürlük (yumuşak giriş/çıkış) |
| `beat(t, bpm=80)` | 0..~1 | kalp atışı "lub-dub" darbesi |
| `lerp, clamp, TAU` | | |
| `rng(seed)` | fonksiyon | deterministik rastgele: `const r = rng(5); r()` |
| `hash(n)` | 0..1 | tek seferlik deterministik değer |

Kalıp: `const sc = pop(lt, 2.0) * (1 - ease.in(prog(lt, 6.0, 6.3)));  if (sc > 0) { ... scale(sc) ... }`

## Renk
`mix(a, b, k)`, `shade(c, ±k)` (+ açık, − koyu), `rgba(c, alpha)`. Kontur rengi kuralı: `shade(dolgu, -.42)`.

## Şekil (yol oluşturur, sonra `fill/stroke` sen çağırırsın)
`rrect(ctx,x,y,w,h,r)`, `heartPath(ctx,x,y,s)`, `starPath(ctx,x,y,r,n=5,inner=.48)`, `dropPath(ctx,x,y,s)` (sivri uç yukarıda).
Hazır çizenler: `bubble(ctx,x,y,r,alpha)`, `softShadow(ctx,x,y,rx,ry,alpha)` (yere gölge).

## Yazı (Baloo 2, kalın konturlu çocuk başlığı)
- `txt(ctx, s, x, y, {size, fill, stroke, sw, weight, align, alpha, scale, rot, shadow})`. Merkez hizalı; `sw` = kontur kalınlığı (varsayılan size×0.17). `sw:0, shadow:false` = düz yazı.
- `popWords(ctx, s, x, y, lt, start, {size, fill, stagger=.12})`: kelimeler sırayla zıplar.
- `pill(ctx, s, x, y, {size, fill, color, scale, alpha, border})`: hap etiket.
- `callout(ctx, x1, y1, x2, y2, s, p, opts)`: noktalı çizgi + etiket; `p` 0..1 (çizgi 0–.6, etiket .6–1).
- `measure(ctx, s, size)`: piksel genişlik.
- Türkçe karakterlerin hepsi fontta var. **₂ gibi alt simge yok**: "O" + küçük "2" ayrı çiz.

## Sahne öğeleri
- `factBadge(ctx, n, 'BAŞLIK', lt, dur)`: sol üst numaralı yıldız rozeti; her bilgi sahnesinde zorunlu.
- `drawOcean(ctx, t, {depth 0..1, floor=true, floorY=900, seaweed=true, rays=true, camX=0, bubbles=true, particles=true})`: arka plan. `depth` = derinlik (ışık azalır), `camX` = yatay pan (parallax).
- `drawProgress` ve `bubbleWipe` otomatiktir; çağırma.

## Güvenli alanlar
- Sol üst **x<950, y<210**: rozet. Sağ üst **x>1440, y<150**: ilerleme yıldızları. Kenarlardan **80 px** içeride kal.
- Ana karakter için tipik yer: x 700–1250, taban y 650–900.

## Oki — `drawOki(ctx, x, y, s, o, t)`
`(x, y)` = kolların birleştiği taban noktası. `s=1` → kafa ~220 px yüksek, kafa tepesi `y − 210·s`; kollar ~180·s aşağı uzanır.
Tipik ölçek: tek başına 1.5–1.9; panel içinde 0.6–0.9.

| Parametre | Değerler |
|---|---|
| `pose` | `'idle' 'swim' 'walk' 'squeeze' 'cheer'` veya `blendPose('idle','cheer',k)` / `okiPose(ad)` nesnesi |
| `eye` | `'open' 'happy' 'closed' 'surprised'`; `blink` 0..1 (verilmezse otomatik kırpar, `seed` ile faz) |
| `mouth` | `'smile' 'open' 'grin' 'o' 'flat' 'wavy'` |
| `brow` | `null 'worried' 'determined' 'raised'` |
| `look` | `{x, y}` −1..1 (göz bebeği yönü; ilgili nesneye baktır) |
| `color`, `alpha`, `blush` 0..1 | renk değiştirme (kamuflaj), saydamlık, yanak |
| `rot`, `sx`, `sy` | dönme, esneme/sıkışma (tabana göre) |
| `xray` 0..1, `hearts` `{bpm, mainStop 0..1, flow, highlight:'gill'|'main'}` | içini gösterir: 3 kalp, solungaç, mavi kan akışı |
| `neuro` 0..1 | kollarda sinir parıltısı + beyin |
| `bumps` 0..1, `mottle` `{color, amount, seed}` | deri tümsekleri, kamuflaj lekeleri |
| `waveArm` 0..1 | sağ dış kol (7) el sallar |
| `reach` `{arm, x, y, p}` | kol yerel hedefe uzanır; hedefi `okiLocal(dünyaX, dünyaY, x, y, s, o)` ile çevir |

Kol sırası: 0–3 arka (soldan sağa), 4 sol dış, 5 sol iç, 6 sağ iç, 7 sağ dış.
Yardımcılar: `okiPoint('mainHeart'|'gillHeartL'|'gillHeartR'|'gillL'|'gillR'|'brain'|'eyeL'|'eyeR'|'mouth'|'beak'|'headTop'|'headCenter'|'base', x, y, s, o)` → dünya koordinatı; `okiArmPoint(i, u 0..1, x, y, s, o, t)` → kolun u noktası (u=1 uç). `drawBeak(ctx, x, y, boyut, alpha)`.
Oki'yi hareket ettirirken aynı `t` kaynağını kullan (lt ya da t); karışırsa göz kırpma ve kol dalgası sıçrar.

## Araçlar
| Komut | İş |
|---|---|
| `node tools/preview.mjs <klasör> <t1> <t2>… [--full] [--page=karakter.html]` | tek kare PNG (varsayılan 960x540) + konsol hataları |
| `python3 tools/sheet.py çıktı.png a.png b.png …` | 2 sütunlu temas föyü |
| `node tools/cues.mjs` | `out/cues.json` (sahne, VO, efekt, süre, müzik) |
| `python3 tools/dogrula.py` | render öncesi denetim (çıkış kodu 1 = hata) |
| `node tools/tara.mjs [--fps=10]` | tüm bölüm: JS hatası + boş kare |
| `node tools/render.mjs [--from --to --workers=4]` | MP4 (sessiz) |
| `python3 tools/audio.py out/cues.json out/muzik_sfx.wav` | müzik + efekt |
| `python3 tools/srt.py out/cues.json` | altyazı |
Tarayıcıda canlı izleme: `index.html#play`, belirli an: `index.html#t=95`.

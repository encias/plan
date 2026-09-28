# Nasıl Çalışır: İnceleme Rehberi

Video bir AI video modeliyle üretilmedi. Her kare **kodla çiziliyor**: tarayıcıda Canvas 2D, Chromium ile kare kare render, ffmpeg ile MP4. Müzik ve efektler de kodla sentezleniyor (numpy). Dışarıdan hiçbir görsel, video ya da ses dosyası kullanılmıyor. Tek dış kaynak Baloo 2 fontu (SIL Open Font License, ticari kullanım serbest).

## Üretim hattı

```
1. Konu + bilimsel doğrulama
2. Seslendirme metni, zaman kodlu        → js/core.js  VO dizisi
3. Storyboard, sahne başına              → docs/STORYBOARD.md
4. Sahne kodu                            → js/scenes/sXX_*.js   (sahne sözleşmesi: docs/SAHNE_BRIFI.md)
5. Görsel kalite kontrolü (temas föyü)   → tools/preview.mjs + tools/sheet.py
6. Görüntü render                        → tools/render.mjs    → out/video_sessiz.mp4 + out/cues.json
7. Müzik + efekt                         → tools/audio.py      → out/muzik_sfx.wav (VO'ya göre ducking)
8. Altyazı                               → tools/srt.py        → out/ahtapot_tr.srt
9. Birleştirme                           → ffmpeg              → out/ahtapot_final.mp4
```

## Dosya haritası (inceleme sırası önerisi)

| Dosya | Satır | Ne yapar | Kim yazdı |
|---|---|---|---|
| `js/core.js` | 343 | Palet, zaman çizelgesi (`T`), seslendirme (`VO`), SFX listesi, easing, yazı, rozet, okyanus arka planı, kabarcık geçişi, ilerleme göstergesi | Ana oturum |
| `js/octopus.js` | 339 | Oki karakteri: 8 kol (omurga eğrisi + dalga), yüz ifadeleri, röntgen (3 kalp + kan akışı), nöron parıltısı, kamuflaj, pozlar | Ana oturum |
| `js/main.js` | 31 | Sahne yöneticisi: `renderFrame(t)`, geçişler, cue toplama | Ana oturum |
| `js/scenes/s01, s02, s10` | 62/56/122 | Kanca, başlık, kapanış (stil referansı) | Ana oturum |
| `js/scenes/s03–s05` | 254–338 | Kalp, kan, kollar | Alt ajan A |
| `js/scenes/s06–s09` | 230–514 | Soru, kamuflaj, mürekkep, zekâ | Alt ajan B |
| `tools/render.mjs` | 40 | 4 paralel Chromium sekmesi → JPEG → x264 (CRF 18) | Ana oturum |
| `tools/audio.py` | 276 | Marimba/bas/ped/davul sentezi, 18 efekt, VO ducking, limitleme | Ana oturum |
| `karakter.html` | — | Karakter sayfası: Oki'nin tüm pozları tek ekranda | Ana oturum |
| `thumbnail.html` | — | Küçük resim kompozisyonu | Ana oturum |

## Otomatik kontroller (yapıldı)
- `Math.random` yok. Tüm rastgelelik tohumlu (`rng`, `hash`), aynı saniye her zaman aynı kareyi üretiyor.
- Sahneler arasında global fonksiyon adı çakışması yok (her sahne kendi önekini kullanıyor: `s07_…`).
- 180 saniyenin tamamı saniyede 10 kare taranarak (1800 kare) konsol hatası olmadan çizildi; tam render 5400 kareyi tamamladı.
- 147 efekt cue'sunun tamamı izinli listede. 0.12 sn'den yakın çakışma yok.
- Ses: tepe −2.6 dBFS, DC yok, NaN yok. Seslendirme alanlarında müzik ≈ −7.5 dB, efektler ≈ −3.7 dB kısılıyor.

## Bilinen zayıflıklar (dürüst liste)
- **Ses kulakla dinlenmedi.** Sadece ölçümle doğrulandı. Müzik basit bir I–V–vi–IV döngüsü: işlevsel ama sıradan. Seri büyürse lisanslı bir çocuk müziği paketiyle değiştirmek kaliteyi artırır.
- **Alt ajan sahneleri daha uzun ve daha "el yapımı".** Bazı yardımcı çizimler (balık, kavanoz, el) sahne dosyalarına gömülü. Bunlar ikinci bölümde tekrar kullanılacaksa `js/props.js` gibi ortak bir dosyaya taşınmalı.
- **Seslendirme yok.** Zaman kodları, doğal konuşma hızının (≈2.3 kelime/sn) tahminine dayanıyor. Gerçek kayıtta ±0.3 sn kayma normal. Büyük kayma olursa `VO` dizisi güncellenip yeniden render edilir.
- **Tek dil (Türkçe).** İngilizce sürüm için `VO` ve ekran yazıları değişmeli. Görsel yapı aynı kalır.

## Yerel kurulum (Mac/Windows/Linux)

```bash
cd cocuk-kanali/ahtapot
npm install && npx playwright install chromium
pip install numpy pillow imageio-ffmpeg
node tools/preview.mjs /tmp/onizleme 20 50 100    # tek kare önizleme
node tools/render.mjs                              # tam render (~4–8 dk, işlemciye bağlı)
```
Kendi Chrome'unu kullanmak için: `CHROME_PATH=/yol/chrome node tools/render.mjs`
Tarayıcıda canlı izleme: `index.html#play` ya da belirli saniye için `index.html#t=95`.

---
name: cocuk-video-animasyon
description: Senaryosu hazır (js/bolum.js + docs/STORYBOARD.md) çocuk eğitim bölümünü kodla canlandırır — Canvas 2D sahneler, Oki karakter motoru, Chromium ile kare kare render, sentez müzik/efekt, ffmpeg ile 1080p MP4. Bölüm klasörü kurma, sahne yazma, görsel kalite kontrolü (önizleme karelerine bakarak), render ve ses birleştirmeyi kapsar. "Animasyonu yap", "sahneleri kodla", "bölümü render et", "videoyu üret" isteklerinde kullan. Önce cocuk-video-senaryo çıktısı gerekir. Görsel okuyabilen model ve terminal erişimi şart.
license: Özel kullanım. Font Baloo 2 — SIL OFL 1.1.
compatibility: Node 18+, Python 3.10+, Playwright + Chromium, numpy, pillow, imageio-ffmpeg. Görsel (vision) girdi okuyabilen model gerekir; yoksa kalite kontrol döngüsü çalışmaz.
metadata:
  seri: "Oki'nin Deniz Kaşifleri"
  surum: "1.0"
---

# Çocuk Video Animasyonu

Bu skill bir **yapım hattıdır**, serbest çizim değil. Karakter, palet, yazı stili, geçişler, müzik ve render motoru sabittir. Her bölümde değişen sadece `js/bolum.js` (senaryo verisi) ve `js/scenes/*.js` (sahneler). Kalite bu ayrımdan gelir: motor tutarlı olduğu için 10. bölüm 1. bölümle aynı seride görünür.

## Değişmez kurallar (nedenleriyle)
1. **`js/core.js`, `js/octopus.js`, `js/main.js`, `tools/audio.py` dosyalarını değiştirme.** Bunlar serinin kimliği; bir bölüm için değiştirilirse eski bölümlerle tutarsızlık doğar. Eksik bir yardımcı gerekiyorsa `js/props.js` ya da sahne dosyasında öneklerle yaz (`EKLER` ile yüklenir). `tools/dogrula.py` motor değişikliğini yakalar.
2. **Deterministik çizim:** `Math.random` yasak; `rng(seed)` / `hash(n)` kullan. Render 4 paralel sekmede yapılır; aynı saniye her sekmede aynı kareyi vermezse video titrer.
3. **Görsel kontrol olmadan sahne "bitti" sayılmaz.** Kod doğru çalışıp yanlış görünebilir (üst üste binen yazı, ekran dışı nesne, boş ekran). Her sahne için önizleme karelerine bakmak zorunlu.
4. **Ekran yazısı ≤ 3 kelime, BÜYÜK HARF.** İzleyici okuma bilmiyor; yazı sadece vurgu.
5. **Her görsel, o anki seslendirme satırının anlamını göstermeli.** Süs değil, anlatım.

## İş akışı

### 0. Kurulum (bir kez / her yeni bölümde)
```bash
bash <bu-skill>/scripts/yeni_bolum.sh bolumler/02-yunus
cd bolumler/02-yunus && npm install && npx playwright install chromium
pip install numpy pillow imageio-ffmpeg
```
Senaryo çıktısını yerleştir: `js/bolum.js`, `docs/STORYBOARD.md`. Sonra:
```bash
node tools/cues.mjs && python3 tools/dogrula.py      # zaman çizelgesi ve VO denetimi
```

### 1. Oku (atlama)
- `references/motor-api.md` — tüm fonksiyonlar, Oki parametreleri, güvenli alanlar.
- `references/sahne-sozlesmesi.md` — sahne dosyası kuralları ve görsel dil.
- `references/ornek-sahneler/` — `s01_hook.js`, `s02_title.js`, `s10_outro.js` (kısa, referans stil) ve `s03_hearts.js` (uzun bilgi sahnesi). Yeni sahneler bu yoğunlukta ve bu dilde olmalı.

### 2. Konuk karakter (bölümün hayvanı Oki değilse)
`js/karakterler/<hayvan>.js` yaz: `draw<Hayvan>(ctx, x, y, s, o, t)` — Oki ile aynı parametre mantığı (eye, mouth, look, blink otomatik, alpha, rot, sx, sy) ve aynı görsel dil: düz dolgu, kontur = `shade(dolgu, -.42)`, beyaz parlama elipsi, iki parlamalı iri gözler, `PAL.blush` yanaklar. `bolum.js` → `EKLER = ['karakterler/<hayvan>']`.
Önce **karakter sayfası** yap (`karakter.html` kalıbı: 4–6 poz/ifade tek ekranda), `--page=karakter.html` ile önizle, bak, düzelt. Karakter oturmadan sahneye geçme; sonradan karakter düzeltmek bütün sahneleri etkiler.

### 3. Sahneleri yaz — sahne sahne, her biri için döngü
```
yaz → node tools/preview.mjs /tmp/pv <6 an> → python3 tools/sheet.py /tmp/pv/f.png /tmp/pv/*.png → görseli OKU → düzelt → bir kez daha bak
```
- Önizleme anlarını storyboard vuruşlarından seç (her vuruşun ortası). 960x540 temas föyü token tasarrufu içindir; tek kare detayı gerekirse `--full`.
- Bakarken `references/kalite-kontrol.md` listesini uygula. En çok görülen kusurlar: yazının karakterle/rozetle çakışması, nesnenin ekran dışına taşması, 3 sn'den uzun boş ekran, ifadenin anlatıyla uyumsuz olması.
- Sahne başına en fazla 2 düzeltme turu; üçüncüde sorun sürüyorsa sahneyi sadeleştir.
- **Paralel çalışma** (alt ajan varsa): önce S1, S2 ve S10'u kendin yaz (stil çapası). Kalan bilgi sahnelerini en fazla 2 ajana böl. Her ajana `sahne-sozlesmesi.md` + kendi storyboard bölümü + VO satırları ver. Ajanlar ortak dosyalara dokunmasın. Dönüşte her sahneye kendin bak.

### 4. Bütün denetim (render'dan önce zorunlu)
```bash
node tools/cues.mjs && python3 tools/dogrula.py   # GEÇTİ olmalı
node tools/tara.mjs                               # tüm bölüm 10 fps: JS hatası + boş kare
```

### 5. Render + ses + birleştirme
```bash
node tools/render.mjs                                   # → out/video_sessiz.mp4 (4 sekme paralel, ~4–8 dk)
python3 tools/audio.py out/cues.json out/muzik_sfx.wav   # müzik + efekt, VO anlarında otomatik kısma
python3 tools/srt.py out/cues.json out/<bolum>_tr.srt
ffmpeg -i out/video_sessiz.mp4 -i out/muzik_sfx.wav -c:v copy -c:a aac -b:a 192k -movflags +faststart out/bolum_final.mp4
```
ffmpeg yoksa: `python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"` yolunu kullan.

### 6. Son kontrol
- Final MP4'ten 8 kare çıkar (`ffmpeg -ss <t> -i out/bolum_final.mp4 -frames:v 1 ...`), temas föyüne bak: renkler, yazılar, geçişler doğru mu.
- Süre = `DURATION`, video 1920x1080 30fps, ses 48 kHz stereo.
- Ses seviyesi: `audio.py` çıktısında tepe ≤ −1 dBFS. Müzik ve efektleri **mutlaka bir insan dinlemeli**; ölçüm "kulağa hoş" olduğunu kanıtlamaz.

## Yapma
- Motor dosyasını "küçük bir düzeltme" için değiştirme; önce `props.js` / sahne içi çözüm ara.
- Sahneyi görmeden "tamamlandı" deme; kodun hatasız çalışması doğru göründüğü anlamına gelmez.
- Yapay zekâ ile üretilmiş dış görsel/video/müzik ekleme: tutarlılık bozulur, telif ve "inauthentic content" riski doğar.
- Tüm sahneleri tek seferde yazıp sonra kontrol etme; hata birikir. Sahne sahne ilerle.
- Ekrana cümle yazma; seslendirme metnini ekrana kopyalama.

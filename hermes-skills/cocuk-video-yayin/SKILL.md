---
name: cocuk-video-yayin
description: Tamamlanmış çocuk eğitim animasyonu için YouTube yayın paketini hazırlar — başlık, açıklama, bölüm zaman damgaları, etiketler, thumbnail kompozisyonu ve dışa aktarımı, Türkçe SRT, "çocuklara uygun" (Made for Kids) ayarları, Shorts kesiti, seslendirme kayıt talimatı ve seri planı. "Yayın paketi", "YouTube başlığı/açıklaması", "thumbnail yap", "Shorts çıkar", "yüklemeye hazırla" isteklerinde kullan. Video üretmez (cocuk-video-animasyon), senaryo yazmaz (cocuk-video-senaryo).
license: Özel kullanım
metadata:
  seri: "Oki'nin Deniz Kaşifleri"
  surum: "1.0"
---

# Çocuk Video Yayın Paketi

Girdi: bölüm klasörü (`js/bolum.js`, `docs/STORYBOARD.md`, `out/bolum_final.mp4`, `out/cues.json`).
Çıktı: `YAYIN_PAKETI.md`, `out/thumbnail.png` (1280x720), `out/<bolum>_tr.srt`, isteğe bağlı `out/short_<bolum>.mp4`.
Tam örnek: `references/ornek-yayin-paketi-ahtapot.md` — biçimi ve tonu buradan al.
Platform kuralları ve nedenleri: `references/youtube-cocuk-kurallari.md` — **her pakette oku**; kurallar değişebilir, emin olmadığın maddeyi YouTube Yardım Merkezi'nden doğrula.

## 1. Seslendirme kayıt talimatı
- Pakete `VO` dizisinden zaman kodlu tablo koy (zaman | metin). Soru/oyun satırlarına "(sonra 1.5 sn sus)" notu ekle.
- Varsayılan öneri **insan sesi**: telefon + sessiz oda yeterli; SRT açıkken oynat, altyazı çıkınca oku; kurgu programında 00:00'a hizala; hedef −16 LUFS.
- AI ses tercih edilirse: aynı tabloyu kullan, satır başlangıçlarına sadık kal; sesin tüm seride aynı olması şart.

## 2. Başlık
Formül: **`<Şaşırtıcı bilgi cümlesi>! <emoji> <Hayvan>'ın 7 Süper Gücü | Çocuklar İçin Eğitici Çizgi Film`**
- İlk 40 karakter tek başına merak uyandırmalı (mobilde kesilir). ≤ 100 karakter.
- Başlıktaki bilgi = S3'teki bilgi = thumbnail'daki bilgi. Üçü aynı vaadi verir; vaat ilk 45 sn'de karşılanır.
- Abartı/yalan yok ("ŞOK!", "KİMSE BİLMİYOR") — çocuk içeriğinde sansasyonel başlık düşük kalite sayılır ve gelirini düşürür.

## 3. Açıklama
- İlk 2 cümle (≈150 karakter): konunun sorusu + vaat. Arama bu kısmı okur.
- Bölüm zaman damgaları `T`'den: ilk satır `00:00`, en az 3 satır, her bölüm ≥ 10 sn. Biçim: `01:30 4. Soru zamanı: Kemiksiz beden`.
- Tek cümle hedef kitle + "bilimsel olarak doğrulanmış bilgiler" (KAYNAKLAR.md varsa).
- 3 hashtag, fazlası değil.

## 4. Etiketler
10–15 etiket: hayvan adı varyasyonları, "<hayvan> çocuklar için", bilginin kendisi ("ahtapotun 3 kalbi"), kategori ("deniz hayvanları", "eğitici çizgi film", "okul öncesi"). Kanal adı ve seri adı dahil.

## 5. Thumbnail
Bölüm klasöründeki `thumbnail.html` kompozisyonunu yeni bölüme göre yeniden yaz (`renderFrame` içi), sonra:
```bash
node tools/preview.mjs /tmp/th 0 --full --page=thumbnail.html
python3 -c "from PIL import Image; im=Image.open('/tmp/th/t0.00.png').convert('RGB'); im.resize((1280,720),Image.LANCZOS).save('out/thumbnail.png',optimize=True); im.resize((168,94),Image.LANCZOS).save('/tmp/th/kucuk.png')"
```
Kurallar (nedenleriyle):
- **≤ 3 kelime, dev puntoda** — telefonda 168 px genişlikte okunmalı. `kucuk.png`'ye bak; okunmuyorsa kelimeyi azalt/büyüt.
- **Karakterin yüzü güçlü bir duyguyla** (şaşkın, sevinçli) — çocuklar yüze tıklar.
- **Tek görsel vaat**, başlıkla aynı bilgi. Videoda olmayan bir şey gösterme (yanıltıcı thumbnail = düşük kalite).
- Yüksek kontrast: parlak arka plan + koyu konturlu yazı + ok/vurgu tek bir öğede.
- Dosya ≤ 2 MB, 1280x720, 16:9.

## 6. Altyazı
`python3 tools/srt.py out/cues.json out/<bolum>_tr.srt` → YouTube'a Türkçe altyazı olarak yükle (erişilebilirlik + arama).

## 7. Shorts (isteğe bağlı, önerilir)
En iyi aday: S6 soru sahnesi (soru → geri sayım → cevap tek başına tamamlanmış bir hikâye).
```bash
ffmpeg -ss <S6 başı> -t <S6 süresi> -i out/bolum_final.mp4 -filter_complex "[0:v]split[a][b];[a]scale=1080:1920,boxblur=24[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" -c:a copy out/short_<bolum>.mp4
```
Başlık: sahnedeki soru + "#shorts". Açıklamada uzun videoya bağlantı.

## 8. Yükleme ayarları (pakette madde madde yaz)
- Kitle: **"Evet, çocuklara uygun"** — zorunlu; neden ve sonuçları kurallar dosyasında.
- Kategori: Eğitim. Dil: Türkçe. Altyazı: SRT.
- Sentetik içerik beyanı: kod ile çizilmiş, gerçekçi olmayan animasyon için gerekmez (gerçekçi AI görüntü/ses kullanıldıysa gerekir).
- Oynatma listesi: seri listesine ekle.

## 9. Seri planı (paketin sonunda 3–5 madde)
Sonraki bölüm (kapanışta söz verilen), Shorts takvimi, 5–6 bölümde bir 15–20 dk derleme.

---
name: cocuk-video-senaryo
description: Çocuk YouTube kanalı (4–8 yaş, Türkçe) için 3 dakikalık eğitici animasyon bölümünün konusunu seçer, bilgileri kaynakla doğrular, zaman kodlu seslendirme metnini ve sahne sahne storyboard'u yazar; çıktıyı animasyon motorunun okuduğu js/bolum.js formatında verir. "Yeni bölüm", "bölüm konusu", "çocuk videosu senaryosu", "seslendirme metni", "storyboard" isteklerinde kullan. Kod/animasyon yazmaz (o iş cocuk-video-animasyon), YouTube başlık/thumbnail işi yapmaz (o iş cocuk-video-yayin).
license: Özel kullanım
metadata:
  seri: "Oki'nin Deniz Kaşifleri"
  surum: "1.0"
  ornek_bolum: "Ahtapotun 3 Kalbi Var! (references/ornek-*)"
---

# Çocuk Video Senaryosu

Amaç: bir çocuğun 3 dakika boyunca ekrandan kopmadığı, ebeveynin "bunu izlesin" dediği ve bilgileri **doğru** olan bir bölüm planı. Senaryo videonun kalitesinin yarısıdır. Animasyon ne kadar iyi olursa olsun, zayıf bir senaryo "AI slop" olarak algılanır.

## Çıktılar (üçü de zorunlu)
1. `js/bolum.js` — `assets/bolum_sablonu.js` kalıbıyla: `DURATION`, `T`, `VO`, `FACTS`, `MUSIC`, `SAHNELER`. Animasyon motoru bunu doğrudan okur; format bozulursa hiçbir şey çalışmaz.
2. `docs/STORYBOARD.md` — sahne başına 2–4 saniyelik vuruşlar (beat): ekranda ne var, Oki ne hissediyor, ekran yazısı (≤3 kelime), efekt sesi.
3. `docs/KAYNAKLAR.md` — her bilgi için en az 2 güvenilir kaynak (link + tek cümle alıntı/özet).

Tam örnek: `references/ornek-bolum-ahtapot.js` ve `references/ornek-storyboard-ahtapot.md`. **Yeni bölüme başlamadan önce ikisini de oku**. Kalite çıtası odur.

## Adımlar

### 1. Konu seç
Konu şu 5 şartı sağlamalı; sağlamıyorsa başka konu seç:
- **7 şaşırtıcı ve doğrulanabilir bilgi** çıkıyor (az çıkıyorsa konu zayıf).
- Bilgiler **görselleştirilebilir** (kalp, renk, hareket, karşılaştırma). "Soyut istatistik" olanlar değil.
- Başlıkta aranan bir ifade var ("ahtapot", "yunus", "köpekbalığı"…).
- Serinin formatına uyuyor (Oki bir deniz kaşifi; konuk hayvan tanıtılır).
- Önceki bölümün kapanışında söz verilen konuysa **önce o** yapılır (seri güveni).

### 2. Bilgileri doğrula
- Her bilgi için 2 bağımsız güvenilir kaynak: ansiklopedi, üniversite, akvaryum/müze, hakemli makale. Blog/içerik çiftliği sayılmaz.
- Kaynaklar çelişiyorsa ya da bilgi "bazı türlerde" geçerliyse metin bunu söyler: "Bazı ahtapotlar…", "Bilim insanları düşünüyor ki…". Kesin olmayanı kesinmiş gibi söyleme.
- Çocuğu yanıltacak basitleştirme yapma. Basitleştir ama yanlışlama: "sekiz küçük beyin gibi" (metafor) doğru; "sekiz beyni var" yanlış.
- Kavramı çocuğun dünyasına bağla: "Bizim kanımızda demir var, bu yüzden kırmızı."

### 3. Yapıyı kur
`references/format.md` içindeki 180 saniyelik iskeleti kullan: kanca → tanıtım → 7 süper güç (biri soru, biri oyun) → özet + sonraki bölüm. İskelet serinin kimliğidir; sadece içerik değişir.

### 4. Seslendirmeyi yaz (VO)
Kurallar ve **nedenleri**:
- **Konuşma hızı ortalama 2.3 kelime/sn, en fazla 2.8.** Çocuk anlatıcı yavaş ve net konuşur. Hızlı metin, seslendirmede ya yetişmez ya da çocuk kaçırır. `tools/dogrula.py` 2.8'i aşarsa uyarır, 3.1'i aşarsa reddeder.
- **Cümle ≤ 12 kelime, her cümlede tek fikir.** 4–8 yaş çalışma belleği kısa.
- **Satır süresi = kelime / 2.3 + 0.3 sn.** Satırlar arasında en az 0.2 sn nefes.
- **Bir satır sahne sınırını geçemez.** Sahne başındaki ilk 0.4 sn ve sonundaki son 0.4 sn kabarcık geçişiyle kapalı; o aralığa önemli söz koyma.
- **Çocukla konuş:** "Sence…?", "Düşünsene…", "Hadi bakalım…". Soru sonrası 1–2 sn boşluk bırak (çocuk cevap versin).
- **Teknik terim ekrana ve metne girmez** (hemosiyanin, kromatofor). Onun yerine sonucu söyle ("bakır kanı maviye boyar").
- **Her bilgi sahnesi aynı kalıpla açılır:** "Birinci süper güç: …". Tekrar eden kalıp, çocuğa nerede olduğunu hissettirir.
- **Kapanış sözlü çağrıyla biter:** "Bir sonraki bölümde: …". "Çocuklara uygun" videoda yorum ve bitiş ekranı kapalıdır; "yorum yaz", "abone ol butonuna bas" işe yaramaz.

### 5. Storyboard'u yaz
Her sahne için 2–4 sn'lik vuruşlar. Her vuruş şunları söyler: **zaman aralığı**, **ekrandaki ana görsel fikir** (tek bir fikir), **Oki'nin ifadesi**, **ekran yazısı** (≤3 kelime, BÜYÜK HARF), **efekt** (motorun SFX listesinden).
- Görsel, VO satırının **anlamını** göstermeli; sadece süslememeli. "Bakır kanı maviye boyar" → bakır parçacıkları damlaya girer, damla maviye döner.
- Her 2–4 sn'de bir değişim: yeni öğe, kamera hareketi, ifade değişimi. 6 sn'den uzun durağan ekran yok.
- Soyut bilgiyi karşılaştırmayla göster (iskeletli balık ↔ iskeletsiz Oki; çocuk eli ↔ ahtapot kolu).

### 6. bolum.js'i doldur ve kendini denetle
- `T` aralıkları boşluksuz ve 0'dan `DURATION`'a kesintisiz olmalı. `SAHNELER` dizisindeki adlar `T` anahtarlarıyla aynı sırada (`s03` → `s03_kalpler`).
- `FACTS` = 7 bilgi sahnesinin `T` aralıkları (ilerleme yıldızları).
- `MUSIC.quiet` = müziğin susacağı/kısılacağı anlar (geri sayım, saklambaç). `MUSIC.start` = karakterin ortaya çıktığı an (ritim orada başlar).
- Animasyon ortamı kuruluysa `node tools/cues.mjs && python3 tools/dogrula.py` çalıştır. Kurulu değilse süre/hız hesaplarını elle kontrol et.

## Teslim öncesi kontrol listesi
- [ ] 7 bilginin her birinin `KAYNAKLAR.md`'de 2 kaynağı var; belirsiz olan yumuşatıldı.
- [ ] İlk 10 sn'de merak sorusu var (kim/ne/neden?) ve cevap hemen verilmiyor.
- [ ] En az 1 soru-cevap (geri sayımlı) ve 1 oyun ("… nerede?") anı var.
- [ ] Hiçbir VO satırı 2.8 kelime/sn'yi aşmıyor; sahne sınırını geçmiyor.
- [ ] Ekran yazılarının hiçbiri 3 kelimeyi aşmıyor.
- [ ] Kapanış bir sonraki bölümün sorusunu soruyor.
- [ ] Metinde "harika", "muhteşem", "inanılmaz" gibi boş sıfatlar yerine somut bilgi var (boş coşku = slop sinyali).

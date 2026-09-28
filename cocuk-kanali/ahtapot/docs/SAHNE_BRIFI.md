# ORTAK BRİF — Çocuk kanalı animasyonu "Ahtapotun 3 Kalbi Var!" (3 dk, 1920x1080, 30fps)

Proje: /home/user/plan/cocuk-kanali/ahtapot  (Canvas 2D, kod tabanlı animasyon; Playwright ile kare kare render edilir)
Hedef kitle: 4–8 yaş, Türkçe. Seslendirmeyi insan yapacak; görseller aşağıdaki VO satırlarına saniyesi saniyesine senkron olmalı.
Kalite çıtası: "AI slop" DEĞİL. Tutarlı karakter, net anlatım, her 2–4 sn'de bir görsel değişim (yeni öğe, kamera hareketi, ifade değişimi), bilimsel doğruluk.

## Önce oku (tamamını)
- js/core.js  → PAL paleti, T zaman aralıkları, VO, SFX listesi, yardımcılar (pop, win, prog, ease, txt, popWords, pill, callout, factBadge, drawOcean, drawFloor, bubble, heartPath, starPath, dropPath, rrect, softShadow, mix, shade, rgba, rng, hash, beat)
- js/octopus.js → drawOki(ctx,x,y,s,o,t) ve parametreleri (pose, eye, mouth, brow, look, xray, hearts, neuro, bumps, mottle, waveArm, reach, sx/sy, rot, alpha, color), okiPoint / okiArmPoint / okiLocal, drawBeak, blendPose
- js/scenes/s01_hook.js ve s02_title.js → STİL REFERANSI. Aynı dili, yoğunluğu ve sahne yapısını kullan.

## Sahne sözleşmesi
registerScene({ id:'s0X_ad', start:T.s0X[0], end:T.s0X[1], cues:[{t: yerelSaniye, sfx:'pop', vol:.8}], draw(ctx, lt, t){...} })
- lt = sahne içi yerel zaman (0'dan başlar), t = mutlak zaman. Oki animasyonları için t'yi ya da lt'yi tutarlı kullan.
- Deterministik: Math.random YASAK (rng(seed) / hash kullan). Aynı lt → aynı kare.
- ctx.save/restore dengeli olsun. setLineDash kullanırsan sıfırla.
- SADECE kendi sahne dosyalarını yaz. core.js / octopus.js / main.js / index.html'e DOKUNMA. Yardımcı fonksiyon gerekiyorsa kendi dosyanda, sahneye özel önekle tanımla (örn. s07_drawRock) — global isim çakışması olmasın.
- Sahneler arası kabarcık geçişi (±0.42 sn) ve "whoosh" sesi otomatik. İlk 0.4 sn ve son 0.4 sn perdeyle kapalı; kritik bilgiyi oraya koyma.
- cues: sadece şu SFX isimleri: pop, whoosh, bubble, ding, heartbeat, tick, tada, splat, jet, sparkle, boing, swoosh_up, magic, click, drum, squish, wrong, shimmer. Önemli anlarda kullan, ~1.5 sn'de birden sık olmasın. VO'nun üstüne binen yüksek sesli efektlerden kaçın (vol .4–.7).

## Görsel kurallar
- Her bilgi sahnesinde sol üstte factBadge(ctx, n, 'BAŞLIK', lt, dur) (dur = sahne süresi). Sol üst (x<950, y<210) rozete ayrılmış; sağ üst (x>1440, y<150) ilerleme göstergesine ayrılmış — oraya öğe koyma.
- Yazı: çocuklar okuyamaz; ekrandaki yazı sadece 1–3 kelimelik vurgu (BÜYÜK HARF, Türkçe karakterler doğru: İ, Ş, Ğ, Ü, Ö, Ç). txt/pill/popWords kullan. Kenarlardan en az 80px içeride.
- Yardımcı nesneler (balık, kavanoz, el, papağan vb.) Oki ile aynı dilde: düz vektör, dolgu + kontur (kontur rengi shade(dolgu,-.42), ekranda ~5–7px), beyaz yarı saydam parlama elipsi, yere softShadow. Sevimli, korkutucu değil. Palet dışına çıkma; gerekirse PAL renklerinin mix/shade türevlerini kullan.
- Oki'nin ifadesi anlatıya tepki versin (şaşırma, gülme, yorgunluk, kararlılık). Göz takibi (look) ile ilgili nesneye baksın.
- Kamera: sahneyi ctx.translate/scale ile yavaş zoom/pan edebilirsin; drawOcean(ctx,t,{camX}) ile parallax.
- Ekran dolu ama karmaşık değil: aynı anda en fazla 1 ana fikir.

## Doğrulama (token bütçesi: dikkatli ol)
- Önizleme: node tools/preview.mjs <klasör> <mutlakZaman1> <zaman2> ...   (960x540 PNG; konsol hatalarını "HATALAR:" altında basar — "ERR_FILE_NOT_FOUND" satırları henüz yazılmamış diğer sahnelerden, yok say)
- Temas föyü: python3 tools/sheet.py <çıktı.png> <png1> <png2> ...  → tek görsel olarak Read ile bak.
- Önizleme klasörü olarak geçici bir klasör (ör. /tmp/onizleme/) kullan.
- Sahne başına en fazla 2 temas föyü (her biri ≤6 kare) bak. Gördüğün kusuru düzelt, sonra bir kez daha kontrol et. Yazı taşması, üst üste binme, boş ekran, siyah kare, hata olmamalı.
- git commit YAPMA; dosyaları yazıp bırak.

## Rapor
Bitince ≤150 kelime: hangi dosyalar, her sahnede ana görsel fikirler, bilinen sınırlamalar. Kod yapıştırma.

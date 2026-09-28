# Sahne Sözleşmesi ve Görsel Dil

## Dosya kuralları
- Bir sahne = bir dosya: `js/scenes/sXX_ad.js`. `bolum.js` → `SAHNELER` dizisine adı ekle.
- Dosyadaki her global fonksiyon/değişken sahne önekiyle başlar: `s07_drawRock`, `s07_hideOki`. Tüm sahneler aynı global alanda yaşar; çakışma sessizce başka sahneyi bozar.
- `Math.random` yok. `rng(seed)`/`hash(n)`.
- Her `ctx.save()` bir `ctx.restore()` ile kapanır. `setLineDash` kullandıysan `[]` ile sıfırla.
- Sahne içi zaman `lt` ile düşün: storyboard'daki "yerel saniye" = `lt`.

## Sahne iskeleti
```js
// S5 — DÜŞÜNEN KOLLAR (64–90 sn): tek satırlık sahne özeti
registerScene({
  id: 's05_kollar', start: T.s05[0], end: T.s05[1],
  cues: [{ t: .9, sfx: 'pop', vol: .5 }, { t: 4.6, sfx: 'shimmer' }],
  draw(ctx, lt, t) {
    const dur = T.s05[1] - T.s05[0];
    drawOcean(ctx, t, { depth: .3 });
    // ... vuruşlar: her biri pop/win/prog ile kendi zaman aralığında
    factBadge(ctx, 3, 'DÜŞÜNEN KOLLAR', lt, dur);   // en üstte çizilsin diye sonda
  }
});
```

## Görsel dil (serinin imzası)
- **Düz vektör + kontur:** dolgu rengi, kontur `shade(dolgu, -.42)` ~5–7 px, beyaz yarı saydam parlama elipsi (sol üst), yere `softShadow`.
- **Sevimli, korkutucu değil:** "düşman" bile sakar ve komik (çatık ama iri gözlü balık). Kan, diş, yaralanma yok.
- **Karakter ifadesi anlatıya tepki verir:** bilgi şaşırtıcıysa `eye:'surprised'`, zorluksa `brow:'worried'`, başarıda `eye:'happy', mouth:'grin'`. `look` ile konuşulan nesneye baktır.
- **Tek ana fikir:** aynı anda ekranda bir anlatım odağı. Bölünmüş ekranda anlatılmayan tarafı karart.
- **Hareket:** her şey zıplayarak girer (`pop`), yumuşak çıkar (`ease.in`). 2–4 sn'de bir yeni vuruş. Durağan anlarda bile hafif salınım (`Math.sin(lt*…)`).
- **Kamera:** yavaş zoom/pan (`ctx.translate/scale`), ani sarsıntı yok.
- **Karşılaştırma tekniği:** soyut bilgiyi yan yana koy (biz ↔ o, balık iskeleti ↔ iskeletsiz Oki, gaga ↔ delik).
- **Sayılar görünür olur:** "3 kalp" → 1-2-3 etiketleri; "8 kol" → kol uçlarında 1–8.

## Efekt sesleri
- Sadece önemli anlarda: nesne belirmesi (`pop`), bilgi vurgusu (`ding`), dönüşüm (`magic`), doğru cevap (`tada`), hata/durma (`wrong`), geri sayım (`tick`).
- 10 sn'de ≤ 12 efekt; ikisi arası ≥ 0.12 sn. VO üstüne binenleri `vol .4–.6`.
- Geçiş "whoosh"u otomatik; ekleme.

## Metin
- Ekran yazısı ≤ 3 kelime, BÜYÜK HARF, Türkçe karakterler doğru (İ, Ş, Ğ, Ü, Ö, Ç).
- Seslendirme cümlesini ekrana yazma. Yazı = anahtar kelime ("ANA KALP", "KEMİK YOK!").

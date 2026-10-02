# GÖREV: "Oki'nin Deniz Kaşifleri" Bölüm 2 — Yunuslar Nasıl Uyur?

## Rolün
Bu çocuk animasyon serisinin yapımcısısın: senarist, animasyon programcısı ve kalite kontrolcüsü bir arada. Hedef izleyici 4–8 yaş, dil Türkçe, süre 180 saniye.

## Sana verilenler
1. **Oki_Izleme_Kitabi.pdf** — Bölüm 1'in ("Ahtapotun 3 Kalbi Var!") kare kare izleme kitabı. Her karenin altında zaman, o an söylenen seslendirme ve çalan efektler var. Ayrıca kalite kontrol örnekleri ve kurallar. **Önce bunu baştan sona oku.**
2. **Oki_Kod_Paketi_TAM.txt** (ya da `_OZ.txt`) — Bölüm 1'i üreten sistemin kaynak kodu ve yöntem belgeleri. Motor hazır; sen sadece bölüme özel dosyaları yazacaksın.

## Hedef
Bölüm 1 ile **aynı kalitede ve aynı seride** görünen Bölüm 2. Bölüm 1 şu sözle bitti: *"Bir sonraki bölümde: Yunuslar nasıl uyur?"*. Bölüm 2 bu soruyla açılır, S3 (ilk süper güç) bu soruyu cevaplar. Başlık ve thumbnail da aynı vaadi verir.

## Değişmezler (dokunma)
- `js/core.js`, `js/octopus.js`, `js/main.js`, `tools/*`, `index.html`. Bu dosyaları **asla** yeniden yazma ya da gönderme.
- Oki serinin sunucusudur, görünümü aynı kalır. Yunus **konuk karakterdir**.
- 180 saniyelik iskelet: S1 kanca, S2 tanıtım, S3–S9 yedi süper güç (S6 soru, S7 oyun), S10 kapanış. Palet, fontlar, rozet, ilerleme yıldızları ve kabarcık geçişi aynı kalır.
- Kurallar: VO ≤ 2.8 kelime/sn; ekran yazısı ≤ 3 kelime; `Math.random` yok; global adlar sahne önekiyle başlar (`s04_…`); palet dışı renk yok; korkutucu öğe yok.

## Yazacağın dosyalar
| Dosya | İçerik |
|---|---|
| `js/bolum.js` | `DURATION, T, VO, FACTS, MUSIC, EKLER, SAHNELER`. Biçim için kod paketindeki `bolum_sablonu.js` ve Bölüm 1'in `bolum.js` dosyasına bak |
| `docs/STORYBOARD.md` | Sahne başına 2–4 sn'lik vuruşlar: ekranda ne var, karakterin ifadesi, ekran yazısı, efekt |
| `docs/KAYNAKLAR.md` | 7 bilginin her biri için kaynak + güven seviyesi |
| `js/karakterler/yunus.js` | `drawYunus(ctx, x, y, s, o, t)`: Oki ile aynı parametre mantığı ve görsel dil |
| `yunus_karakter.html` | Yunusun 8–12 poz/ifadesi tek sayfada (`karakter.html` kalıbı); `EKLER` ile değil doğrudan script olarak yükler |
| `js/scenes/s01_…js` … `s10_…js` | 10 sahne |
| `thumbnail.html` | Bölüm 2 thumbnail kompozisyonu (`renderFrame` içini yeniden yaz) |
| `YAYIN_PAKETI.md` | Seslendirme tablosu, başlık, açıklama + bölüm zamanları, etiketler, ayarlar |

## Çalışma aşamaları — her aşamanın sonunda DUR ve geri bildirim bekle
**Aşama 1: Senaryo.** `bolum.js`, `STORYBOARD.md` ve `KAYNAKLAR.md` dosyalarını yaz. Cevabın başında 7 bilgiyi tek satırlık bir liste olarak ver; her birinin yanına güven seviyesini (yüksek/orta) yaz. Sonra dur.
**Aşama 2: Yunus karakteri.** `yunus.js` ve `yunus_karakter.html` dosyalarını yaz. Kullanıcı sayfayı render edip sana görsel gönderecek; düzelt. Karakter onaylanmadan sahnelere geçme.
**Aşama 3: Sahneler.** Her mesajda en fazla 3 sahne dosyası gönder (S1–S3, S4–S6, S7–S8, S9–S10). Her paketten sonra kullanıcı sana temas föyleri (sahne başına 6 kare) ve `dogrula.py` çıktısını gönderecek. Kalite kontrol listesini uygula ve düzelt. Düzeltmede sadece değişen dosyayı tam hâliyle yeniden gönder.
**Aşama 4: Yayın.** `thumbnail.html` ve `YAYIN_PAKETI.md` dosyalarını yaz.

Kendin kod çalıştırabiliyorsan komutları kod paketindeki `cocuk-video-animasyon/SKILL.md` belgesinden uygula ve önizleme karelerine kendin bak. Çalıştıramıyorsan kullanıcı çalıştırıp sonuçları sana getirecek.

## Çıktı formatı (zorunlu, aksi hâlde dosyalar çıkarılamaz)
Her dosyayı tam içeriğiyle, tam olarak bu biçimde ver:
```
@@@ DOSYA: js/bolum.js
...dosyanın tam içeriği...
@@@ SON
```
- Yol bölüm klasörüne göredir: `js/...`, `docs/...`. "…", "önceki gibi", "değişmedi" gibi kısaltma yok; her seferinde **tam dosya**.
- Dosya bloklarının dışındaki açıklaman kısa olsun: ne yaptın, neye dikkat ettin, neyi doğrulayamadın.

## Bilgi doğruluğu (çocuk içeriğinde en kritik konu)
- Sadece iyi bilinen ve doğrulanabilir bilgiler kullan. Emin değilsen metni yumuşat ("Bazı yunuslar…", "Bilim insanları düşünüyor ki…") ya da bilgiyi çıkar.
- Web erişimin yoksa **URL uydurma**. Kaynağı kurum ya da yayın adıyla yaz ve yanına "doğrulanmalı" notu düş. Uydurma kaynak, eksik kaynaktan daha kötüdür.
- Yunus balık değil memelidir; bu bilgi yanlış anlaşılmaya açık değil, net söylenmeli.

## Yunus karakteri için tasarım notu
Bölüm 1'in kapanış kartındaki yunus hızlı bir taslaktır ve köpekbalığına benziyor (PDF son sayfa). **Kopyalama, geliştir.** Olması gerekenler: belirgin kısa ve yuvarlak gaga, kavisli yüksek alın, başın tepesinde nefes deliği, yatay hilal biçiminde kuyruk yüzgeci, Oki'nin göz stili ve gülümseyen ağız çizgisi. Tek göz açık/tek göz kapalı uyuma pozu şart, çünkü bölümün ana bilgisi bu. Renk mercan değil, serin gri-mavi. Kontur `shade(renk, -.42)`.

## Kalite ölçütü — kendini buna göre değerlendir
1. Bilgiler doğru ve kaynaklı.
2. İskelet ve seri formatı birebir.
3. VO kuralları: `dogrula.py` GEÇTİ.
4. Her kare, o an söylenen cümlenin anlamını gösteriyor.
5. Yunus, Oki ile aynı seride duruyor.
6. Sahneler arasında kompozisyon çeşitliliği var (karşılaştırma, bölünmüş ekran, yakın plan, oyun).
7. Çakışma, taşma ve boş ekran yok.
8. `tara.mjs` GEÇTİ.
9. "AI slop" sinyali yok (PDF "Yöntem 2/2" sayfası).
10. Bir çocuk izlediğinde bir şey öğrenir ve sonraki bölümü merak eder.

Başla: önce PDF'i ve kod paketini oku, sonra Aşama 1'i yap.

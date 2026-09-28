# Çocuk Eğitim Animasyonu — Skill Paketi

Bu paket, ahtapot bölümünü üreten hattı bir yapay zekâ ajanına (Hermes, Claude vb.) öğretmek için hazırlandı. Format açık **Agent Skills** standardı: her skill `SKILL.md` + `references/` + `scripts/` + `assets/` klasörlerinden oluşur.

## Üç skill, bir hat

```
cocuk-video-senaryo  ──►  cocuk-video-animasyon  ──►  cocuk-video-yayin
konu, doğrulama,          motor kurulumu, sahneler,     başlık, açıklama,
seslendirme, storyboard   görsel QC, render, ses         thumbnail, SRT, Shorts
→ js/bolum.js             → out/bolum_final.mp4          → YAYIN_PAKETI.md
```

**Neden 3, neden 1 değil:**
- Tek dev skill her çağrıda bütün motor belgesini bağlama yükler. Başlık yazmak için 500 satırlık çizim API'si okunmaz.
- **Neden 10 değil:** skill sayısı arttıkça ajan hangisini kullanacağını karıştırır. Sınırları bulanık skill'ler birbirinin işini yapar.
- **Ayrım iş anına göre:** senaryo sadece metin işi (her model yapabilir), animasyon ağır iş (güçlü model + terminal + görsel okuma), yayın hafif metin + tek görsel işi. Farklı anlarda, farklı araçlarla çağrılırlar.
- Her `SKILL.md` kısa. Detaylar `references/` içinde, sadece gerektiğinde okunur.

## Kurulum
- **Hermes Agent (Nous Research):** üç klasörü Hermes'in skills dizinine kopyala. Varsayılan genelde `~/.hermes/skills/`; kurulumunda farklıysa Hermes belgesindeki skills yolunu kullan. Klasör adı = skill adı olmalı.
- **Claude Code:** `~/.claude/skills/` (tüm projeler) veya proje içinde `.claude/skills/`.
- **Skill desteği olmayan bir model (Ollama/LM Studio):** ilgili `SKILL.md` gövdesini sistem promptuna koy. `references/` dosyalarını gerektiği an konuşmaya yapıştır. Animasyon skill'i için model terminal çalıştıramıyorsa komutları sen çalıştırırsın.

Animasyon için makinede: Node 18+, Python 3.10+, `npm install && npx playwright install chromium`, `pip install numpy pillow imageio-ffmpeg`. Yeni bölüm klasörünü `scripts/yeni_bolum.sh` kurar.

## Model gereksinimi (en önemli karar)

| Skill | Gerekli model |
|---|---|
| senaryo | Orta-güçlü dil modeli. Web araması varsa bilgi doğrulaması çok daha iyi olur |
| animasyon | **Güçlü kod modeli + görsel okuma (vision) + terminal** |
| yayın | Orta dil modeli; thumbnail kontrolü için görsel okuma |

Animasyon kalitesi, "önizle → görsele bak → düzelt" döngüsünden gelir. Görsel okuyamayan model bu döngüyü kuramaz: kod hatasız çalışır ama sahne kötü görünür. Hermes'in arkasındaki model görsel okuyamıyorsa animasyonu güçlü bir modelle yap, senaryo ve yayını Hermes'e bırak.

## Hermes'e öğretme planı (sırayla)
1. **Senaryo sınavı:** "Yunuslar nasıl uyur?" bölümünün senaryosunu yaptır. Çıktıyı `references/ornek-*` dosyalarıyla karşılaştır: bilgi doğruluğu, VO hızı (`dogrula.py`), storyboard yoğunluğu.
2. **Karakter sınavı:** yunus karakter sayfası (`karakter.html` kalıbı). Oki ile aynı seride mi duruyor?
3. **Tek sahne sınavı:** sadece S3'ü (ilk bilgi) yaptır, temas föyünü birlikte incele.
4. **Tam bölüm:** geri kalan sahneler, `dogrula.py` + `tara.mjs`, render.
5. **Her hatayı kurala çevir:** Hermes bir hatayı iki kez yaparsa ilgili `SKILL.md`'nin "Yapma" bölümüne **nedeniyle birlikte** tek satır ekle. Skill yaşayan bir belgedir; ilk bölümlerde en çok bu adım işe yarar.

## Skill yazarken dikkat edilenler (kendi skill'lerini yazarken de geçerli)
1. **`description` tetikleyicidir.** Ajan skill'i sadece açıklamaya bakarak seçer. Ne zaman kullanılacağı ve ne zaman **kullanılmayacağı** açıkça yazılı.
2. **Kural + neden.** "Math.random yasak" yerine "yasak, çünkü 4 paralel render sekmesi farklı kare üretir ve video titrer". Nedeni bilen model, yazılmamış durumlarda da doğru karar verir.
3. **Sabit ile değişken ayrı.** Motor ve format değişmez; bölüm verisi ve sahneler değişir. Ajanın dokunamayacağı yer açıkça belli ve `dogrula.py` bunu denetliyor.
4. **Yargıyı araca devret.** Süre hesabı, konuşma hızı, çakışma, efekt adları, boş kare gibi ölçülebilen her şey script'le denetleniyor. Model sadece gerçekten yargı gerektiren işi yapıyor (görsel kalite, anlatım).
5. **Altın örnek.** Soyut kural yerine tam bir bölüm (ahtapot) referans olarak var. Model örnekten, kuraldan daha iyi öğrenir.
6. **Bitti tanımı ölçülebilir.** "Güzel olsun" değil: `dogrula.py` GEÇTİ, `tara.mjs` GEÇTİ, her sahne için föye bakıldı, bir insan sesli izledi.
7. **İnsan kapısı.** Ses dengesi ve son onay insanda. Skill bunu açıkça söylüyor; model "dinledim" diyemez.

## Bilinen sınırlar
- Motor şu an deniz temalı (okyanus arka planı, Oki). Kara hayvanları serisi için yeni arka plan fonksiyonu ve belki yeni sunucu karakter gerekir. Bu bir motor sürümü işidir, bölüm işi değil.
- Müzik sentezi işlevsel ama sade. Seri büyüdüğünde lisanslı çocuk müziği paketi önerilir.
- Tüm platform kuralları (YouTube) zamanla değişir. `cocuk-video-yayin/references/youtube-cocuk-kurallari.md` periyodik güncellenmeli.

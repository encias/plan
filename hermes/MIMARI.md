# HERMES — Sıfırdan Mimari (v1)

> **Tarih:** 27 Eylül 2026 · **Durum:** Mimari faz. Hiçbir şey kurulmadı, yapılandırılmadı, silinmedi; eski sistemden hiçbir şey taşınmadı.
> **Kapsam:** Babanın yeni Windows bilgisayarı · bakımı uzaktan sende · önce ücretsiz ve yerel modeller · Hermes Agent + Nous Portal.
> **Kanıt tabanı:** NousResearch/hermes-agent kaynak kodu ve dokümanları (commit `6e69a89`, 28 Eylül 2026) salt-okunur incelendi; Hermes eklenti kataloğu; Nous'un kendi JEV değerlendirmesi; web araştırması. Doğrulanamayan her şey metinde ve §25.2'de işaretli.
> **Yöntem:** Üç bağımsız araştırma alt ajanı (Hermes çalışma zamanı; Nous Portal + JEV; ücretsiz provider manzarası) ve taslağı eleştiren bir karşı-görüş alt ajanı. Sentez ve kararlar bana ait.

---

## 0. Özet

1. **Temel mimari:** Hermes bir "sohbet sürüsü" değil; **iş defteri + küçük deterministik çekirdek + geçici LLM işçileri.** LLM'ler kontrol akışına sahip değil; durum sohbette değil defterde yaşıyor; her çağrının context'i yeniden *derleniyor*, birikmiyor.
2. **En önemli bulgu:** Hermes Agent bu çekirdeğin büyük kısmını **zaten sağlıyor** — dayanıklı Kanban görev defteri (sahiplenme, çöken işçiyi geri alma, sahiplik kontrollü tamamlama, idempotency anahtarı, bağımlılıklar, inceleme akışı), cron, profiller, onaylar, panel. **Karar: ikinci bir görev defteri kurmuyoruz; Kanban otoritedir.**
3. **Bizim ekleyeceğimiz yalnızca dört parça:** (1) **anayasa** — işletim sistemi izinleri, yetenek minimizasyonu ve konteynerle uygulanır; üstüne hata ve zaman aşımında aracı *engelleyen* (`fail_closed`) bir `pre_tool_call` politika kancası; (2) **model kapısı** (kayıt, kota, sağlık, veri hassasiyetine göre yönlendirme) — kanıt kapılı, ihtiyaç ölçülünce; (3) **bilgi derleyici** (gözlem → küratörlü, git'te sürümlü bilgi → göreve özel paket) — önce insan kapılı; (4) **brief-katlama** (Hermes'in yorum dizisinin tamamını her işçiye vermesini sınırlar).
4. **Zemin:** WSL2 içinde izole bir "Hermes cihazı" — babanın dosyalarına, tarayıcısına, e-postasına erişemez. Tailscale ile uzaktan bakım, ölü-adam anahtarı, test edilmiş yedek.
5. **"Limitsiz ücretsiz model" yok.** Ücretsiz katmanlar kotalı, oynak ve bir kısmı veriyi eğitimde kullanıyor. Tek gerçekten sınırsız katman **yerel model**. Mimari bolluk için değil kıtlık için tasarlandı; babanın hassas verisi yapısal olarak yalnızca yerel/onaylı modellere gider.
6. **İletişim:** Ortak sohbet odası yok. **Kart = göreve özel oda**; yaşayan özet (brief) + kararlar + ekler + yapılandırılmış devirler. Mesajlar özete katlanınca context'ten çıkar. Yeni katılan ve yeniden başlayan işçi aynı yoldan, 2–4k token'la durumu kurar.
7. **Hafıza:** Katmanlı, bütçeli, kanıtlı, sürümlü, çürüyen. Araştırma, sindirme kapasitesini aşamaz (geri basınç).
8. **Öncelik:** Şeritler + ayrılmış kapasite; tüketicisi olmayan iş başlamaz; keşif bütçesi varsayılan 0; oturum içi otonom döngüler kapalı. Boşta kalmak meşru.
9. **Doğrulama:** Risk sınıfına göre: deterministik kontrol → kanıt kontrolü → üreticiden farklı aileden hakem → insan.
10. **JEV:** TypeSafe AI'ın iki haftalık tipli karar modeli. Nous'un kendi testi olumsuz; 13 Hermes eklentisinin hepsi topluluk yapımı. **Yalnızca gölge modda, düşük riskli, çok sayıdaki küçük karar için aday; asla kapı, onay mercii veya kayıt hakemi değil.**
11. **Nous Portal:** Ücretli bir **provider + araç sağlayıcı** (özellikle web arama, bulut tarayıcı). Kontrol düzlemi veya doğruluk kaynağı değil; sistem onsuz çalışmak zorunda.
12. **Kıt premium modeller** (Opus, Codex): otonom döngüde yok; önce bakımcının aracı, sonra yalnızca insan onaylı eskalasyon.
13. **Yol haritası:** 8 faz. Faz 0–1 otonomisiz; baba Faz 2'de devreye giriyor; öğrenme en sonda (Faz 7) ve kapılı.

**Nasıl okunmalı:** Karar vermek için §0, §2, §22, §23, §24. Uygulayıcı için her bölüm kendi başına okunabilir; ajanlara verilecekse de tamamı değil, ilgili bölüm verilmeli (bu belgenin kendisi de "context derlenir" ilkesine göre bölümlendi).

**v1.1 — karşı-görüş incelemesinden sonra yapılan düzeltmeler (hepsi kaynak koddan doğrulandı):**

- Politika kapısı *middleware*'den `fail_closed` bir `pre_tool_call` kancasına taşındı: Hermes middleware'i hata durumunda işlemi geçiriyor (fail-open).
- Tekrarlayan sistem işleri cron'un LLM'siz script modunda; LLM çağrısı sıfır.
- `config.yaml` salt-okunur kararı netleşti; kanca için kanarya testi eklendi.
- `isci` terminali Faz 1'den itibaren Docker'da (önceki taslakta Faz 2 ile Faz 5 arasında çelişki vardı).
- Model kapısı ve hafıza otomasyonu *kanıt kapılı* yapıldı; JEV denemesi ölçülmüş bir sorun şartına bağlandı; hedef hiyerarşisi uygulamada hafifletildi.
- WSL'in otomatik başlatılması için Hermes'in kendi belgelediği yedek yol eklendi; yerel Windows alternatifi reddedildi.
- Asılı işçi eşiği 4 saatten 30–45 dakikaya indirildi.
- İncelemenin iki iddiası doğrulamada tutmadı ve uygulanmadı: "cron'un LLM'siz modu yok" (var) ve "çöken işçi 4 saat bekler" (çöken işçi ≤ 60 sn'de geri alınır; 4 saat yalnızca asılı kalan işçi için).


## 1. Temel mimari: Defter + Çekirdek + Geçici İşçiler

### 1.1 Tez

Hermes'in merkezinde bir model, bir "ana ajan" ya da bir sohbet **olmamalı**. Merkezde bir **iş defteri (ledger)** olmalı: sistemin neyi taahhüt ettiğini, kimin neyi sahiplendiğini, neyin bittiğini, neyin kanıtlandığını, neyin onay beklediğini tutan tek, işlemsel (transactional) ve denetlenebilir kayıt. Diğer her şey bu defterin etrafında döner:

| Bileşen | Ne yapar | LLM içerir mi? | Ömrü |
|---|---|---|---|
| **Çekirdek (kernel)** | Görev durum makinesi, zamanlayıcı, lease/fencing, politika uygulama (PEP), onay kuyruğu, yan-etki yürütücüsü (outbox), bütçe/kota muhasebesi, context derleyici, olay günlüğü | **Hayır.** Deterministik kod. | Kalıcı servis |
| **Model kontrol düzlemi** | Provider/model kaydı, sağlık, kota, yetenek skorları, rol→model çözümleme, failover | Hayır | Kalıcı (çekirdeğin parçası) |
| **Geçici işçiler** | Tek bir görev denemesini (attempt) yürütür: derlenmiş context alır, sınırlı yetkiyle çalışır, yapılandırılmış sonuç + artefakt + gözlem döner, ölür | Evet | Görev denemesi kadar |
| **Hafıza derleyicisi** | Ham gözlemi → aday bilgiye → küratörlü, sürümlü, küçük bilgiye dönüştürür | Evet (toplu, ucuz) | Zamanlanmış toplu iş |
| **İnsan yüzeyleri** | Sahip (baban) için sohbet + onay; bakımcı (sen) için gözlem paneli + CLI | Karşılama katmanında evet | Kalıcı |

**Fiziksel karşılık:** Bu tablodaki "çekirdeğin" büyük kısmını Hermes Agent zaten sağlıyor (Kanban görev defteri ve dispatcher'ı, cron, onaylar, profiller, panel). Biz yalnızca eksik dört parçayı ekliyoruz: politika kancası, model kapısı, bilgi derleyici, brief-katlama. Ayrıntı §15'te. Mantıksal tasarım Hermes'in sürümünden bağımsız kalsın diye önce kavramsal olarak anlatılıyor.

Kısacası: **LLM bir CPU'dur, işletim sistemi değil.** Durum (state) LLM'in içinde, sohbette ya da ajanın "aklında" yaşamaz; defterde yaşar. LLM her çağrıda defterden *derlenmiş* küçük bir durum görür, bir öneri/artefakt üretir ve gider.

### 1.2 Değişmez ilkeler (invariants)

Bunlar tasarımın "fizik kanunları"; her alt sistem bunlara uymak zorunda:

1. **I1 — Her konu için tek doğruluk kaynağı var ve bu asla bir sohbet değil.** Sohbet girdi kanalıdır; durum defterdedir.
2. **I2 — LLM'ler kontrol akışına sahip olmaz.** Neyin, ne zaman, hangi modelle, hangi yetkiyle çalışacağına deterministik kod karar verir. Planlayıcı LLM bir *plan önerisi* üretir; çekirdek doğrular ve yürütür.
3. **I3 — Context derlenir, birikmez.** Hiçbir işçi görevden göreve geçmiş taşımaz. Her çağrının context'i tipli durumdan, bütçeli olarak yeniden derlenir. Context boyutu geçmişin uzunluğuyla değil, *güncel durumun* boyutuyla sınırlıdır.
4. **I4 — Kurallar kodla ve işletim sistemi izinleriyle uygulanır, prompt ile rica edilmez.** Prompt'taki kural metni yalnızca bilgilendirmedir.
5. **I5 — Her dış yan etki (mesaj gönderme, dosya silme, API'ye yazma) tam bir kez olur, onaylanabilir ve izlenebilirdir.** İşçi yan etkiyi *yapmaz*, *ister*; çekirdek yürütür.
6. **I6 — Her önemli değişiklik geri alınabilir, ya da açıkça "geri alınamaz" diye işaretlenip insan onayına bağlanır.**
7. **I7 — Tüketicisi olmayan iş yoktur.** Her görevin çıktısını kimin/neyin kullanacağı belli olmalı. Boşta kalmak meşru bir durumdur.
8. **I8 — Hiçbir ajanın özel, gizli uzun süreli hafızası yoktur.** Öğrenilen her şey ortak, sürümlü ve denetlenebilir boru hattından geçer.

### 1.3 Eski sistemin sorunları → kök neden → yapısal çözüm

| Eski sorun | Kök neden | Bu mimarideki yapısal çözüm |
|---|---|---|
| Çok araştırma, az teslimat | İşin tüketicisi ve "bitti" tanımı yoktu | Görev = tüketici + kabul kriteri zorunlu; keşif bütçesi varsayılan 0; hafıza sindirme kapasitesi araştırmayı frenler (backpressure, §4.6) |
| Bilgi, kullanılabilir hafızaya dönüşmeden birikti | "Hafıza" = depolama sanıldı; derleme adımı yoktu | Gözlem → aday → küratörlü bilgi hattı; katman başına boyut bütçesi; kullanılmayan bilgi arşive düşer |
| Sohbet/oturum context'i büyüdü, kırılganlaştı | Durum sohbetin içinde tutuldu | Durum defterde; context her çağrıda derlenir (I3) |
| Durum dosyalara, DB'lere, script'lere dağıldı | Tek doğruluk kaynağı yoktu | §1.4'teki doğruluk kaynağı haritası; türetilmiş her şey yeniden üretilebilir |
| Uzun süren ajanlar context kaybetti, işi tekrarladı | Uzun ömürlü ajan + ajanın "aklında" durum | İşçiler geçici; lease + checkpoint + görev özeti (brief) ile ucuz yeniden kurulum; fencing token ile çift yazım reddedilir |
| Provider/model değişimi, 429'lar iş akışını kilitledi | Model ID'leri koda gömülüydü; kota görünmezdi | Rol/yetenek ile model referansı; kota muhasebesi; kapasite yoksa görev "başarısız" değil `waiting_capacity` olur |
| Güçlü modeller düşük değerli işe harcandı | Kıtlığın bir "fiyatı" yoktu | Tier'lar + kıtlık fiyatı (shadow price); güçlü model yalnızca kalite tabanı gerektirdiğinde |
| Orkestrasyon kıt premium modellere bağlıydı | Kontrol akışı bir LLM'deydi | Orkestrasyon deterministik; premium yalnızca eskalasyon danışmanı |
| Durum ve geçmiş aşırı büyüdü | Saklama (retention) politikası yoktu | Her veri sınıfının TTL'i ve sıcak/soğuk ayrımı var |
| "Sistem ne biliyor, ne yapıyor, kim sahip?" cevaplanamadı | Gözlemlenebilirlik modeli yoktu | Yapılandırılmış olay günlüğü + hazır sorgular + günlük özet (§16) |
| Ajanlar arası iletişim context kirliliği yarattı | Koordinasyon sohbetle yapıldı | Koordinasyon paylaşılan tipli durum üzerinden; mesajlar kısa, tipli, TTL'li ve özete katlanır (§9) |
| Otomasyon kendi için aktivite üretti | Değer muhasebesi yoktu | Tüketicisiz görev reddedilir; çıktı/aktivite oranı ölçülür; oran düşerse isteğe bağlı şeritler kısılır |

### 1.4 Doğruluk kaynağı haritası

| Konu | Otoriter kaynak | Türetilmiş / izdüşüm (yeniden üretilebilir) | Kim yazabilir |
|---|---|---|---|
| Görevler, sahiplenmeler (lease), denemeler, devirler, yorumlar, ekler | **Hermes Kanban veritabanı** (SQLite) | Pano, günlük özet | Dispatcher + işçiler (yalnızca `kanban_*` araçlarıyla) |
| Model/provider kaydı, kota, sağlık, eval sonuçları, politika ve yönlendirme kararları, (Faz 6'da) etki/onay kayıtları | `core.db` (SQLite, WAL) | Router önbelleği, panel görünümleri | Model kapısı, politika eklentisi, eval işleri |
| Anayasa ve politika | `policy/` git deposu | Prompt'lara giren kısa alıntılar | Yalnızca bakımcı (insan) |
| Konfigürasyon | `config/` git deposu | Çalışma zamanı önbelleği | Bakımcı; çekirdek yalnızca politika sınırları içinde otomatik ayar |
| Küratörlü bilgi, kararlar, dersler, playbook'lar, açık tercihler | `knowledge/` git deposu (Markdown/YAML) | FTS/vektör indeksleri, Hermes'in hafıza dosyaları | Küratör *önerir*; onay kapısı *işler* |
| Artefaktlar (raporlar, dosyalar, kod) | İçerik-adresli depo `artifacts/sha256/…` | — | Çekirdek (işçiler `artifact.put` ile) |
| Ham olaylar, transkriptler, ham web yakalamaları | `archive/` (append-only, sıkıştırılmış) | Arama indeksleri | Çekirdek |
| Sırlar (API anahtarları, token'lar) | OS korumalı sır deposu | — | Yalnızca bakımcı |
| Sohbet geçmişi | Hermes oturum veritabanı | — | Hermes (girdi kanalı; otorite **değil**) |

Kural: **Türetilmiş bir şey bozulursa silinip yeniden üretilir; otoriter bir şey bozulursa yedekten geri yüklenir.** Yedekleme stratejisi (§19) bu ayrıma dayanır.

### 1.5 Mantıksal şema

```
              ┌──────────────── İNSANLAR ─────────────────┐
              │  Sahip (baban)             Bakımcı (sen)  │
              │  Telegram/WhatsApp         Panel · CLI    │
              └──────┬──────────────────────────┬─────────┘
                     │ istek / onay / cevap     │ gözlem / onay / politika
          ┌──────────▼──────────┐     ┌─────────▼──────────────┐
          │ KARŞILAMA (Hermes   │     │ GÖZLEM & ONAY YÜZEYİ   │
          │ gateway oturumu)    │     │ (hazır sorgular)       │
          └──────────┬──────────┘     └─────────┬──────────────┘
                     │ MCP araçları              │ SQL görünümleri
  ┌──────────────────▼───────────────────────────▼─────────────────────┐
  │                     ÇEKİRDEK  (deterministik, LLM yok)             │
  │  Görev defteri · Zamanlayıcı · Lease/fencing · Politika (PEP)      │
  │  Onaylar · Yan-etki yürütücü (outbox) · Bütçe/kota · Olay günlüğü  │
  │  Context derleyici · Model kontrol düzlemi (kayıt, sağlık, router) │
  └──────┬───────────────────┬────────────────────────┬────────────────┘
         │ lease + paket     │ LLM çağrıları          │ oku / yaz
  ┌──────▼───────────┐ ┌─────▼───────────────┐ ┌──────▼──────────────────┐
  │ GEÇİCİ İŞÇİLER   │ │ PROVIDER'LAR        │ │ DEPOLAR                 │
  │ ajan işçileri    │ │ T0 yerel (sınırsız) │ │ Kanban DB · core.db     │
  │ (Hermes alt-     │ │ T1 ücretsiz-toplu   │ │ knowledge/ (git)        │
  │ ajanları)        │ │ T2 ücretsiz-güçlü   │ │ policy/ (git, salt-oku) │
  │ fonksiyon        │ │ T3 kıt/premium      │ │ artifacts/ (CAS)        │
  │ işçileri (tek    │ │ (Nous Portal vb.)   │ │ archive/ (JSONL.zst)    │
  │ çağrı, şemalı)   │ └─────────────────────┘ └─────────────────────────┘
  └──────────────────┘
```

**Önemli ayrım — iki tür işçi:**

- **Fonksiyon işçisi:** Ajan döngüsü yok. Tek (ya da birkaç) LLM çağrısı, JSON şemasıyla doğrulanmış çıktı. Özetleme, çıkarım, sınıflandırma, tekilleştirme, hafıza damıtma, hakemlik. Ucuz, hızlı, deterministik yapıda. **Eski sistemdeki işlerin çoğu bu türdendi ama ajanla yapılıyordu — pahalı ve kırılgan olmasının bir nedeni bu.**
- **Ajan işçisi:** Çok adımlı, araç kullanan iş: web araştırması, kod, dosya işlemleri. Hermes Agent alt-ajanı olarak, göreve özel araç setiyle doğar.

Kural: *Bir fonksiyon işçisiyle yapılabilecek iş asla ajan işçisine verilmez.*

---

## 2. Düşüncende yanlış bulduklarım (açık konuşuyorum)

1. **"Modellerin konuştuğu ortak oda" metaforu yanlış.** Sohbet odası, eski sistemdeki context kirliliğinin ta kendisi. Doğru metafor: *ortak bir belge* (görev özeti/brief) + *karar defteri* + *artefakt rafı*. Mesajlaşma yalnızca kenar notu; not, belgeye işlenince silinir. Organizasyonlar kalıcı "herkes-herkese" sohbetle değil, yazılı kararlar ve sahiplenilmiş işlerle yürür. (§9)
2. **"Çok sayıda kalıcı ajan" yanlış.** Kalıcı olması gereken şeyler deterministik servislerdir (defter, zamanlayıcı, router). LLM'li işçiler geçici olmalı. "Uzun yaşayan ajan" = biriken context + gizli durum + tekrar eden iş. Senin listelediğin rollerin çoğu ayrı ajan değil; bir işçinin *profili* (prompt + araç seti + model gereksinimi) ya da hiç LLM gerektirmeyen bir iş. (§8)
3. **"Limitsiz ve ücretsiz model" diye bir şey yok.** Bunu baştan netleştirmek zorundayım: ücretsiz katmanlar kotalıdır (örn. OpenRouter'da kredisiz ~50 istek/gün, bir kerelik 10$ ile ~1000 istek/gün), habersiz değişir (Cerebras Ağustos 2026'da kartsız katmanı kaldırdı; GitHub Models'ın Temmuz 2026'da kapandığı bildiriliyor — ikisi de ikincil kaynak, kurulumda doğrulanmalı) ve bazıları **verini eğitimde kullanır** (Google AI Studio ücretsiz katmanı, AB/UK/İsviçre dışında — Türkiye dahil — eğitim için kullanır). Tek gerçekten "limitsiz" katman **makinenin kendi donanımında çalışan yerel modeldir.** Mimari bolluk için değil, *kıtlık ve oynaklık* için tasarlanmalı. Ayrıca bir ajan oturumu tek bir görevde 5–20 istek harcar; "günde 1000 istek" sanıldığı kadar büyük değil.
4. **Önerdiğin yaşam döngüsü büyük ölçüde doğru ama dört eksik ve bir yanlış yer var.** Eksikler: (a) *ayrıştırma / hızlı yol* — isteklerin çoğu plan gerektirmez, doğrudan cevaplanmalı; (b) *"bitti" tanımı yürütmeden önce* yazılmalı; (c) *yan etkilerden önce onay kapısı*; (d) *sahibin kabulü* — gerçek tamamlanma sinyali doğrulayıcı değil, kullanıcıdır. Yanlış yer: "öğren" adımı akış içinde değil, **asenkron ve toplu** olmalı; "öncelik belirle" de bir LLM adımı değil, zamanlayıcının deterministik işi. (§3)
5. **Hafıza katmanları = ayrı veritabanları değil; ve ajanlar hafızayı "okumaz".** Ajanlar hafızaya doğrudan erişmez; kendilerine göre *derlenmiş* bir paket alırlar. Katmanlar veri modelinde bir sınıflandırmadır, depolama topolojisi değil. (§4)
6. **Planlayıcı/orkestratör bir LLM olmamalı.** LLM planı *önerir*, çekirdek doğrular (döngü var mı, bütçe aşılıyor mu, politika ihlali var mı) ve yürütür.
7. **"Sürekli benchmark" ve "kendini geliştirme" amaç değil, kendi başına meşguliyet üretir.** Eval'ler bütçeli ve tetik tabanlı olmalı (yeni model, sapma, aylık). Asıl sinyal üretimdeki doğrulama ve sahibin kabulüdür. "Kendini geliştirme" ancak kanıtlı, geri alınabilir, kapılı öğrenme olarak var olabilir. (§11, §20)
8. **JEV'i "birinci sınıf bileşen" yapmak şu an kanıtla desteklenmiyor.** JEV (TypeSafe AI'ın "Jev" tipli karar modeli) 15 Eylül 2026'da, yani iki hafta önce yayınlandı. Kendi raporladığı doğruluk en iyi LLM karşılaştırıcısının altında (~%67,8'e karşı ~%74,1, kendi beyanı). Nous Research'ün kendi deposundaki kontrollü testte (context sıkıştırma kararları) Jev'in sıralaması düz "en yeni olanı tut" sezgiseliyle berabere kaldı ve sonuç açıkça "**Do not adopt Jev**" oldu. JEV'e bir *slot* açarım (tipli karar servisi), ama onu kendi trafiğimizde kanıtlayana kadar yalnızca gölge modda, yalnızca düşük riskli kararlarda ve asla güvenlik kapısı olarak. (§13)
9. **Nous Portal bir kontrol düzlemi değil.** Doğrulanmış haliyle: OAuth'lu, ücretli bir abonelik geçidi — 300+ modele çıkarım vekili (inference proxy) + "Tool Gateway" (web arama, görsel üretim, TTS, bulut tarayıcı, bulut terminal) + faturalama. Görev, hafıza, politika ya da gözlemlenebilirlik ürünü yok. Kendi dokümanında ücretsiz katman tanımlı değil. Yani Portal bir **provider + araç sağlayıcı + kimlik/fatura sınırı**; doğruluk kaynağı olamaz. (§14)
10. **Opus/Codex gibi kıt modelleri otonom döngüye bağlamak yanlış.** Başlangıçta bu modeller *sistemin* değil *bakımcının* aracı olmalı: mimari, zor hata ayıklama, kritik inceleme. Sistem onlarsız tam çalışmalı. Sonraki fazda bile yalnızca insan onaylı bir "eskalasyon kuyruğu" üzerinden.
11. **Kalite doğrulamasını üreticiyle aynı model ailesine yaptırmak yanlış.** Aynı aile aynı hataları yapar (korelasyonlu hata). Doğrulayıcı farklı aileden olmalı ve önce deterministik kontroller çalışmalı. (§12)
12. **Ücretsiz kotayı çoğaltmak için çoklu hesap / anahtar çiftliği kurmak — reddediyorum.** Kullanım koşullarını ihlal eder, ban riski sistemi aniden çökertir ve babanın adına açılmış hesapları riske atar. Kurala dahil ediyorum (§5).

---

## 3. Alt sistemler ve birbirleriyle etkileşimi

### 3.1 Düzeltilmiş yaşam döngüsü

```
İSTEK (sahip, zamanlama, bakım, bir üst görev)
  │
  ▼
AYRIŞTIRMA (Karşılama) ── hızlı yol? ──► Doğrudan cevap (tek çağrı, sınırlı hafıza okuma)
  │                                        └► olay kaydı (+ gerekirse gözlem)
  ▼ görev yolu
TANIM (spec): hedef · tüketici · "bitti" kriterleri · risk sınıfı · bütçe zarfı · veri hassasiyeti
  │
  ▼
KABUL: politika kontrolü (çekirdek) · belirsizse sahibe tek soru · keşif işiyse bütçe onayı
  │
  ▼
ZAMANLAMA: etkin öncelik = f(şerit, proje ağırlığı, son tarih, bekleme süresi, sahip-bekliyor)  ← deterministik
  │
  ▼
[PLAN — yalnızca karmaşıksa]: Planlayıcı DAG önerir → çekirdek doğrular (döngü, bütçe, politika)
  │
  ▼
YÜRÜTME: lease → derlenmiş context paketi → çalışma → heartbeat + checkpoint → brief güncellemesi
  │
  ▼
DOĞRULAMA (risk ile orantılı): deterministik kontroller → kanıt kontrolü → farklı aileden hakem → (insan)
  │
  ▼
ONAY (yalnızca dış yan etki varsa): tam içerik + alıcı + özet; onay, içeriğin hash'ine bağlı
  │
  ▼
TESLİM → SAHİP KABULÜ (👍/👎/düzelt) → KAPANIŞ (görev künyesi: 5–10 satır sonuç kaydı)
  │
  ▼ (asenkron, toplu)
ÖĞRENME: gözlemler → küratör → aday bilgi → kapı → sürümlü bilgi; model skorları güncellenir
```

### 3.2 Alt sistemler

| Alt sistem | Sorumluluk | Girdi | Çıktı | Durum nerede |
|---|---|---|---|---|
| Karşılama (Concierge) | Sahiple konuşur; ayrıştırır; hızlı yol; görev tanımı; netleştirme sorusu; teslim | Mesajlar, onay tıklamaları | Cevaplar, görev spec'leri, onay kararları | Oturum penceresi (kısa) + defter |
| Görev defteri | Durum makinesi, bağımlılıklar, lease, deneme geçmişi | Spec'ler, işçi sonuçları | Durum geçişleri, olaylar | Hermes Kanban DB |
| Zamanlayıcı | Şeritler, öncelik, kapasite, kesme (preemption), tekrarlayan işler | Hazır görevler, kota durumu | Lease'ler | Kanban (öncelik) + Hermes cron |
| Politika motoru (PEP/PDP) | Her araç/yan etki/model çağrısında izin/red/onay kararı | (rol, araç, argümanlar, risk, veri sınıfı) | allow / deny / require_approval | `policy/` (salt-okunur) |
| Yan-etki yürütücü | Onaylı dış eylemleri tam bir kez yürütür | Onaylı effect kayıtları | Sonuçlar, telafi kayıtları | `core.db` (Faz 6; o zamana dek dış etkiyi insan yapar) |
| Context derleyici | Rol + görev için bütçeli paket üretir | Spec, brief, kararlar, bilgi, tercihler | Context paketi (saklanır: "ajan ne biliyordu?") | Kanban + `knowledge/` |
| Model kontrol düzlemi | Kayıt, sağlık, kota, skor, çözümleme, failover | Rol gereksinimi, veri sınıfı | Somut uç nokta seçimi + yedekler | `core.db` |
| Hafıza derleyicisi | Gözlem → bilgi; çelişki; çürüme | Gözlemler, görev künyeleri | Bilgi değişiklik setleri (diff) | `knowledge/` |
| Doğrulama | Risk-orantılı kontrol | Çıktı + spec + kanıt | Karar (geçti/kaldı/belirsiz + sorunlar) | Kanban (inceleme akışı) |
| Eval koşumu | Rol başına altın setlerle model yeterliliği | Aday modeller | Yetenek skorları | `core.db` + `evals/` (ajanlara kapalı) |
| Gözlemlenebilirlik | Olay günlüğü, görünümler, özet, alarm | Tüm olaylar | Panel, günlük özet, alarm | Kanban + `core.db` + Hermes logları |
| Operasyon | Yedek, saklama, sağlık, ölü-adam anahtarı | Zamanlayıcı | Raporlar | — |

**Etkileşim kuralı:** Alt sistemler birbirleriyle *defter üzerinden* konuşur (olay + durum), doğrudan RPC zinciri kurmaz. Böylece her etkileşim kayıt altındadır ve çökme sonrası yeniden oynatılabilir.
---

## 4. Kalıcı hafıza mimarisi

### 4.1 İlke: Hafıza bir depo değil, bir derleyicidir

Eski sistemin hafıza sorunu "yeterince saklamamak" değil, **saklananı kullanılabilir bilgiye derlememekti.** Bu yüzden hafıza üç aşamalı bir derleyici olarak tasarlanır:

1. **Yakalama (capture)** — ucuz, ham, süreli. Her deneme yapılandırılmış *gözlemler* üretir. Çoğu burada ölür, ölmeli de.
2. **Damıtma (distill)** — küratörlü, kanıtlı, sürümlü, küçük. Bilgi burada "hak ederek" kalıcılaşır.
3. **Derleme (compile)** — göreve ve role özel, token bütçeli *context paketi*. Hiçbir işçi hafızanın tamamını görmez; yalnızca kendisi için derleneni görür, gerekirse ID ile daha fazlasını *çeker* (pull, push değil).

### 4.2 Katmanlar ve yaşam kuralları

| Katman | İçerik | Yazan | Değişebilirlik | Sürüm | Özetlenir mi | İndeks | Ömür | Erişim |
|---|---|---|---|---|---|---|---|---|
| **Çalışma belleği** | Derlenmiş paket + işçinin geçici notları | İşçi | Geçici | — | — | — | Deneme süresi; paketin kendisi 30 gün saklanır (denetim için) | Derleyicinin çıktısıdır |
| **Görev belleği** | Spec (kabulden sonra değişmez; değişiklik = yeni sürüm), **brief** (yaşayan özet), deneme geçmişi, bulgular, checkpoint'ler | Çekirdek + görev sahibi işçi | Brief: değişir+sürümlü; geri kalan: append-only | Evet | Brief = sürekli sıkıştırılmış durum | FTS (brief) | Açıkken sıcak; kapanınca brief + künye kalıcı, transkript 30 gün | Görev ID ile |
| **Proje belleği** | Proje dosyası (dossier: amaç, kapsam, kısıtlar, durum, sözlük), karar defteri, kilometre taşları | Küratör (önerir), sahip/bakımcı (kapsamı onaylar) | Dossier: değişir+sürümlü; kararlar: değişmez | git | Dossier özeti ≤1.000 token | FTS + vektör | Proje ömrü; sonra arşiv | Proje ID + anlamsal |
| **Bilgi belleği** | Atomik iddialar/gerçekler: ifade + kanıt + güven + geçerlilik aralığı | Küratör | **Üzerine yazılmaz**; yeni sürüm eskisini `supersedes` ile geçersiz kılar | git | Kümelenir/birleşir | FTS + vektör | `review_at` (vars. 180 gün), `valid_until` | Anlamsal + filtre (hassasiyet) |
| **Kararlar (ADR)** | Bağlam, seçenekler, karar, gerekçe, geri alma planı | Belirlenmiş karar verici (planlayıcı/doğrulayıcı/insan) | Değişmez; yalnızca yenisiyle geçersiz kılınır | git | Başlık + tek satır indeks | FTS | Kalıcı | Kapsam + referans |
| **Dersler** | "Şu koşulda → şunu yap/yapma" + kanıt görevleri | Küratör (görev künyelerinden) | Aday → doğrulanmış → (playbook'a terfi) | git | Birleşir | FTS + vektör | 90 gün pekiştirilmezse arşiv | Görev tipi/rol/araç/model |
| **Prosedürel (playbook/skill)** | Çalıştığı kanıtlanmış yöntemler | Küratör önerir, kapı onaylar | Sürümlü; aktif/pasif bayrağı | git | — | Skill indeksi | Kullanımdan kaldırılana dek | Görev tipine göre |
| **Sahip tercihleri — açık** | Sahibin *kendi söylediği* tercihler (dil, üslup, saatler, sınırlar) | Yalnızca sahip (veya sahibin teyidiyle) | Değişir+sürümlü | git | Profil ≤1.500 token | Etiket | Sahip değiştirene dek | İlgili etiketler her pakete |
| **Sahip tercihleri — çıkarılmış** | Hipotezler ("sabahları daha kısa cevap istiyor olabilir") | Küratör | Yalnızca aday | DB | — | — | 60 gün içinde teyit edilmezse düşer | **Sonuçlu eylemlerde kullanılmaz**; teyit sorusu üretir |
| **Sistem durumu** | Görevler, lease'ler, kotalar, sağlık | Çekirdek | Değişir | Olay günlüğü | — | SQL | — | "Hatırlanmaz", araçla sorgulanır |
| **Ajan durumu** | Yalnızca lease + checkpoint işaretçisi + config sürümü | Çekirdek | Değişir | Olay günlüğü | — | SQL | — | Yeniden başlatmada |
| **Model/provider performans geçmişi** | Çağrı metrikleri, eval sonuçları | Router + eval | Ham: append-only; özet: toplu | — | Kayan pencereler | SQL | Ham 90 gün, özetler kalıcı | Yalnızca router (LLM context'ine girmez) |
| **Arşiv (epizodik)** | Ham olaylar, transkriptler, ham web yakalamaları | Çekirdek | Değişmez | — | — | Opsiyonel FTS | Sınıfa göre TTL | Yalnızca açık arama (bakımcı veya "arkeoloji" görevi) |

### 4.3 Bir hafıza öğesinin şekli

```yaml
id: mem_01JAX…            # ULID
layer: knowledge          # knowledge | lesson | preference | decision | playbook | dossier
scope: project:ev-tadilat  # global | project:<slug> | task:<id>
type: fact
statement: "Mahalledeki eczanenin pazar nöbet listesi belediye sitesinde yayımlanıyor."   # ≤ 200 token, tek iddia
evidence: [art:sha256:9f…#L12-L18, task:tsk_01J…]
source_trust: web_official  # owner_stated | verified_tool | web_official | web_other | model_inference
confidence: 0.8
sensitivity: public        # public | personal | sensitive | secret
valid_from: 2026-09-27
valid_until: null
review_at: 2027-03-27
supersedes: mem_01H…
created_by: {task: tsk_…, attempt: 3, model: "<endpoint-id>"}
approved_by: gate:auto-low-risk   # veya human:bakımcı
stats: {use_count: 4, last_used_at: 2026-10-02}
```

Kural: **İfade tek bir iddiadır.** Paragraf değil. Birleşik bilgi → birden çok öğe. Bu, çelişki tespitini, tekilleştirmeyi ve geri almayı mümkün kılar.

### 4.4 Bilgi derleme boru hattı (gözlemden bilgiye)

```
[İşçi sonucu] ─► gözlemler (≤ K adet, tipli, kanıt referanslı)
                     │
                     ▼
1. TRİYAJ (kural + ucuz model, T0/T1):  tekrar mı? (hash + embedding benzerliği) · değersiz mi? · hangi katman?
                     │   → çoğu burada düşer; işlenmeyen aday 14 günde kendiliğinden düşer
                     ▼       ("önemli olan tekrar eder" — tekrar gözlenirse geri gelir)
2. BİRLEŞTİRME (küratör, günlük toplu iş):  kümeleme · mevcut bilgiyle birleştirme · çelişki tespiti
                     │   → çelişki = ayrı kayıt; kanıt kalitesi/tazeliğiyle çözülür ya da insana
                     ▼
3. KAPI (risk sınıfına göre):
      düşük risk (kamuya açık gerçek, yüksek güven, resmi kaynak)  → otomatik + farklı aileden doğrulayıcı
      tercih / playbook / sahip hakkında her şey                   → insan onayı
      web'den gelen, talimat gibi görünen içerik                   → karantina
                     │
                     ▼
4. YAYIN: knowledge/ deposuna commit (her öğrenme bir commit'tir → git revert ile geri alınır)
          → indeksler (FTS, vektör) ve Hermes'e giden izdüşümler yeniden üretilir
                     │
                     ▼
5. ÇÜRÜME: kullanılmayan (90 gün) → arşiv · review_at gelen → yeniden doğrulama görevi (bütçeliyse)
           · valid_until geçen → geçersiz
```

**Tek yazıcı kuralı:** `knowledge/` deposuna yalnızca küratör işi yazar. İşçiler öneri üretir, yazmaz. Böylece birleştirme çatışması ve "iki ajan aynı gerçeği farklı yazdı" sorunu yapısal olarak yok olur.

### 4.5 Context derleyici (işçi neyi görür?)

Her rol için bir **tarif (recipe)** vardır. Derleyici sırayla doldurur ve bütçe dolunca durur:

1. **Sabit çekirdek** (her zaman): rol talimatı · anayasanın bu role ilişkin kısa alıntısı · görev spec'i · kabul kriterleri.
2. **Durum**: görevin güncel brief'i · kapsamdaki kabul edilmiş kararların başlıkları · bu role atanmış açık sorular.
3. **Sahip**: açık tercihlerin göreve ilişkin etiketli alt kümesi.
4. **Getirilen (retrieval)**: hibrit arama (FTS5 BM25 + vektör) → kapsam ve **hassasiyet filtresi** → yeniden sıralama → en iyi N öğe (her biri ID'siyle).
5. **Artefakt dizini**: yalnızca adlar + tek satır özetler; içerik gerekirse `artifact.read(id, aralık)` ile çekilir.

| Rol | Tipik bütçe | Not |
|---|---|---|
| Fonksiyon işçisi | 2–6k token | Çoğu zaman yalnızca 1+2 |
| Ajan işçisi | 6–16k token | Modelin context penceresinin en fazla ~%25–30'u; kalan alan iş için |
| Doğrulayıcı | 4–10k token | Üreticinin akıl yürütmesini **görmez**; yalnızca spec + çıktı + kanıt |
| Planlayıcı | 8–20k token | Proje dosyası + karar defteri ağırlıklı |

**Derlenen paket saklanır** (30 gün). Böylece "bu ajan bu kararı verirken ne biliyordu?" sorusu her zaman cevaplanabilir — hata ayıklama ve öğrenmenin temeli.

**Hassasiyet ile yönlendirme birleşir:** Her provider'ın bir *yetki seviyesi (clearance)* vardır (örn. yerel model: `sensitive`; eğitimde kullanmayan ücretli: `personal`; eğitimde kullanan ücretsiz: yalnızca `public`). Derleyici, seçilen modelin seviyesinin üstündeki öğeleri pakete koymaz; router da görevin veri sınıfının altındaki provider'ları seçemez. Babanın sağlık/finans bilgisi bu sayede yapısal olarak yalnızca yerel veya açıkça onaylı provider'lara gider.

**Türkçe notu:** Türkçe eklemeli bir dil; varsayılan BM25 tokenizer'ı ekleri kaçırır. FTS5'in `trigram` tokenizer'ı + çok dilli bir yerel embedding modeli ile başlanmalı; seçim kurulumda küçük bir Türkçe getirme test setiyle ölçülerek yapılır.

### 4.6 Geri basınç (backpressure): araştırma, sindirmeyi aşamaz

Eski sistemin en büyük hatalarından biri: bilgi, kullanılabilir hafızaya dönüşmesinden hızlı üretildi. Çözüm bir geri besleme döngüsü:

- Triyaj kuyruğu + birleştirme kuyruğu bir eşiği aşarsa (örn. 200 bekleyen aday), **zamanlayıcı araştırma ve keşif türündeki görevlere lease vermeyi durdurur.**
- Sahibin istekleri ve bakım etkilenmez.
- Böylece sistem sindiremeyeceği kadar gözlem *üretemez*.

### 4.7 Özet kayması (summary drift) önlemi

Özetin özetinin özeti zamanla gerçeklikten kopar. Kurallar:

- Her özet (brief, dossier özeti) kaynaklarının ID listesini taşır.
- Periyodik yeniden üretim **birincil kaynaklardan** yapılır, önceki özetten değil.
- Brief'e her katlama işlemi eski sürümü saklar; sapma şüphesinde fark alınabilir.

### 4.8 Hafıza sağlığı ölçütleri (haftalık rapora girer)

- Katman başına boyut ve büyüme hızı (bütçe aşımı = alarm)
- Gözlem → bilgi dönüşüm oranı ve düşme oranı
- Bekleyen aday sayısı / en eski adayın yaşı
- Açık çelişki sayısı
- 90 günde hiç getirilmemiş bilgi oranı (yüksekse gereksiz saklıyoruz)
- Getirme kalitesi: küçük bir test seti ("X görevi için paket A ve B gerçeklerini içermeli") üzerinde isabet

### 4.9 Uygulama sırası: tasarım tam, kurulum kademeli

Bu bölüm hedef mimariyi tarif ediyor; hepsi ilk gün kurulmaz. Tek bir hanenin hacmi düşük olacak ve erken otomasyon, eski sistemin "meşguliyet" hastalığını geri getirir:

- **Faz 2:** `USER.md` (yalnızca babanın teyit ettiği açık tercihler) + elle tutulan birkaç `knowledge/*.md` dosyası. Haftalık gözden geçirmede `kurator` kartı yalnızca bir *değişiklik önerisi* (diff) hazırlar; sen uygularsın.
- **Faz 4:** Triyaj, birleştirme, otomatik kapı ve çürüme ancak **hacim gerektirince** otomatikleşir (haftalık elle küratörlük 30 dakikayı aşarsa ya da bekleyen gözlem eşiği geçilirse).
- Katmanlar, şema, bütçeler ve sağlık ölçütleri ilk günden *kural* olarak geçerlidir; değişen yalnızca kimin uyguladığıdır (önce sen, sonra küratör).
---

## 5. Anayasa / kurallar katmanı

### 5.1 Üç kademe: Anayasa ≠ Politika ≠ Konfigürasyon

| Kademe | Ne içerir | Kim değiştirir | Değişiklik süreci | Örnek |
|---|---|---|---|---|
| **Anayasa** | Otorite, para, sırlar, dış iletişim, yıkıcı işlemler, mahremiyet, kendini değiştirme sınırları, acil durdurma | **Yalnızca bakımcı (insan)**; ajanlar asla | Gevşetme: öneri + test + **24 saat bekleme** + bakımcı onayı. Sıkılaştırma: hemen | "Harcama limiti: 0 TL" |
| **Politika** | Şerit bütçeleri, rol başına araç izinleri, saklama süreleri, onay eşikleri (anayasanın altında), sessiz saatler, yönlendirme kısıtları | Bakımcı; ajanlar yalnızca **önerir** | Öneri → otomatik doğrulama → bakımcı onayı → sürümlü yükleme | "Araştırma şeridi günlük en fazla 40 istek" |
| **Konfigürasyon** | Model kaydı, uç noktalar, zaman aşımları, eşzamanlılık, prompt şablonları | Bakımcı; çekirdek **politika sınırları içinde** otomatik ayar yapabilir | Git commit; otomatik ayarlar olay günlüğüne yazılır | "Groq zaman aşımı 45 sn" |

Temel kural: **Anayasa bir prompt değildir.** Anayasa kodla (hata durumunda engelleyen politika kancası), işletim sistemi izinleriyle (salt-okunur dosyalar, ayrı kullanıcı) ve yetenek minimizasyonuyla (profil başına araç seti) uygulanır. Prompt'taki metin yalnızca modelin boşuna denememesi içindir. LLM ikna edilebilir, kandırılabilir, şaşırabilir; dosya izni ve kod kontrolü ikna edilemez.

### 5.2 Anayasa maddeleri (ilk sürüm önerisi)

1. **Otorite.** Sahip (baban) kendi işleri ve istekleri üzerinde son sözdür. Bakımcı (sen) sistem üzerinde son sözdür: politika, kurulum, provider, anayasa. Ajanların otoritesi yoktur; yalnızca görev kapsamında, sınırlı, devredilmiş yetenekleri vardır.
2. **Para.** Harcama limiti **0**. Sistemde hiçbir ödeme aracı (kart, cüzdan) tanımlı olmaz; provider hesaplarında kayıtlı kart bulunmaz. Hermes'in "şifre & giriş kasası"nın ödeme/adres doldurma özelliği kapalıdır. Ücretli kullanım yalnızca bakımcının önceden onayladığı, sabit tutarlı bir bütçe kaydıyla mümkündür.
3. **Sırlar.** API anahtarları ve token'lar yalnızca sır deposunda durur; prompt, log, yorum, artefakt veya mesajlara asla girmez. İşçiler anahtar değil *yetenek* alır. Çıktılar sır kalıplarına karşı taranır; bulunursa karantina + alarm.
4. **Dış iletişim.** Sahip ve bakımcı dışında hiç kimseye mesaj/e-posta/gönderi gönderilmez. Sistem **taslak hazırlar, insan gönderir.** (Sonraki fazlarda: tam içerik + alıcı onaylandıktan sonra, onayın hash'ine bağlı tek seferlik gönderim.)
5. **Yıkıcı işlemler.** Kalıcı silme yok; "silme" = çöp kutusuna taşıma (30 gün). Çalışma alanı dışında yazma yok. Toplu değişiklik = onay.
6. **Mahremiyet.** Veri sınıfları: `public`, `personal`, `sensitive`, `secret`. `sensitive` (sağlık, finans, kimlik, aile içi konular) yalnızca yerel modele veya bakımcının açıkça onayladığı, eğitimde kullanmayan provider'a gider. Verisini eğitimde kullanan ücretsiz katmanlar yalnızca `public` görür.
7. **Finansal, hukuki, sağlık kararları.** Hermes bilgi verir, seçenekleri karşılaştırır; **karar vermez, işlem yapmaz.**
8. **Kendini değiştirme sınırları.** Ajanlar şunları değiştiremez: anayasa, politika, çekirdek/eklenti kodu, Hermes konfigürasyonu, kendi ve başka profillerin araç izinleri, eval setleri, sırlar, yedekleme ayarları. Hepsini **önerebilir**.
9. **Onay.** Onay tam içeriğe (hash) bağlıdır, tek kullanımlıktır, süresi dolar (varsayılan 24 saat). Onaydan sonra içerik değişirse onay geçersizdir.
10. **Acil durdurma.** Sahip veya bakımcı tek komutla ("DUR") tüm otonom işi durdurabilir: yeni iş başlamaz, çalışanlar iptal edilir, dış eylemler engellenir. Yeniden başlatma yalnızca bakımcıyla.
11. **Dürüstlük.** Doğrulama kaydı olmadan "bitti" denmez. Başarısızlık gizlenmez; özetlerde görünür.
12. **Kaynak disiplini.** Tüketicisi olmayan iş başlamaz. Keşif/merak bütçesi varsayılan 0'dır.
13. **Hesap ve kullanım koşulları.** Provider başına tek hesap; kota aşmak için çoklu hesap, anahtar çiftliği, captcha aşma, koşullara aykırı kazıma yok.
14. **Denetim.** Her dış etki ve politika kararı kaynağıyla (hangi görev, hangi model, hangi politika sürümü) kaydedilir; ajanlar bu kayıtları değiştiremez.
15. **Anayasa değişikliği.** Sıkılaştırma hemen yürürlüğe girer. Gevşetme: yazılı öneri + politika testleri + 24 saat bekleme + bakımcı onayı; sahibi etkiliyorsa sahibe de sade Türkçe özet.

### 5.3 Uygulama noktaları (defense in depth)

| Katman | Ne yapar | Kimi durdurur |
|---|---|---|
| 1. İşletim sistemi | Hermes ayrı bir kullanıcıyla çalışır; `policy/`, Hermes `config.yaml` ve eklenti klasörü o kullanıcıya **salt-okunur**; WSL2'de Windows disklerinin otomatik bağlanması ve Windows programlarını çalıştırma (interop) kapalı | Her şeyi — model ne derse desin |
| 2. Profil araç setleri | Her rolde yalnızca gereken araçlar; babanla konuşan profilde terminal yok | Yeteneği hiç olmayan eylemi |
| 3. Politika kancası (kod) | Hermes'in `pre_tool_call` kabuk kancası, **`fail_closed: true`**: script hata verir ya da zaman aşımına uğrarsa araç **engellenir** (çıkış kodu 2 = engelle). Kart sözleşmesi, yorum kuralları, yasak yollar (`auth.json`, `.env`, `policy/`, config), sır kalıbı taraması | Anayasa/politika ihlali |
| 4. Hermes onayları | Tehlikeli komut kalıpları; gözetimsiz modlarda (cron, API, tek sorgu) varsayılan **red** | Riskli terminal komutları |
| 5. Konteyner | Kod çalıştırma Docker içinde; konteyner = sınır | Kodun ana sisteme dokunmasını |
| 6. Sır izolasyonu | Alt süreçlere temizlenmiş ortam; sağlayıcı anahtarları alt süreçlere geçmez | Anahtar sızıntısını |
| 7. Prompt metni | Kısa bilgilendirme | Yalnızca boşa denemeyi |

**Neden middleware değil de kanca?** Hermes'in *middleware* katmanı hata durumunda işlemi **geçirir** (fail-open) — bir güvenlik kapısı için kabul edilemez. `pre_tool_call` kabuk kancası ise `fail_closed: true` ile hata ve zaman aşımında aracı durdurur. Middleware yalnızca başarısızlığı güvenlik açığı yaratmayan ikincil işlerde kullanılır (redaksiyon, brief-katlama).

**Sert taban 1, 2, 5 ve 6. katmanlardır.** Kanca güçlü ama yazılımdır; yapılandırmadan silinir ya da yanlış yazılırsa (Hermes bilinmeyen kanca adlarını uyarıyla atlar) hiç çalışmaz. Bu yüzden:
- Gateway her başladığında ve saatte bir **kanarya testi**: engellenmesi gereken zararsız bir çağrı (ör. `policy/`'ye yazma) denenir; engellenmezse otonom işler durdurulur ve sana alarm gider.
- **Karar: `config.yaml`, kanca script'leri ve eklenti dizini `hermes` kullanıcısına salt-okunur.** Hermes'in çalışma anında config'e yazdığı durumlar (onay ekranındaki "her zaman izin ver"in kalıcılaştırılması, bazı onay sorularının kapatılması, tüm kullanıcılara izin köprüsü) zaten sohbetten *kalıcı olarak gevşetilmesini istemediğimiz* şeyler. Faz 1'de Hermes'in bu yazma hatalarını düzgün karşıladığı test edilir; karşılamıyorsa: yazılabilir config + dakikalık bütünlük kontrolü (git'teki sürümle fark → geri yükle + alarm).

### 5.4 Politika değişikliği yaşam döngüsü

```
ÖNERİ (ajan: policy.propose  |  insan: doğrudan)
  → OTOMATİK DOĞRULAMA: şema · politika birim testleri ("worker profili mesaj gönderemez", "harcama > 0 → red")
                        · risk etiketi (sıkılaştırma / gevşetme / nötr) · anayasa ile çelişki kontrolü
  → İNCELEME: bakımcı (panel/Telegram'da diff + gerekçe + kanıt); gevşetmede 24 saat bekleme
  → UYGULAMA: git commit (etiketli) → servisler yeniden yükler → her olay kaydı `policy_version` taşır
  → İZLEME: 7 gün boyunca ilgili metrikler (red sayısı, onay sayısı, hata oranı) önceki haftayla karşılaştırılır
  → GERİ ALMA: git revert → yeniden yükle. Yeni sürüm yüklenemezse (şema/test hatası) servis
               son-bilinen-iyi (last-known-good) sürümde kalır ve alarm verir.
```

---

## 6. Hedefler ve öncelik sistemi

### 6.1 Hiyerarşi

| Seviye | Ufuk | Kim oluşturur | Nerede | Örnek |
|---|---|---|---|---|
| **Misyon (charter)** | Yıllar | Sahip + bakımcı | `knowledge/charter.md` | "Babamın günlük işlerini hafifletmek; bilgiye erişimini kolaylaştırmak" |
| **Hedef (goal)** | Aylar | Yalnızca insan (ajan önerebilir) | `knowledge/goals/` | "Ev tadilatını bütçe içinde bitirmek" |
| **Proje** | Haftalar | İnsan onayı | Kanban üst kartı (epic) + proje dosyası | "Mutfak için 3 usta teklifini karşılaştır" |
| **Öncelik yığını** | Hafta | Haftalık gözden geçirmede insan | `knowledge/priorities.yaml` | En fazla 3–5 aktif proje, ağırlıklarıyla |
| **Görev** | Dakika–saat | Karşılama, planlayıcı, zamanlama | Kanban kartı | "Teklif PDF'lerinden kalem-fiyat tablosu çıkar" |
| **Bakım** | Sürekli | Politika | Sistem panosu | Yedek doğrulama, sağlık kontrolü |
| **Keşif / merak** | — | Yalnızca onaylı öneri | Varsayılan bütçe **0** | "Yeni ücretsiz modelleri dene" (yalnızca eval şeridinde) |
| **Fırsatçı iş** | — | Sahibin onayladığı "bir gün" listesi | `knowledge/someday.md` | "Eski fotoğrafları tarihe göre klasörle" |

**Uygulamada hafif:** Faz 2–5'te bu hiyerarşi yalnızca üç şeydir: `charter.md`, `priorities.yaml` ve Kanban kartları (proje = etiketli üst kart). Ayrı hedef/proje dosyaları ve biçimsel karar kayıtları (ADR) Faz 6'da ya da ilk gerçek karar geri dönüşünde eklenir. Kavramsal ayrım ise ilk günden geçerlidir, çünkü "tüketicisiz iş yok" kuralı ona dayanır.

### 6.2 Şeritler (lanes) ve kapasite rezervasyonu

| Şerit | İçerik | Kapasite payı | Kesilebilir mi? |
|---|---|---|---|
| **P0 Etkileşimli** | Sahip şu an bekliyor | Her zaman ayrılmış 1 işçi yuvası + günlük güçlü-model kotasının ~%25'i | Hayır |
| **P1 Taahhüt** | Kabul edilmiş, sahibi bekleyen teslimatlar | Kalan kapasitenin çoğu | P0 için checkpoint'te |
| **P2 Bakım** | Yedek, sağlık, saklama, küratör | Sabit küçük pay | P0/P1 için |
| **P3 İyileştirme** | Eval, getirme ayarı | Yalnızca "gece kullanılmazsa yanacak" kota | Evet |
| **P4 Keşif** | Onaylı keşif projeleri | Varsayılan 0 | Evet |

Kanban'da bu şeritler **öncelik bantlarına** eşlenir (Kanban kartları "önce öncelik, sonra en eski" sırasıyla dağıtır). Bant ataması deterministik bir kuralla yapılır; ajan kendi kartının önceliğini yükseltemez (politika kancası `kanban_create`/`edit` çağrılarında bandı doğrular).

### 6.3 Öncelik nasıl aşağı iner?

```
etkin_öncelik = şerit_bandı
              + proje_ağırlığı (öncelik yığınından)
              + son_tarih_yakınlığı
              + bekleme_yaşlanması   (açlığı önler)
              + sahip_bekliyor_bayrağı
```

- Hesap **çekirdeğin** işidir; işçiler iş seçmez, dispatcher atar (pull modeli).
- Alt görevler ebeveynin bandını ve bütçe zarfını miras alır; alt görev ebeveynden yüksek bantta olamaz.
- Öncelik yığını değişince (haftalık gözden geçirme) açık kartların bantları tek seferde yeniden hesaplanır.

### 6.4 Acil bir iş geldiğinde

1. Karşılama kartı P0 bandında açar (sahip bekliyorsa).
2. Boş işçi yuvası varsa hemen dağıtılır; ayrılmış P0 yuvası sayesinde genelde vardır.
3. Yoksa, en düşük bantta çalışan iş **bir sonraki checkpoint'te** durdurulur (kooperatif kesme; yan etki ortasında asla öldürülmez), kartı brief'i ve checkpoint'iyle kuyruğa döner.
4. Kota yetersizse P0, ayrılmış kotayı kullanır; o da bittiyse sahibe dürüstçe "şu an sınırlı modla cevap veriyorum" denir ve yerel modele düşülür (kalite bayrağıyla).

### 6.5 Meşguliyet üretmeye karşı kurallar

1. **Tüketicisiz görev reddedilir** (kod kontrolü: kart gövdesinde `TÜKETİCİ` alanı zorunlu).
2. **İş üretimi sınırlı:** Bir işçi yalnızca kendi bütçe zarfı içinde alt görev açabilir; proje açamaz, yalnızca önerir. Görev başına alt görev sayısı ve günlük toplam kart açma hızı sınırlıdır.
3. **Araştırmanın durdurma koşulu zorunlu:** soru + yeterli-kanıt ölçütü + bütçe + çıktı şeması (cevap, güven, kaynaklar).
4. **Çıktı/aktivite oranı izlenir:** sahibin kabul ettiği teslimat / tüketilen kapasite. Düşerse P3/P4 otomatik kısılır ve bakımcıya rapor gider.
5. **Boşta kalmak meşrudur.** Boş kapasite "harcanması gereken kaynak" değildir. Tek istisna: gece sıfırlanacak ücretsiz kota, **önceden onaylı ve sınırlı** bakım/eval işlerine harcanabilir — asla yeni araştırma icat etmeye değil.
6. **Oturum içi otonom döngüler kapalı:** Hermes'in `/loop` ve `/heartbeat` özellikleri aynı oturumda, aynı context'le tekrar tekrar çalışır — eski context şişmesi sorununun ta kendisi. Tekrarlayan iş cron → yeni Kanban kartı (taze context) yoluyla yapılır.

---

## 7. Görev sistemi ve durum makinesi

### 7.1 Karar: Görev defteri = Hermes Kanban (ikinci bir defter kurulmayacak)

Hermes'in Kanban'ı doğrulanmış olarak şunları zaten sağlıyor: SQLite'ta kalıcı kartlar; atanan profil; `triage | todo | ready | running | blocked | review | done | archived` durumları; bağımlılık bağları ve otomatik terfi; TTL'li sahiplenme (claim) ve çöken işçinin geri alınması; **sahiplik kontrollü tamamlama** (geri alınmış eski işçi yeni koşunun kartını tamamlayamaz — fiilen fencing); isteğe bağlı **idempotency anahtarı**; öncelik; görev başına yeniden deneme sınırı ve devre kesici; tipli bloklama (`dependency | needs_input | capability | transient`) ve tekrar eden blokları insana yönlendiren döngü kesici; aynı kartta inceleme (review) akışı; yapılandırılmış devir (`summary` + `metadata`); kalıcı ekler; sohbetten açılan kartlarda sonucun sohbete geri bildirilmesi; pano arayüzü.

Bunu dışarıda yeniden yazmak, bakımı sana kalan ve Hermes'in görev durumuyla **ikiye bölünen (split-brain)** bir sistem demek. Kural: **Görev durumu yalnızca Kanban'da yaşar.** Eklediğimiz her şey Kanban'ın üstünde bir *sözleşme* (kart şablonu + doğrulama kancası + konvansiyon) ya da Kanban'ın *yanında* ayrı bir konu (model kaydı, kota, bilgi) olur.

### 7.2 Kart sözleşmesi (spec şablonu)

Karşılama veya planlayıcı kart açarken gövde şu alanları taşır; politika kancası eksik alanlı `kanban_create` çağrısını **reddeder**:

```
HEDEF:        tek cümle, sonuç odaklı
TÜKETİCİ:     sahip | kart:t_xxxx | proje:<slug>
BİTTİ SAYILIR:
  - [ ] makineyle kontrol edilebilir ölçüt (varsa)
  - [ ] insanın kontrol edeceği ölçüt
RİSK:         R0 | R1 | R2 | R3            (tanım §12)
VERİ SINIFI:  public | personal | sensitive
BÜTÇE:        max_iterasyon · max_deneme · son_tarih (varsa)
GİRDİLER:     ek/mem/karar referansları (kopya değil)
KISITLAR:     ...
KAYNAK:       sahip_isteği | zamanlama:<iş> | bakım | kart:t_ebeveyn
```

### 7.3 Kavramsal durumlar → Kanban eşlemesi

| Kavramsal durum | Kanban | Giriş koşulu | Çıkış |
|---|---|---|---|
| Taslak / netleştirme | `triage` | Yeni istek; eksik bilgi | Spec tamam → `todo`/`ready` |
| Bağımlılık bekliyor | `todo` | Açık ebeveyn var | Ebeveynler `done` → `ready` (otomatik) |
| Hazır | `ready` | Bağımlılık yok | Dispatcher sahiplenir → `running` |
| Çalışıyor | `running` | TTL'li claim + heartbeat | Tamam / inceleme / blok / çökme |
| Girdi bekliyor | `blocked(needs_input)` | Sahibe/bakımcıya soru | Cevap → `unblock` |
| Kapasite bekliyor | `blocked(transient)` "kota" nedeniyle | Günlük kota bitti | Kota sıfırlanınca zamanlanmış, idempotent `unblock` |
| Yetenek/izin eksik | `blocked(capability)` | Politika reddi, araç yok | İnsan kararı (izin verilmez ya da iş değişir) |
| Doğrulanıyor | `review` | `kanban_request_review` | `denetci` profili: `complete` veya `request_changes` |
| Tamam | `done` | Doğrulama geçti (+ gerekiyorsa sahip kabulü) | — |
| İptal / eskidi | `archived` (+ neden yorumu) | İnsan/planlayıcı kararı | — |
| Başarısız / eskalasyon | `blocked` → tekrar ederse `triage` | Deneme sınırı / devre kesici | İnsan |

### 7.4 Çökme, yeniden başlatma ve "iki kez yapma" sorunu

- **Hesaplama en-az-bir-kez, dış etki tam-bir-kez.** Kart çalışması tekrarlanabilir olmalı (idempotent adımlar, checkpoint'ler). Dış etkiler ayrı ele alınır.
- **Sahiplenme:** Dispatcher TTL'i dolan veya süreci ölen işçinin kartını geri alır; sahiplik kontrollü tamamlama eski işçinin yazmasını reddeder.
- **Yeniden kurulum:** Yeni işçi kartı okur (gövde + önceki denemeler + ebeveyn devirleri + yorumlar). Bu okumanın **sınırlı** kalması için §9'daki brief kuralı şart (Hermes varsayılan olarak yorum dizisinin tamamını verir — uzun kartlarda context şişmesinin kaynağı olur).
- **Dış etkiler (ilk fazlar):** İşçi profillerinde dış etki aracı yok. Sistem taslak üretir, **gönderimi insan yapar** — tam-bir-kez garantisinin en basit ve en sağlam hali.
- **Dış etkiler (sonraki faz):** Küçük bir "etki servisi" (MCP): `effect.request(tür, içerik, idempotency_key)` → onay kuyruğu (sahip Telegram'da tam içeriği görür, onay içeriğin hash'ine bağlı) → servis tek sefer yürütür, sonucu kaydeder; tekrar deneme önce etki defterine bakar.
- **Zamanlanmış işler:** Hermes cron'un **LLM'siz (no-agent) script modu** kullanılır: bakımcıya ait, salt-okunur bir script `hermes kanban create --idempotency-key <iş>-<dönem>` çağırır — sıfır LLM çağrısı; aynı dönem için ikinci kart açılamaz. Cron'un en-fazla-bir-kez sahiplenmesi ve kaçırılan işler için tek "yetişme" çalışması korunur. LLM'li cron işi yalnızca babanın kendi hatırlatmaları için (kısa, yan etkisiz teslimat) izinlidir.
- **Asılı kalan işçi:** Çöken işçi (süreç öldü) dispatcher'ın bir sonraki turunda (≤ 60 sn) geri alınır. Ama *canlı ama ilerlemeyen* işçi için Hermes'in varsayılan eşiği **4 saat** (`kanban.dispatch_stale_timeout_seconds`) — bu ev için çok uzun: 30–45 dakikaya indirilir; işçiler düzenli heartbeat atar.

### 7.5 Yeniden deneme ve eskalasyon

| Hata sınıfı | Örnek | Tepki |
|---|---|---|
| Geçici (altyapı) | 429, zaman aşımı, 5xx | Model katmanında: bekle/başka provider (görev bunu görmez). Tükenirse kart `blocked(transient)` |
| Kalite | Şema dışı çıktı, doğrulama başarısız | Geri bildirimle yeniden (en fazla 2 inceleme turu) → daha güçlü tier → insan |
| Tanım | Belirsiz/imkânsız istek | `blocked(needs_input)`; sahibe tek, net soru |
| Politika | İzin yok | **Yeniden deneme yok.** `blocked(capability)`; bakımcıya |
| Araç | Harici araç çöküyor | Araç politikasına göre yeniden; devre kesici; bakımcıya |
| Zehirli kart | Farklı modellerle N kez düşüyor | Karantina (`triage`) + bakımcı alarmı |

Her kartın bir **bütçe zarfı** (iterasyon, deneme, son tarih) vardır; aşım = eskalasyon, asla sonsuz döngü. Hermes'in iterasyon bütçesine yaklaşırken verdiği checkpoint uyarısı ve ardışık hata devre kesicisi bu zarfın uygulayıcısıdır.
---

## 8. Roller ve ajan yaşam döngüsü

### 8.1 Rol = Hermes profili (kişilik değil, sözleşme)

Hermes'te her **profil** kendi yapılandırması, araç setleri, model ayarları, hafızası ve oturum veritabanıyla tamamen izole bir "ev"dir; Kanban kartları bir profile atanır ve dispatcher o profili işçi olarak başlatır. Bu, rol tasarımımla birebir örtüşüyor. Bir rol şunlardan oluşur: **talimat + araç seti + model gereksinimi + context tarifi + çıktı şeması + bitiş koşulları + bütçe varsayılanları.** "Kişilik" değil.

### 8.2 Gerçekten oluşturacağım roller

| Rol (profil) | Görevi | Araçlar | Model gereksinimi | Ne zaman |
|---|---|---|---|---|
| **karsilama** | Babanla konuşur. Ayrıştırır, hızlı yoldan cevaplar, kart açar, netleştirme sorusu sorar, onay ve sonuçları iletir | Kanban (oluştur/göster/yorum), okuma amaçlı web arama, hafıza (yazma onaylı). **Terminal yok, dosya yazma yok, üçüncü kişiye gönderim yok** | Türkçesi iyi, araç çağırması güvenilir; hassas veri → yerel | Faz 2 |
| **isci** (genel uygulayıcı) | Kartı yürütür: belge, tablo, özet, dosya düzenleme, basit otomasyon | Çalışma alanında dosya, web okuma, **konteynerde** terminal, belge skill'leri, Kanban işçi araçları | Kartın risk + veri sınıfına göre | Faz 2 |
| **denetci** (doğrulayıcı) | Kanban inceleme adımı: spec'e göre kontrol, kanıt kontrolü, karar | Artefakt okuma, konteynerde deterministik kontrol script'leri. Üretim aracı yok | Üreticiden **farklı model ailesi**; hakemlik eval'inden geçmiş | Faz 2 |
| **kurator** (küratör) | Gece kartı: gözlem triyajı, birleştirme, bilgi değişiklik seti | Yalnızca `knowledge/` üzerinde dal/commit açan kısıtlı araç; web yok | Ucuz + yerel ağırlıklı | Faz 2 (yalnızca öneri), Faz 4 (otomatik) |
| **arastirmaci** | Soru + durdurma koşuluyla sınırlı web araştırması; kaynaklı cevap şeması | Web arama/çekme; dış etki aracı yok; web içeriği "güvenilmez" işaretli | Uzun context, araç çağırma | Faz 5 |
| **planlayici** | Yalnızca karmaşık işlerde: alt kartlar + bağımlılıklar + kabul ölçütleri önerir | Kanban oluştur/bağla (bütçe zarfı içinde). Yürütme aracı yok | En güçlü erişilebilir tier | Faz 5 |
| **bakim** (tanılayıcı) | Anormallikte log/metrik okur, **düzeltme önerir**; uygulamaz | Salt-okunur log/metrik; öneri aracı | Orta | Faz 6 |
| **danisman** (opsiyonel) | Kıt premium modelle zor planlama/inceleme; yalnızca insan onaylı eskalasyon kartıyla | Salt-okunur | Premium (Nous Portal vb.) | İhtiyaç olursa |

**Ayrı rol olarak oluşturmayacaklarım ve nedenleri:**

- *Critic* → `denetci`'nin "plan inceleme" modu. İki ayrı eleştirmen, iki kat token ve bitmeyen tartışma demek.
- *Analyst / writer* → `isci` profilinin kart tipine göre değişen talimatı. Ayrı süreç gerektirmez.
- *Vision worker* → bir **yetenek** (görsel destekli model/yardımcı slot), rol değil. Her rol gerektiğinde görsel yetenekli modele yönlendirilir.
- *Bulk worker* → **fonksiyon işçisi**: ajan döngüsü olmayan, şemalı tek çağrılar yapan küçük script. Hermes profili bile olmasına gerek yok.
- *Reporter* → günlük özet **deterministik** olarak veritabanından üretilir; LLM yalnızca 3–4 cümlelik Türkçe anlatımı yazar.
- *System maintainer (LLM)* → yedek, saklama, sağlık kontrolü deterministik script'tir. LLM yalnızca tanı koyar ve önerir (`bakim`).

### 8.3 Kalıcı süreçler vs. görev için doğanlar

| Kalıcı (her zaman açık, LLM'siz ya da olay güdümlü) | Görev için doğar, işi bitince ölür |
|---|---|
| Hermes gateway (Telegram/WhatsApp) + içine gömülü Kanban dispatcher + cron zamanlayıcısı | `isci`, `denetci`, `kurator`, `arastirmaci`, `planlayici`, `bakim`, `danisman` işçileri |
| Hermes web paneli (yalnızca yerel ağ / Tailscale) | Fonksiyon işçileri (tek çağrılık script'ler) |
| Model kapısı (Faz 3+) | Hermes `delegate_task` alt-ajanları (yalnızca kısa, salt-okunur alt sorular) |
| Ollama (yerel modeller, Windows tarafında) | |
| Zamanlanmış operasyon script'leri (yedek, bütünlük, ölü-adam sinyali) | |

`karsilama` bir istisnadır: gateway oturumu olarak "yaşar", ama durumu defterde tutulur ve oturum **günlük döndürülür** (her gün yeni oturum; süreklilik sohbet geçmişinden değil, defterden ve profilden gelir). Uzun sohbet penceresi context şişmesinin bir başka kaynağıdır. (Hermes'in oturum döndürme/sıkıştırma ayarları kurulumda doğrulanacak.)

### 8.4 Ajan işçisinin yaşam döngüsü

```
DOĞUŞ     dispatcher kartı sahiplenir (TTL'li claim) → profil süreci HERMES_KANBAN_TASK ile başlar
  ↓
HİDRASYON kanban_show → işçi context'i; context-engine eklentisi rol tarifine göre bilgi paketini ekler;
          brief-katlama kuralı yorum dizisini sınırlar (§9)
  ↓
YÜRÜTME   araçlar · heartbeat · checkpoint yorumları · iterasyon bütçesi (%90'da uyarı)
  ↓
TESLİM    kanban_complete(summary, metadata{kanıt, ekler, gözlemler≤K, açık sorular})
          | kanban_request_review(…) | kanban_block(tür, neden)
  ↓
ÖLÜM      süreç çıkar; kapanmış kartta oyalanan süreç dispatcher tarafından sonlandırılır
```

**Bitiş koşulları (hepsi zorunlu):** teslim edildi · iterasyon sınırı · deneme sınırı · sahiplik kaybedildi · kart iptal edildi · politika reddi (→ `blocked(capability)`) · **ilerleme yok** (N adım boyunca yeni ek, yorum veya durum değişikliği yoksa blokla ve nedenini yaz — Hermes'te hazır olup olmadığı kurulumda doğrulanacak; yoksa bir kanca ile eklenir).

**Eşzamanlılık:** Ücretsiz katmanda aynı anda 2–3 ajan işçisi yeterli ve gerçekçi; fonksiyon işçileri kota izin verdikçe. Fazla paralellik ücretsiz kotada yalnızca daha hızlı 429 demek.

---

## 9. Ajanlar arası iletişim — context patlaması olmadan

### 9.1 Temel karar

**Ajanlar birbirleriyle sohbet etmez; paylaşılan, tipli durumu okur ve yazar.** Koordinasyon görev defteri (kim, ne, hangi sırayla) üzerinden, bilgi paylaşımı kartın *yaşayan özeti (brief)*, kararlar, yapılandırılmış devirler ve ekler üzerinden olur. Mesajlar yalnızca kenar notudur ve özete katlandığı anda context'ten çıkar.

Hermes'te bunun iskeleti zaten var: **kart = göreve özel oda**, yorumlar = protokol, `summary + metadata` = yapılandırılmış devir, ebeveyn kartların devirleri çocuk karta otomatik taşınır, ekler kalıcıdır. Eksik olan ve eklenmesi gereken tek kritik parça: **yorum dizisinin sınırlandırılması.** Hermes varsayılan olarak yeniden doğan işçiye yorum dizisinin **tamamını** veriyor; uzun yaşayan bir kartta bu, eski sistemdeki context şişmesinin aynısını yeniden üretir.

### 9.2 İletişim ilkelleri

| İlkel | Hermes karşılığı | Kural |
|---|---|---|
| **Spec** | Kart gövdesi | Kabulden sonra değişmez; değişiklik `[DEĞİŞİKLİK vN]` yorumu ile, gerekçeli |
| **Brief (yaşayan özet)** | `[ÖZET vN]` tipli yorum | Tek yazar: kartın o anki sahibi. ≤ 250 kelime, sabit şablon. Her devirde ve eşikte yenilenir |
| **Karar** | `[KARAR]` yorumu; proje/sistem düzeyindeyse `knowledge/decisions/ADR-xxxx.md` | Değişmez; yalnızca yeni kararla geçersiz kılınır |
| **Soru / cevap** | `[SORU @rol|@sahip]` / `[CEVAP]` | Açık sorular brief'te listelenir |
| **Devir** | `kanban_complete(summary, metadata)` | Metadata: kararlar, ek ID'leri, gözlemler, açık sorular — **kopya değil referans** |
| **Artefakt** | Kanban ekleri / `art:` referansı | Büyük içerik asla yoruma yapıştırılmaz |
| **İtiraz** | `[İTİRAZ]` | Sınırlı müzakere protokolüne tabi (§9.5) |
| **Sistem olayları** | `core.db` olayları, panel, özet | LLM işçileri bunlara abone **olmaz** |

Brief şablonu:

```
[ÖZET v7 · 2026-10-02 14:10 · yazan: isci#3]
HEDEF / BİTTİ SAYILIR: (spec'ten, 1–2 satır)
DURUM: 3–6 madde
KARARLAR: K-12 (tek satır), K-14 (tek satır)
AÇIK SORULAR: S-3 @sahip (son tarih), S-4 @denetci
SIRADAKİ: kim, ne
RİSKLER: …
EKLER: art:9f… "teklif-tablosu.xlsx — 3 usta, 41 kalem"
KATLANAN YORUMLAR: #18–#26
```

### 9.3 Uygulanan kurallar (kodla)

Politika kancası (`pre_tool_call`, fail-closed) `kanban_comment` çağrılarında şunları denetler:

1. Tipli önek zorunlu (`[ÖZET] [KARAR] [SORU] [CEVAP] [DEVİR] [İTİRAZ] [UYARI] [DEĞİŞİKLİK]`).
2. Uzunluk sınırı (ör. 1.200 karakter). Uzun içerik → ek olarak yüklenir, yorumda referans + tek satır özet.
3. Aynı içeriğin tekrar yapıştırılması (hash) reddedilir.
4. `[ÖZET]` yalnızca kartın o anki sahibinden kabul edilir.

`kanban_show` çıktısı işçiye verilmeden önce **brief-katlama** uygulanır: spec + son `[ÖZET]` + ondan sonraki en fazla K yorum + ebeveyn devirleri + kapsamdaki karar başlıkları + ek dizini. Katlanmış yorumlar kayıtta **kalır** (denetim için), ama context'e **girmez**. Son özetten sonra biriken yorum sayısı veya boyutu eşiği aşarsa, bir sonraki işçinin ilk işi yeni `[ÖZET]` yazmaktır (ya da ucuz bir fonksiyon işçisi yazar). Brief-katlama bir dönüştürme (transform) katmanıdır; başarısız olursa işçi tam diziyi görür — güvenlik değil verimlilik kaybı — ve alarm üretilir.

### 9.4 Kapsamlar

- **Görev kapsamı:** kart (ve alt kartları). Ajanlar yalnızca kendi kartlarını ve ebeveyn devirlerini görür; dispatcher işçiyi kendi panosuna kilitler.
- **Proje kapsamı:** proje dosyası + karar defteri (`knowledge/projects/<slug>/`). Kartlar buraya *referans* verir.
- **Sistem kapsamı:** sağlık, kota, politika değişiklikleri. LLM'lere yayın **yapılmaz**; context derleyici gerektiğinde tek satırlık ilgili bilgi ekler ("güçlü model kotası %10'un altında — kısa tut").
- **Küresel oda yoktur.** "Herkesin her mesajı gördüğü" bir kanal kurulmaz.

### 9.5 Müzakere gerektiğinde (sınırlı protokol)

İki rol anlaşamadığında (ör. denetçi ile işçi): en fazla **3 katılımcı, 2 tur**, önceden belirlenmiş **karar verici** (planlayıcı ya da insan). Tur 1: öneri + gerekçe. Tur 2: tek `[İTİRAZ]` ve tek `[CEVAP]`. Sonra karar verici `[KARAR]` yazar. Açık uçlu tartışma, "çoklu ajan münazarası" ve Mixture-of-Agents varsayılan olarak kapalı.

`delegate_task` (Hermes'in süreç içi alt-ajanları) kalıcı değildir; yeniden başlatmada kaybolur. Yalnızca tek deneme içindeki kısa, salt-okunur alt sorular için kullanılır. Sonucu önemliyse işçi karta yazar.

### 9.6 Açık cevap: paylaşılan context nerede yaşar, nasıl sıkışır, ne zaman atılır, yeni işçi neyi kurar?

- **Nerede yaşar?** Görev düzeyinde Kanban kartında (spec + son özet + kararlar + ekler + devirler). Proje düzeyinde `knowledge/projects/`. Sistem düzeyinde `knowledge/` ve `core.db`. Hiçbir yerde "ortak sohbet geçmişi" diye bir şey yok.
- **Nasıl sıkışır?** Üç kademede ve her kademe boyut sınırlı: (1) yorumlar özete katlanır; (2) kart kapanınca yalnızca künye (summary + metadata) sıcak kalır; (3) künyelerdeki gözlemler küratör tarafından proje/bilgi belleğine damıtılır.
- **Ne zaman atılır?** Katlanan yorumlar context'ten hemen; scratch çalışma alanı kart bitince (Hermes zaten siler, beyan edilen ekler kalır); transkriptler 30 gün sonra; kapanmış kart ayrıntıları saklama süresi (ör. 12 ay) dolunca sıkıştırılmış arşive. Özetler, künyeler ve kararlar küçüktür ve kalıcıdır.
- **Yeni işçi neyi kurar?** Spec + son özet + özetten sonraki en fazla K yorum + ebeveyn devirleri + karar başlıkları + ek dizini + rol tarifine göre getirilen bilgi. Tipik olarak 2–4k token. Fazlası gerekiyorsa ID ile **çeker**. Yeniden başlayan işçi ile ortadan katılan işçi **aynı kod yolunu** kullanır; ayrı bir "kurtarma modu" yoktur. Bu, kurtarmanın her gün test edildiği anlamına gelir.

---

## 10. Model / provider kontrol düzlemi

### 10.1 İlke

Hiçbir yerde model ID'si sabit yazılmaz. Roller **gereksinim** bildirir (ör. `araç_çağırma + JSON şema + Türkçe ≥ 0.8 + context ≥ 64k + veri_sınıfı ≤ personal`); kontrol düzlemi bunu o anki en iyi somut uç noktaya çözer. Model referansları üç biçimdedir: `rol:denetci`, `yetenek:json+tools+tr`, `tier:T1`.

### 10.2 Kayıt (registry) — `core.db`

| Varlık | Alanlar |
|---|---|
| **Provider** | taban URL, sır tutamacı (anahtarın kendisi değil), protokol, ücretsiz katman limitleri (RPM/RPD/TPM/TPD), kota sıfırlama saati, **veriyi eğitimde kullanır mı**, log saklama, **yetki seviyesi (clearance)**, durum |
| **Model (kanonik)** | kanonik ad, aile, takma adlar |
| **Uç nokta** (provider × model) | beyan edilen ve **ölçülen** context sınırı, maks. çıktı, araç çağırma / JSON şema / görsel / akıl yürütme desteği, gecikme p50/p95, hata oranı pencereleri, kota durumu, devre kesici durumu, sağlık skoru |
| **Yetenek profili** | Görev tipine göre **bizim altın setlerimizde ölçülen** skorlar: araç çağırma güvenilirliği, JSON geçerlilik oranı, Türkçe kalitesi, özet sadakati, çıkarım doğruluğu, kod, hakemlik uyumu |
| **Yaşam döngüsü** | `keşfedildi → aday → (rol bazında) nitelikli → aktif → bozulmuş → emekli` |

Not: Aynı model farklı provider'larda farklı davranabilir (quantization, context kırpma). Bu yüzden kalite **uç nokta başına** ölçülür, model başına değil.

### 10.3 Tier'lar ve kıtlık fiyatı

| Tier | Ne | Güçlü yanı | Zayıf yanı | Tipik kullanım |
|---|---|---|---|---|
| **T0 Yerel** | Ollama vb. makinede | Gerçekten sınırsız, veri dışarı çıkmaz | Donanıma bağlı, daha zayıf | Hassas veri, triyaj, sınıflandırma, embedding, sıkıştırma, ağ yokken asgari hizmet |
| **T1 Ücretsiz-toplu** | Yüksek RPD'li hızlı ücretsiz uç noktalar | Hacim, hız | Orta kalite, düşük TPM | Fonksiyon işçileri, özet, çıkarım |
| **T2 Ücretsiz-güçlü** | Günlük kotası dar güçlü modeller | Kalite | Kıt, oynak | Karşılama, isci, denetci |
| **T3 Kıt/premium** | Nous Portal premium, ara sıra Claude/Codex | En yüksek kalite | Ücretli/kısıtlı | Yalnızca insan onaylı eskalasyon |

Router her tier'a bir **gölge fiyat (shadow price)** atar (kıtlığıyla orantılı, kota azaldıkça artar). Seçim = kalite tabanını karşılayan en düşük gölge maliyet. Böylece güçlü model "müsait diye" değersiz işe harcanmaz; kalite tabanı yüksek bir iş için de ucuz model "bedava diye" seçilmez.

### 10.4 Çözümleme algoritması (her çağrıda)

```
1. Sert filtreler: yetenekler · context ≥ gereken · clearance ≥ veri sınıfı · devre kesici kapalı
                   · kota var · politika izin listesi
2. Skor: görev tipi kalite skoru (az örnekte büzülmeli / shrinkage) × sağlık × (etkileşimliyse gecikme)
         × kota payı − gölge fiyat
3. Seçim: en iyi + 2 yedek (önce FARKLI provider, sonra eşdeğer model, en son düşük tier + "bozulmuş" bayrağı)
4. Kayıt: seçim gerekçesi olay günlüğüne (hangi aday neden elendi)
```

### 10.5 Kota, oran sınırı ve 429

- Anahtar başına token kovası (RPM/RPD/TPM) hem kendi sayaçlarımızdan hem yanıt başlıklarından beslenir.
- 429 → `retry-after`'a uy, uç noktayı soğut, aynı provider'ı dövme; provider başına eşzamanlılık sınırı.
- **P0 için ayrılmış kota** (§6.2). İsteğe bağlı şeritler yalnızca "artık" kotayı kullanır.
- Kısa bekleme (dakikalar) → model kapısı çağrıyı bekletir. Uzun bekleme (günlük kota bitti) → kart `blocked(transient: kota)` olur ve kota sıfırlanınca zamanlanmış, idempotent bir işle açılır. **Kota bitmesi başarısızlık değildir.**

### 10.6 Sağlık ve devre kesiciler

- Önce **pasif** sağlık: gerçek trafikten kayan pencere (hata oranı, zaman aşımı, gecikme).
- **Aktif** yoklama yalnızca boşta duran kritik uç noktalar için, seyrek ve minicik (ücretsiz kotayı yememesi için).
- Devre kesici: ardışık N hata ya da oran eşiği → açık → soğuma → yarı açık tek deneme → kapalı.
- Model sessizce değişirse (aynı ad, farklı davranış): kanarya çıktılarında/skorlarda sapma → "yeniden değerlendir" işareti.

### 10.7 Zarif bozulma merdiveni

1. Aynı model, başka provider.
2. Eşdeğer kalite, başka model.
3. **Yüksek değerli iş için bekle** (sessizce kaliteyi düşürme). **Acil iş için** düşük tier + daha sıkı doğrulama + çıktıda "sınırlı mod" notu.
4. Tüm uzak provider'lar erişilemez → **yalnızca-yerel mod:** karşılama yerel modelle asgari hizmet verir, geri kalan kuyruğa girer, sahibe durum açıkça söylenir.

### 10.8 Keşif (discovery)

Yapılandırılmış provider'ların model listeleri günde bir çekilir → yeni model **aday** olur → kısa duman testi (sohbet, JSON, araç çağırma, Türkçe) → rol eval'leri → yalnızca geçtiği roller için **nitelikli**. `denetci` ve `planlayici` rollerine terfi **bakımcı onayı** ister. Eval bütçesi sınırlı ve yalnızca P3 şeridinde. Yeni bir model "ünlü" diye değil, bizim setimizde ölçüldüğü için kullanılır.

### 10.9 Uygulama yolu (yeniden yazmayı en aza indiren)

- **Faz 1–2 (basit):** Hermes'in kendi model ayarları: profil başına ana model + `fallback_providers` zinciri + yardımcı slotlar (sıkıştırma, görsel vb.) mümkün olduğunca yerel modele. OpenRouter kullanılıyorsa `data_collection: deny`. En fazla 3 provider. Anahtarlar Hermes'in sır mekanizmasında (alt süreçlere geçmez).
- **Faz 3 (model kapısı):** Küçük, yerel, OpenAI-uyumlu bir servis. Hermes bunu `provider: custom` olarak görür. **Tüm profiller ve 11 yardımcı slotun hepsi** buna yönlendirilir (`auto`da bırakılan tek bir slot kendi anahtarıyla doğrudan provider'a gider ve "anahtarlar yalnızca kapıda" ilkesini bozar). Hermes'in kendi `fallback_providers` ve kimlik bilgisi havuzları bu profillerde **kapatılır** — iki bağımsız failover katmanı "sağlıklı" tanımında anlaşamaz. Geçiş yalnızca bir config değişikliği olduğu için yeniden yazma maliyeti düşük.
- **Nous Portal** OAuth'lu bir abonelik olduğu için model kapısının arkasına konmaz; yalnızca `danisman` gibi açıkça atanmış profillerde, Hermes'in kendi Portal entegrasyonuyla doğrudan kullanılır. Kullanımı Hermes'in kullanım kayıtlarından izlenir.
- **Neden LiteLLM değil?** İkinci bir yönlendirme doğruluk kaynağı yaratır, büyük ve sık değişen bir bağımlılıktır, veri hassasiyeti ve eval güdümlü skor kavramları yoktur; sonunda config'ini zaten kendi kaydımızdan üretirdik. Kendi kapımız ~birkaç yüz satır olmalı; bakımı yük olursa yeniden değerlendirilir.
- **Hermes-4 modelleri** Nous'un kendi rehberine göre araç çağırma için ayarlanmamış; ajan rollerine atanmaz.

### 10.10 Kıt premium modeller (Opus, Codex, Portal premium)

- Otomatik yönlendirmede **yoklar.** Yalnızca `danisman` kartıyla ve insan onayıyla.
- En yüksek kaldıraç: mimari kararlar, zor hata ayıklama, kritik plan incelemesi, eval seti tasarımı, aylık "sistem sağlığı" incelemesi.
- İlk fazlarda bu modeller **bakımcının** aracıdır (ör. sen, Claude Code ile `config/` ve `knowledge/` depolarını incelersin); sistemin günlük işleyişi onlara hiç dokunmaz.
---

## 11. Değerlendirme (eval) ve model karşılaştırma

### 11.1 Amaç

Liderlik tablosu kovalamak değil: **modelleri bizim işlerimizde ölçüp rollere atamak** ve gerilemeyi (regression) / sessiz değişimi yakalamak. Hermes deposundaki `evals/` klasörü Hermes'in kendi alt sistemlerinin mühendislik testleri; model yeteneği ölçmüyor. Bu yüzden küçük bir eval koşucusu bizim tarafımızda yazılır (YAML setleri okuyan, model kapısını çağıran, deterministik puanlayan bir script).

### 11.2 Altın setler

- Rol/görev tipi başına **20–50 örnek**, **Türkçe öncelikli**, babanın gerçek kullanım biçimlerinden türetilmiş (Faz 2'den sonra gerçek kartlardan anonimleştirilerek büyütülür).
- `evals/` dizini ajanlara kapalıdır: hafızaya girmez, context'e girmez, ajanlar okuyamaz/değiştiremez. **Ajan kendi ödevini notlandıramaz.**

| Ölçülen | Nasıl puanlanır |
|---|---|
| JSON/şema uyumu | Deterministik: geçerlilik oranı |
| Araç çağırma | Sahte araç koşumu; araç adı + argüman eşleşmesi |
| Çıkarım (belgeden alan çekme) | Alan bazında doğru/yanlış, F1 |
| Özet sadakati | Referans gerçek listesi; kalibre hakem + aylık insan örneklemesi |
| Türkçe kalite | Rubrik; kalibre hakem + ayda 10 örnekte bakımcı kontrolü |
| Kod | Birim testleri |
| Hakemlik (denetci adayları) | Etiketi bilinen örneklerde uyum; eşiği geçemeyen hakem olamaz |
| Güvenlik | Talimat enjeksiyonu içeren web sayfası; aşırı reddetme kontrolü |
| Etkin context | 32k/64k/128k'da iğne testleri (beyan edilen ≠ gerçek) |

### 11.3 Çevrimiçi değerlendirme — asıl kaynak üretim

Her inceleme kararı (geçti/kaldı) ve babanın her 👍/👎'si ilgili uç noktanın görev tipi skoruna yazılır (az örnekte büzülmeli, zamanla sönümlenen ortalama). **Üretim asıl benchmark'tır;** altın setler yeni modeller ve gerileme tespiti içindir.

### 11.4 Bütçe ve tetikler

- Yalnızca P3 şeridi; gece "kullanılmazsa yanacak" kotayla; günlük üst sınırlı.
- Tetikler: yeni model keşfi · davranış sapması · aylık tazeleme · bir role terfiden önce. **Sürekli benchmark yok.**
- Çıktı: haftalık **model karnesi** — hangi uç nokta hangi rolde, neden; son değişiklikler.

---

## 12. Doğrulama / hakem mimarisi

### 12.1 Risk sınıfları (üretici değil, kural belirler)

| Sınıf | Tanım | Doğrulama |
|---|---|---|
| **R0** | İç, önemsiz, geri alınabilir (ara özet, sınıflandırma) | Yalnızca şema/deterministik kontroller |
| **R1** | Sahibe giden bilgi amaçlı teslimat | Deterministik + kanıt kontrolü + farklı aileden tek hakem (erken fazlarda %10'u bakımcı örneklemesiyle) |
| **R2** | Sonuçlu: para/sağlık/hukuk konusunda bilgi, dış iletişim taslağı, çalışacak kod | Deterministik + kanıt + hakem + **zorunlu insan onayı** (herhangi bir etkiden önce) |
| **R3** | Geri alınamaz / dış / finansal | Sistem **yalnızca hazırlar**; yürütme insanındır |

Kart tipi + veri sınıfı + hedef etki → risk sınıfı, deterministik tabloyla atanır. Üretici ajan kendi riskini düşüremez.

### 12.2 Katmanlar

```
1. DETERMİNİSTİK: şema · "bitti sayılır" maddelerinden makineyle kontrol edilebilenler · testler
                  · dosya var mı · sayılar tutuyor mu · bağlantılar açılıyor mu
2. KANIT: araştırma çıktısındaki her alıntı/rakam, önbelleğe alınmış kaynakta aranır (metin/bulanık eşleşme)
          → uydurma kaynak ve uydurma alıntıya karşı en ucuz ve en etkili kontrol
3. HAKEM (model): rubrik = kartın "bitti sayılır" listesi; üreticiden farklı aile; üreticinin akıl yürütmesini
                  ve öz-değerlendirmesini GÖRMEZ; çıktı: {karar: geçti|kaldı|belirsiz, sorunlar[{ciddiyet, yer, açıklama}], güven}
4. İNSAN: R2/R3'te zorunlu; R1'de örnekleme
```

- "Belirsiz" veya düşük güven → R1'de ikinci (yine farklı aile) hakem; R2+'da insan.
- Düzeltme döngüsü: en fazla **2** `request_changes` → sonra eskalasyon. Sonsuz "düzelt-kontrol et" döngüsü yok.
- **Sahip kabulü** son sinyaldir ve kaydedilir; hakemlerin kalibrasyonu buna göre izlenir.
- Doğrulama **değildir:** üretici modelin kendi kendini değerlendirmesi; benzer modellerin çoğunluk oylaması.

### 12.3 Hermes'te uygulanışı

Kanban'ın aynı kart üzerindeki inceleme akışı (`kanban_request_review` → inceleyici profil → `complete` / `request_changes`) kullanılır. İnceleyici profil `denetci`; varsayılan kod-inceleme skill'i yerine kod dışı teslimatlar için **Türkçe rubrikli bir inceleme skill'i** yazılır. Hermes'in `/goal` hakemi yalnızca sınırlı, ölçütü net iteratif işlerde ("testler geçene kadar düzelt") ve iterasyon tavanıyla kullanılır; açık uçlu otonomi için değil.

---

## 13. JEV'in yeri

### 13.1 Doğrulanmış gerçekler

- **Ne:** TypeSafe AI'ın **Jev**'i; sohbet modeli değil, "System One" tarzı **tipli karar modeli**. Girdi: durum (metin/JSON) + tipli sorular (`choice`, `score`, evet/hayır olasılığı). Çıktı: yalnızca tipli cevaplar ve güven; serbest metin yok.
- **Ne zaman:** 15 Eylül 2026'da halka açıldı — **iki haftalık** bir ürün.
- **Erişim:** TypeSafe API; OpenRouter'da ayrı bir "Decisions" API üzerinden (`typesafe/jev-1.13` çok ucuz, `typesafe/jev-router` ücretsiz); Cloudflare. **Experiential Labs** (`platform.experientiallabs.ai`) Jev'i sunan bir platform olarak görünüyor; TypeSafe ile ilişkisi doğrulanamadı (sayfalar bu ortamdan açılamadı).
- **Kanıt:** Kendi beyan ettiği doğruluk, en iyi LLM karşılaştırıcısının altında (~%67,8'e karşı ~%74,1). Nous Research'ün kendi deposundaki kontrollü testte (uzun transkriptlerde context sıkıştırma kararları) Jev'in sıralaması düz "en yeniyi tut" sezgiseliyle **berabere** kaldı; sonuç: "**Do not adopt Jev.**" (Bu tek bir kullanım alanı için; genel hüküm değil, ama en doğrudan birinci taraf kanıt.)
- **Hermes'teki 13 JEV eklentisinin tamamı `community` seviyesinde**; Nous veya TypeSafe tarafından değil, bireysel geliştiricilerce yazılmış. Çoğu hata durumunda **fail-open** (hata → hiçbir şey yapmaz, iş devam eder). Bazıları kullanıcı mesajlarını, önceki 4 turu, dosya içeriklerini üçüncü tarafa gönderiyor; biri, TypeSafe anahtarı yoksa sessizce ana OpenRouter anahtarını kullanıyor.

### 13.2 Karar

JEV, mimaride bir **"Tipli Karar Servisi"** arayüzünün *adaylarından biri*dir; diğer adaylar (a) küçük bir yerel sınıflandırıcı model, (b) JSON şemalı ücretsiz bir LLM'dir. Üçü aynı arayüzü uygular; kazananı veri belirler.

**JEV'in potansiyel olarak en değerli olduğu yer:** Çok sayıda, ucuz, düşük riskli evet/hayır/seçim kararı — şu an gereksiz LLM çağrısı yakan işler:

- Ayrıştırma: "Bu mesaj hızlı yoldan mı cevaplanır, kart mı açılmalı?"
- Cron kapısı: "Bu zamanlanmış iş bugün çalışmaya değer mi (yeni bir şey var mı)?" — yalnızca kamuya açık veride
- Tekilleştirme: "A gözlemi B bilgisiyle aynı mı?"
- Efor ipucu: "Bu kart T1 ile mi, T2 ile mi başlamalı?" (router'a *girdi*, karar değil)
- Getirme: "Bu bilgi öğesi bu görevle ilgili mi?" skoru

**Deneme yöntemi:** Önce **gölge mod** — JEV karar verir ama sonuç kullanılmaz; mevcut yöntemin kararıyla yan yana kaydedilir. ~200 karardan sonra gerçek sonuçlara (insan etiketi veya sonraki olaylar) karşı doğruluk, kalibrasyon (güven ile gerçek doğruluk uyumu), gecikme ve maliyet karşılaştırılır. Yalnızca mevcut yöntemi **ölçülebilir biçimde geçerse** o karar türü için etkinleştirilir.

**JEV asla:** anayasa/politika uygulayıcısı · onay mercii (`jev-approvals` eklentisi reddedildi) · kayıt hakemi (denetçi) · hafıza yazarı · tek arıza noktası olmaz. Her kullanımında fail-open zararsız olmalıdır (JEV cevap vermezse sistem mevcut yöntemle devam eder).

**JEV'e gidebilecek:** görev tipi, kategori, kısaltılmış/redakte edilmiş, `public` sınıfı kısa metin, aday seçenek listeleri.
**JEV'e asla gitmeyecek:** kişisel/hassas veri, sırlar, dosya içerikleri, tam transkriptler, sohbet turları, hafızanın tamamı, politika metinleri.

**Uygulama:** Topluluk eklentileri yerine kendi ince adaptörümüz (veri çıkışını biz kontrol edelim diye). Zamanlama: en erken Faz 5, yalnızca gölge mod. Faz 0–4'te hiçbir JEV eklentisi kurulmaz. Ve deneme tek bir koşula bağlı: ölçülmüş bir sorun (ör. triyaj veya cron kapısı kararlarının LLM maliyeti/kotası gerçekten can sıkıyorsa). Sorun yoksa JEV denemesi yapılmaz — merak için deneme, eski sistemin hastalığıdır.

---

## 14. Nous Portal'ın yeri

### 14.1 Doğrulanmış gerçekler

- OAuth'lu, **ücretli** bir abonelik geçidi: (1) 300+ modele çıkarım vekili (Claude, GPT-5.x, Gemini 3.x, DeepSeek V4 Pro, Qwen3.x, Kimi K2.6, GLM-5.1, MiniMax M2.7, Grok, Nemotron-3, MiMo, Nous'un Hermes-4'ü…), (2) **Tool Gateway**: web arama/çekme, görsel üretim, TTS, bulut tarayıcı, bulut terminal (araç bazında isteğe bağlı), (3) faturalama.
- Kimlik doğrulama: tarayıcı OAuth → yenileme token'ı `~/.hermes/auth.json`'da → Hermes her çağrı için kısa ömürlü, kapsamlı token üretir.
- Hermes dokümanlarında: ücretsiz katman **yok**, sayısal oran sınırı **yok**, veri saklama/eğitim politikası **yok**.
- Kullanıcıya dönük görev, hafıza, politika veya gözlemlenebilirlik ürünü **yok**.

### 14.2 Karar: Portal ne ise o

| Soru | Cevap |
|---|---|
| UI mı? | Hayır (yalnızca hesap/fatura ekranı). Sahibin arayüzü Telegram/WhatsApp; bakımcınınki Hermes paneli |
| Kontrol düzlemi mi? | **Hayır.** Kontrol düzlemi = Hermes Kanban/cron/onaylar + bizim eklentilerimiz |
| Ajan/görev arayüzü mü? | Hayır |
| Gözlemlenebilirlik yüzeyi mi? | Yalnızca kendi kullanımı/faturası için ikincil bir ekran |
| Kimlik sınırı mı? | Yalnızca **Nous hizmetleri için**. Sistemin kimlik sınırı: Tailscale + panel kimlik doğrulaması + gateway izin listesi |
| **Aslında ne?** | **(1) Provider** — aboneliğin kotasına göre T2 veya T3 · **(2) Araç sağlayıcı** — özellikle web arama ve bulut tarayıcı (ücretsiz arama API'leri kıt; bulut tarayıcı babanın oturumlarından izole) |

**Altında otoriter kalanlar:** Kanban veritabanı, `core.db`, `knowledge/`, `policy/`, Hermes `state.db`. Portal bunların hiçbirinin sahibi değildir.

**Kurallar:**
- Veri politikası doğrulanana kadar Portal (model ve araçlar) **`public` yetki seviyesinde** sayılır.
- `auth.json` bir sırdır: şifreli yedeklenir, loglara girmez.
- Portal kapalıysa veya abonelik biterse sistem ücretsiz + yerel katmanla çalışmaya devam eder; Portal'a bağlı kartlar `blocked(transient)` olur. **Sistemin hiçbir temel işlevi Portal'a bağımlı olamaz.**
- Aynı üreticiye (Nous) hem ajan çalışma zamanı hem çıkarım için bağlı olmak kabul edilebilir bir yoğunlaşma riski; ücretsiz provider'lar her zaman yapılandırılmış kalır.
- Abonelik ücreti anayasanın "harcama 0" kuralının tek istisnası olabilir: **bakımcının onayladığı sabit bütçe kaydı**, kullanıma bağlı ek ücret yok.

---

## 15. Hermes'e yerleşim: ne kullanılır, ne eklenir, ne kapatılır

### 15.1 Mantıksal bileşen → Hermes karşılığı → karar

| Mantıksal bileşen | Hermes'te | Karar |
|---|---|---|
| Görev defteri, lease/fencing, bağımlılık, idempotency | **Kanban** | **Olduğu gibi kullan** + kart sözleşmesi (kanca doğrulaması) |
| Tekrarlayan işler | Cron (en-fazla-bir-kez, yetişme politikası, **LLM'siz script modu**) | Kullan; sistem işleri yalnızca script modunda ve yalnızca idempotent kart açar |
| Roller | Profiller | Kullan; profil başına araç seti, model, talimat |
| Doğrulama | Kanban inceleme akışı + inceleyici profil | Kullan + Türkçe inceleme skill'i |
| İletişim | Kart yorumları + yapılandırılmış devir + ekler | Kullan + yorum kuralları + **brief-katlama** (eklenti) |
| Politika motoru | Dağınık (onay modları, toolset'ler, konteyner) | **İnşa et:** `fail_closed` `pre_tool_call` kabuk kancası + kanarya testi + OS izinleri. Middleware fail-open olduğu için kapı olarak **kullanılmaz** |
| Komut onayları | Onay modları; gözetimsiz modlarda varsayılan red | Kullan (`off`/YOLO asla) |
| Dış etki onayı + tam-bir-kez | Yok | Faz 1–5: insan gönderir. Faz 6+: küçük etki servisi (MCP) |
| Kısa süreli hafıza | `MEMORY.md` (2.200 kr) + `USER.md` (1.375 kr) | Kullan ama küçük; **yazma onayı açık**; `USER.md` = açık tercihlerin izdüşümü |
| Bilgi belleği + context derleme | memory-provider / context-engine arayüzleri (her birinden tek aktif) | **İnşa et:** `knowledge/` + FTS/vektör üstünde kendi context-engine eklentimiz |
| Prosedürel hafıza | Skills + Curator | Kullan; `skills.write_approval: true`; deterministik budama açık, LLM birleştirme kapalı; skills klasörü git'te |
| Model yönlendirme | Profil modeli, `fallback_providers`, kimlik havuzları, 11 yardımcı slot | Faz 1–2 kullan; Faz 3'te model kapısı + bunlar kapatılır |
| Gözlem | Web paneli (durum, oturumlar, loglar, analitik, cron, profiller, skill'ler, MCP, kanallar) + Kanban panosu + içeriksiz OTel metrikleri | Kullan + günlük özet script'i |
| Mesajlaşma | Telegram/WhatsApp/…; varsayılan-red izin listesi; yerel onay butonları | Kullan; yalnızca sahip + bakımcı izinli |
| Sırlar | Bitwarden/1Password/komut yardımcısı → env; alt süreçlere temizlenmiş env | Kullan |
| Ağ çıkış kontrolü | iron-proxy (opsiyonel) | Faz 5+ (araştırmacı/işçi konteynerleri) |
| Kod çalıştırma | Terminal backend'leri | İşçilerde **Docker**; karşılamada terminal yok |
| Hermes'in API sunucusu, webhook, ACP, MCP-sunucu modu | Var | **Kapalı** — gereksiz saldırı yüzeyi |

### 15.2 Açık / kapalı / sonra

| Durum | Özellikler |
|---|---|
| **Açık (Faz 2'den)** | Gateway (babanın seçeceği kanal) · Kanban + pano · cron (yalnızca kart açar) · komut onayları · skills (yazma onaylı) · curator (yalnızca deterministik budama) · küçük hafıza (yazma onaylı) · profiller · web paneli (yalnızca Tailscale, kimlik doğrulamalı) · dosyaların sohbete teslimi (deliverable mode) · `isci` terminali Docker'da (Faz 1'den) |
| **Kapalı** | `/loop`, `/heartbeat` (oturum içi otonomi) · açık uçlu `/goal` · **şifre & giriş kasası (özellikle ödeme/adres doldurma)** · Honcho (bulut kullanıcı modeli; mahremiyet) · Mixture-of-Agents · API sunucusu/webhook/ACP/MCP-sunucu · topluluk eklentileri (JEV ve yönlendirme eklentileri dahil) · skill hub'dan otomatik kurulum · babanın masaüstünde computer-use · onay modu `off` |
| **Sonra** | Sınırlı `/goal` (Faz 5) · bulut tarayıcı/web arama (Portal Tool Gateway, yalnızca `public`) · iron-proxy (Faz 5) · kendi context-engine eklentimiz (Faz 4) · JEV gölge denemesi (Faz 5+) |

### 15.3 Fiziksel yerleşim (tek makine)

```
Windows 11 (babanın bilgisayarı)
├─ Babanın hesabı (günlük kullanım)         ← Hermes buna ERİŞEMEZ
├─ Tailscale (bakımcının uzaktan erişimi; port açmadan)
├─ Ollama (GPU, yalnızca yerel)             ← T0 tier
├─ Görev Zamanlayıcı: WSL'i ayağa kaldır (hedef: açılışta, oturum açılmadan · yedek: otomatik oturum + anında kilit)
└─ WSL2 · Ubuntu LTS  = "Hermes cihazı"
   ├─ /etc/wsl.conf: systemd=true · Windows diskleri otomatik bağlanmaz · Windows programı çalıştırma (interop) kapalı
   ├─ kullanıcılar: hermes (servisler + işçiler) · bakimci (sudo)
   ├─ /srv/hermes/
   │   ├─ home/                 HERMES_HOME: profiller, state.db, kanban, skills     [hermes: yazar]
   │   ├─ home/…/config.yaml, plugins/                                               [root yazar · hermes salt-okur]
   │   ├─ policy/   (git)                                                            [root yazar · hermes salt-okur]
   │   ├─ knowledge/ (git)      yalnızca küratör aracı yazar
   │   ├─ core/                 core.db · model kapısı · eval koşucusu · operasyon script'leri
   │   ├─ artifacts/ · archive/
   │   └─ paylasim/             babayla paylaşılan TEK klasör (Windows'tan açıkça bağlanır: gelen/ giden/)
   ├─ systemd: hermes-gateway (dispatcher + cron içinde) · hermes-panel · model-kapisi (Faz 3)
   │           · zamanlayıcılar: yedek · bütünlük kontrolü · ölü-adam sinyali · günlük özet
   └─ Docker Engine (Faz 1): `isci`nin terminal/kod ortamı (yalnızca kartın çalışma alanı bağlı)
```

**Neden WSL2, yerel Windows değil?** Hermes'in yerel Windows kurulumu da birinci sınıf destekli ve daha az katmanlı. Ama belirleyici ölçüt **babanın kişisel verisinin izolasyonu**: kabuk erişimi olan otonom bir ajanın, babanın belgelerine, tarayıcı oturumlarına, e-postasına erişebilen bir kullanıcıyla çalışması kabul edilemez bir hasar yarıçapı. WSL2'de bu sınır *yapılandırmayla* kurulur (otomatik disk bağlama kapalı, interop kapalı, tek paylaşım klasörü) — kalıp eşleştiren onaylara güvenmek gerekmez. Ek olarak: systemd ile düzgün servisler, Hermes ekosisteminin Linux-öncelikli olması, tüm ortamın tek dosya olarak dışa aktarılıp yeniden kurulabilmesi.

**Önemli Hermes gerçekleri:** (1) Yerel Windows'ta gateway, *kullanıcı oturum açınca* başlayan bir zamanlanmış görev olarak kurulur; Windows servisi yok ve dokümanlar bunu bilerek önermiyor. Babanın hesabıyla bu, Hermes'e babanın tüm yetkilerini verir; ayrı bir hesapla ise gateway ancak o hesap oturum açınca çalışır — baba kendi hesabını her gün kullanırken bu yürümez. (2) Hermes'in kendi WSL rehberi de WSL'i *oturum açılışında* Görev Zamanlayıcı ile ayağa kaldırmayı öneriyor (WSL sanal makinesi yalnızca bir süreç onu kullandıkça açık kalır). WSL2 yolunda sanal makine babanın Windows hesabı altında çalışsa bile Linux tarafı Windows dosyalarına erişemez (otomatik bağlama ve interop kapalı); izolasyon bu yüzden korunur.

**Başlatma kararı ve yedeği:** Faz 0'da önce *oturum açılmadan* açılışta başlatma denenir (Görev Zamanlayıcı "başlangıçta"). Güvenilir değilse Hermes'in belgelediği yol kullanılır: **babanın hesabına otomatik oturum açma + oturum açılır açılmaz ekran kilidi + oturum açılışında WSL'i başlatan görev.** Yerel Windows kurulumu yedek değil, reddedilen alternatiftir: izolasyon için ayrı hesap gerektiriyor ve o hesabın oturumu açık olmadan gateway çalışmıyor.
---

## 16. Gözlemlenebilirlik (minimum ama yeterli)

### 16.1 Sorulan her soru → kaynağı → nerede görülür

| Soru | Veri kaynağı | Yüzey |
|---|---|---|
| Hermes şu an ne yapıyor? | Kanban `running` kartları + aktif gateway oturumları | Pano "Şimdi" sütunu · günlük özet |
| Neden yapıyor? | Kartın `KAYNAK` ve `TÜKETİCİ` alanları, ebeveyn/proje bağı | Kart detayı |
| Hangi ajanlar aktif, hangi kart kimde? | Kanban sahiplenmeleri (profil + koşu) | Pano |
| Hangi model/provider kullanılıyor? | Hermes kullanım kayıtları + model kapısı çağrı günlüğü (yalnızca meta veri) | Panel analitiği · haftalık model karnesi |
| Ne başarısız oldu? | Kanban olayları (`blocked`, `gave_up`, `crashed`, `timed_out`) + kapı hataları + politika redleri | "Hatalar (24s)" görünümü · alarm |
| Ne bekliyor? | Tür bazında `blocked` + `review` + onay kuyruğu | "Bekleyenler" görünümü |
| Hangi kararlar alındı? | `[KARAR]` yorumları + ADR'ler + politika commit'leri | "Kararlar (24s)" |
| Onayımı ne bekliyor? | Onay kuyruğu + `blocked(needs_input @sahip/@bakimci)` | Telegram (butonlu) · özet |
| Hangi yararlı çıktı üretildi? | `TÜKETİCİ=sahip` olan `done` kartlar + sahibin 👍'leri | "Teslimatlar" |
| Ne kadar kapasite harcandı? | Provider başına kullanım / limit | "Kota" görünümü |
| Dünden beri ne değişti? | Yeni/kapanan kartlar + `policy/`, `config/`, `knowledge/`, skills commit'leri + model kaydı değişiklikleri + Hermes sürümü | "Değişiklikler (24s)" |

### 16.2 Yığın (bilerek küçük)

1. **Olaylar:** Kanban olayları + Hermes logları + `core.db`'de `events` tablosu (politika kararları, yönlendirme kararları, model çağrısı meta verisi, onaylar, operasyon koşuları). Varsayılan olarak **içeriksiz** (prompt/yanıt metni yok); transkriptler ayrı, süreli ve redakte.
2. **Görünümler:** Hermes'in kendi paneli + Kanban panosu + `core.db` üzerinde ~10 hazır sorgu (panel eklentisi olarak ya da salt-okunur bir Datasette sayfası).
3. **Günlük özet:**
   - **Babaya** (Türkçe, teknik olmayan, 5–8 satır): "Bugün şunları hallettim · Senden beklediğim 1 şey var · Yarın şunu bitireceğim."
   - **Sana** (teknik): hatalar, bekleyenler, kota, değişiklikler, yedek durumu, anormallikler.
4. **Alarmlar** (senin Telegram'ına): DUR tetiklendi · zehirli kart · tüm provider'lar erişilemez · yedek başarısız · disk > %80 · bütünlük kontrolü başarısız · politika reddi patlaması · Hermes güncellemesi sonrası hata artışı.
5. **Ölü-adam anahtarı:** Bir zamanlayıcı her 10 dakikada harici bir sağlık servisine (ör. ücretsiz katmanlı bir "cron monitoring" hizmeti) sinyal gönderir; sinyal kesilirse o servis sana e-posta/mesaj atar. **Ölmüş bir makine kendi ölümünü bildiremez** — uzaktan bakımı yapılan bir aile bilgisayarında bu tek başına en değerli izleme parçasıdır.

**Kurulmayacak:** Prometheus, Grafana, Loki, tam OpenTelemetry yığını. Tek makinede ve bu ölçekte, SQLite + hazır sorgular + özet mesajı bu soruların hepsini cevaplıyor.

---

## 17. Hata kurtarma matrisi

| Hata | Nasıl fark edilir | Otomatik tepki | İnsan gerekir mi? |
|---|---|---|---|
| Hermes gateway çöktü | systemd | Yeniden başlatma; dispatcher sahiplenmeleri geri alır | Tekrarlarsa |
| Yeniden başlatma / Windows Update | Açılış olayı | Görev Zamanlayıcı → WSL → systemd → servisler; cron kaçırılanları **tek sefer** yetiştirir | Hayır (özette görünür) |
| Elektrik kesintisi | Açılışta bütünlük kontrolü | SQLite WAL dayanıklılığı; bütünlük kontrolü; başarısızsa alarm | Yalnızca bozulmada |
| WSL beklenmedik şekilde durdu | Ölü-adam | Keep-alive ayarı; yeniden başlatma | Tekrarlarsa |
| Provider kesintisi / 429 / zaman aşımı | Kapı sayaçları | Bekle / başka provider / devre kesici; tükenirse `blocked(transient)` | Hayır |
| Tüm provider'lar erişilemez / ağ yok | Sağlık | Yalnızca-yerel mod; kuyruk; sahibe açık bilgi | Hayır |
| İşçi oturumu bozuldu | Heartbeat/TTL | İşçi zaten geçici: sonlandır, kartı geri al, karttan yeniden kur | Hayır |
| İşçi asılı kaldı (canlı, ilerlemiyor) | Heartbeat yaşı | Stale eşiği 30–45 dk'ya indirilmiş (Hermes varsayılanı 4 saat); süreç sonlandırılır, kart yeniden dağıtılır | Tekrarlarsa |
| Politika kancası yüklenmedi/bozuldu | Kanarya testi | Kanca `fail_closed` olduğu için hata = engel; kanca hiç yüklenmediyse kanarya yakalar → otonom işler durur | **Evet** |
| Kısmi tamamlama | Kart `running`'de kaldı | Brief/checkpoint'ten devam; adımlar idempotent | Hayır |
| Çift yürütme riski | Sahiplik kontrolü | Eski işçinin tamamlaması reddedilir; idempotency anahtarları; dış etkileri insan yapar | Hayır |
| Halüsinasyon | Kanıt kontrolü, hakem | Kart geri döner; R2+'da insan onayı zaten var | R2+ |
| Geçersiz yapılandırılmış çıktı | Şema doğrulama | Hata mesajıyla aynı model → başka model → blok | Nadiren |
| Araç hatası | Araç sonucu | Araç politikasına göre yeniden; devre kesici; `blocked(capability)` | Kalıcıysa |
| Kötü otonom karar | İnceleme, sahip geri bildirimi | Yetenekler zaten sınırlı; git revert / çöp kutusu; karar kaydı | Evet |
| `state.db` / Kanban DB bozulması | Hermes kendi kendini onarma + bütünlük kontrolü | FTS kendini onarır; yapısal onarım aracı; olmazsa yedekten dönüş | Evet |
| Disk doluyor | %80 alarm | Saklama işleri; %90'da P3/P4 durur | Evet |
| Kontrolsüz kart üretimi | Kart açma hızı | Kart başına alt görev sınırı + küresel hız sınırı + devre kesici | Alarm |
| Web'den talimat enjeksiyonu | İçerik güvenilmez işaretli | Araştırmacının dış etki aracı yok; web içeriği tercih/politika/playbook olamaz; karantina | Nadiren |
| Hermes güncellemesi bir şeyi bozdu | Güncelleme sonrası hata artışı | Sürüm sabit; güncelleme öncesi anlık görüntü; geri dönüş script'i | Evet |
| Ücretsiz katman kalktı | Kayıt/keşif | Provider `emekli`; router diğerlerini kullanır; haftalık raporda | Değişiklik kararı |
| Sır sızıntısı şüphesi | Tarama/alarm | Karantina; ilgili anahtar devre dışı | **Evet: anahtar yenileme runbook'u** |
| Baba "bir tuhaflık var" diyor | İnsan | "DUR" butonu → her şey durur; özet ne yapıldığını sade Türkçe anlatır | Evet |

---

## 18. Güvenlik ve izin sınırları

### 18.1 Tehdit modeli (bu makine için gerçekçi olanlar)

1. Web sayfası, PDF veya mesaj içinden **talimat enjeksiyonu**
2. Fazla yetkili ajanın **iyi niyetli hatası**
3. **Anahtar sızıntısı** (prompt, log, artefakt, yorum)
4. Ücretsiz provider'ların veriyi **eğitimde kullanması**
5. **Tedarik zinciri:** eklentiler, skill'ler, Hermes güncellemeleri
6. Bota **yetkisiz kişilerin** yazması
7. Uzaktan erişimin ele geçirilmesi
8. Fiziksel erişim / bilgisayarın çalınması

### 18.2 Kontroller

- **Kimlik & erişim:** Gateway izin listesi yalnızca baba + sen (Hermes varsayılan olarak herkese kapalı, eşleştirme ister). Panel yalnızca Tailscale üzerinden ve kimlik doğrulamalı; internete açık port yok; Tailscale erişim listesi yalnızca senin cihazların.
- **Yetenek minimizasyonu:** Profil başına araç seti (§8.2). En önemli kural: **babayla konuşan profilde terminal yok; terminali olan profil babayla konuşmaz.**
- **İşletim sistemi izolasyonu:** WSL yapılandırması, ayrı kullanıcılar, salt-okunur config/politika/eklenti dizinleri, tek paylaşım klasörü (§15.3).
- **Kod çalıştırma:** Docker konteynerinde; yalnızca çalışma alanı bağlanır; ağ kısıtı sonraki fazda (iron-proxy).
- **Sırlar:** Sır kaynağında (parola yöneticisi CLI'si ya da root'a ait dosya); alt süreçlere temizlenmiş ortam (Hermes bunu zaten yapıyor); politika kancası yorum/ek/tamamlama çağrılarında ve dış istek gövdelerinde sır kalıplarını arar → **engeller** + alarm; `auth.json`, `.env` ve sır dizinleri kancada yasak yol; giden LLM isteklerinde ek olarak middleware ile redaksiyon (ikincil katman); log redaksiyonu; provider başına ayrı anahtar; provider panellerinde mümkünse harcama tavanı; **hiçbir hesapta kayıtlı kart yok**.
- **Veri sınıflandırma + yetki seviyesi:** §4.5 ve §10. Hassas veri yapısal olarak yalnızca yerel/onaylı provider'a gider.
- **Onaylar:** Tam içerik + hash + süre + tek kullanım.
- **Tedarik zinciri:** Hermes sürümü sabitlenir; güncelleme yalnızca bakımcıyla, değişiklik notu okunarak ve anlık görüntü alınarak. Topluluk eklentisi/skill'i incelenmeden kurulmaz; skill hub kurulumları Hermes'in karantina tarayıcısından + bakımcı onayından geçer. Kendi eklentilerimiz git'te ve testli.
- **Güvenilmez içerik:** Web/PDF içeriği güvenilmez işaretlenir; güvenilmez içeriği okuyan profilin dış etki aracı yoktur ("karantinalı okuyucu" deseni). İçerikteki talimatlar asla talimat sayılmaz.
- **Tarayıcı:** Babanın oturum açmış tarayıcısı asla kullanılmaz. Gerekirse izole başsız tarayıcı veya bulut tarayıcı; şifre & giriş kasası kapalı.
- **Fiziksel:** Windows'ta cihaz şifreleme/BitLocker açık; baba hesabında parola/PIN. Bilgisayar çalınırsa token'lar ve veriler korunur.
- **Denetim:** Tüm politika kararları kayıtlı; Faz 6'da hash-zincirli (kurcalanmaya dayanıklı) denetim günlüğü.

Not: Yasak komut listeleri (deny-list) sızdırır; birincil kontrol **yeteneği hiç vermemek** ve **konteyner sınırı**dır. Yasak listeleri ikinci kattır.

---

## 19. Yedekleme ve geri alma

### 19.1 Ne, nasıl, ne sıklıkla

| Nesne | Yöntem | Sıklık | Hedef |
|---|---|---|---|
| SQLite veritabanları (Hermes `state.db`, Kanban DB'leri, `core.db`) | Çevrimiçi tutarlı yedek (`.backup` / `VACUUM INTO`). **WAL dosyalarını tek tek kopyalamak yasak** (Hermes dokümanı da uyarıyor) | Saatlik yerel (48 adet) | Yerel |
| Hermes home (profiller, skills, hafıza dosyaları, cron işleri), `artifacts/`, `knowledge/` | restic (şifreli, tekilleştirmeli, artımlı) | Gecelik (7 günlük · 4 haftalık · 6 aylık) | Harici USB disk + bir bulut hedefi |
| `policy/`, `config/`, kendi kodumuz | git | Her değişiklikte | Senin **özel** GitHub deponda (kişisel veri içermez) |
| `knowledge/` | git (yerel) + restic | — | **GitHub'a gönderilmez** (babanın kişisel bilgilerini içerebilir); yalnızca şifreli restic |
| Sırlar (`auth.json`, anahtarlar) | Ayrı, şifreli | Değiştikçe | Çevrimdışı kopya sende |
| Tüm WSL cihazı | `wsl --export` | Aylık | Harici disk |
| Kurulum script'leri (bootstrap) | git | — | GitHub |

**Hedefler:** Veri kaybı (RPO) ≤ 1 saat yerel, ≤ 24 saat makine dışı. Yeniden ayağa kalkma (RTO) 2–4 saat.

### 19.2 Doğrulama

- **Haftalık otomatik geri yükleme testi:** son yedeği geçici dizine aç → `PRAGMA integrity_check` → satır sayısı makullük kontrolü → sonucu özete yaz.
- **Aylık/faz sonu elle tatbikat:** gerçek bir geri yükleme. Test edilmemiş yedek, yedek değildir.

### 19.3 Geri alma mekanizmaları

| Neyi geri alıyoruz | Nasıl |
|---|---|
| Politika / config / bilgi / skill değişikliği | `git revert` + yeniden yükle (skill'lerde Curator'ın tek-adım geri alma kaydı da var) |
| Hermes sürümü | Sabit sürüm; güncelleme öncesi zorunlu anlık görüntü (şema göçleri tek yönlü olabilir); geri dönüş = önceki sürüm + anlık görüntü |
| Model kaydı değişikliği | Sürümlü satırlar; geri çevir |
| Görev düzeyinde hata | Çöp kutusu (30 gün); telafi eylemleri; ilk fazlarda dış etkileri insan yaptığı için geri alınamaz eylem zaten az |
| Tüm sistem | Bootstrap script'i + son yedekten geri yükleme |

---

## 20. Sistem kendini bozmadan nasıl öğrenir?

### 20.1 İlke

Öğrenme = **öneri → kanıt → kapı → sürümlü commit → izleme → geri alma.** Sürümü ve geri dönüş yolu olmayan hiçbir öğrenme uygulanmaz.

| Ne öğrenilebilir | Nasıl | Kapı | Geri alma |
|---|---|---|---|
| Model performansı / yönlendirme ağırlıkları | Çevrimiçi skorlar | Otomatik, **politika sınırları içinde** (clearance ve tier bütçeleri aşılamaz) | Metrik kötüleşirse otomatik |
| Getirme sıralama parametreleri | Getirme test seti | Test iyileşirse otomatik | Otomatik |
| Kamuya açık, yüksek güvenli gerçekler | Küratör | Otomatik kapı + farklı aileden doğrulayıcı | git revert |
| Sahip tercihleri | Yalnızca açık beyan veya teyit | **Sahip teyidi** | git revert |
| Dersler | Küratör; 2–3 kez kanıtla tekrar edene kadar aday | Haftalık toplu bakımcı incelemesi | Arşiv |
| Playbook / skill | Ajan önerir (Hermes yazma onayıyla kuyruğa düşer) | Geçmiş kartlarda **gölge koşu** + bakımcı onayı | git / Curator geri alma |
| Rol talimatları / prompt'lar | Yalnızca öneri | Bakımcı + eval seti koşusu | git |
| Politika / anayasa | **Asla otomatik** | §5.4 | git |
| Eval setleri | **Ajanlar asla** | Yalnızca bakımcı | git |

### 20.2 Bozulmaya karşı korumalar

1. **Çapa:** Otomatik hakemler insan etiketli altın örneklere bağlıdır; hakemlerin insanla uyumu izlenir. Model-notlu değerlendirme tek başına zamanla kayar.
2. **Gölge mod:** Davranış değiştiren her şey (yeni playbook, yeni yönlendirme kuralı, JEV) önce etkisiz koşar, sonuçları karşılaştırılır.
3. **Gerileme bekçileri:** Sahip kabul oranı, doğrulama geçme oranı, teslimat başına maliyet. Düşük riskli değişikliklerde otomatik geri alma, diğerlerinde alarm.
4. **Zehirlenme savunması:** Web kaynaklı içerik insan incelemesi olmadan tercih, politika veya playbook olamaz; talimat benzeri içerik karantinaya; kaynak güven seviyeleri.
5. **Özel ajan hafızası yok** (I8): Her öğrenme görünür boru hattından geçer.
6. **Öğrenme hız sınırı:** Günde en fazla N otomatik bilgi commit'i; fazlası toplu insan incelemesine. Sel halinde sürüklenme olmaz.
7. **Haftalık "Ne öğrendik?" raporu** (sana): bilgi/skill commit'leri, terfi eden modeller, geri alınan değişiklikler.
---

## 21. Ne zaman ne: ilk günden / çekirdek oturunca / gereksiz karmaşıklık

### 21.1 İlk günden olmak zorunda (Faz 0–2)

1. İzole zemin: WSL2 yapılandırması, ayrı kullanıcılar, salt-okunur config/politika, tek paylaşım klasörü, cihaz şifreleme
2. Uzaktan bakım (Tailscale) + ölü-adam anahtarı
3. Yedek + **test edilmiş** geri yükleme
4. Anayasa v1 (`policy/` git) + `fail_closed` politika kancası + kanarya testi + salt-okunur config + profil araç seti minimizasyonu + gözetimsiz modlarda red
5. Sabit sürümlü Hermes; gateway izin listesi (baba + sen); Kanban; cron yalnızca LLM'siz script modunda idempotent kart açar; `isci` terminali Docker'da
6. Profiller: `karsilama`, `isci`, `denetci`
7. Kart sözleşmesi (spec şablonu) koda bağlı doğrulamayla
8. Model ayarı: 2–3 ücretsiz provider + yerel yedek; veri sınıfı kuralı (en basit hali: `sensitive` → yalnızca yerel)
9. Günlük özetler (baba + sen) ve hazır görünümler
10. "DUR" mekanizması
11. Yorum kuralları ve brief konvansiyonu (önce elle, sonra eklentiyle)
12. Baba ve sen dışında hiçbir yere dış etki yok

### 21.2 Çekirdek oturduktan sonra eklenecek

- Model kapısı: kayıt, sağlık, kota, eval güdümlü yönlendirme (Faz 3 — yalnızca Faz 2'de ölçülen bir sorun varsa)
- Eval koşucusu + Türkçe altın setler (Faz 3)
- Brief-katlama eklentisi (Faz 3–4)
- Bilgi derleyici + context-engine eklentisi + otomatik küratör (Faz 4 — önce insan kapılı, hacim gerektirince otomatik)
- Planlayıcı, araştırmacı, paralel DAG'ler, konteyner ağ çıkış kontrolü (Faz 5)
- JEV gölge denemesi (Faz 5+, yalnızca ölçülmüş bir maliyet sorunu varsa)
- Hedef/öncelik yığını + haftalık gözden geçirme; etki servisi; hash-zincirli denetim günlüğü (Faz 6)
- Kapılı öğrenme: playbook terfisi, yönlendirme oto-ayarı (Faz 7)

### 21.3 İlginç ama muhtemelen gereksiz karmaşıklık

- Bilgi grafiği veritabanı (Neo4j), GraphRAG
- Dağıtık vektör veritabanı (Qdrant, Weaviate, Milvus); Postgres
- Mesaj kuyruğu/broker (Kafka, NATS, RabbitMQ, Redis Streams)
- Kubernetes, mikroservisler, çoklu makine
- Prometheus/Grafana/Loki/Jaeger yığını
- Çoklu ajan münazarası, Mixture-of-Agents, ajan oylaması
- Kendi modelini ince ayarlamak (fine-tuning/LoRA)
- "Ücretsiz model listesi" sitelerini kazıyan otomatik keşif
- Otomatik prompt optimizasyonu (DSPy tarzı) — eval'ler olgunlaşmadan
- Yeniden oynatmalı tam event sourcing
- Hafıza biriktiren kalıcı "dijital ikiz" asistanlar

---

## 22. Reddettiğim fikirler

1. **Küresel ajan sohbet odası / sohbetle koordinasyon.** Context kirliliğinin kaynağı.
2. **Çok sayıda kalıcı LLM ajanı.** Biriken context, gizli durum, tekrar eden iş.
3. **LLM orkestratör / LLM zamanlayıcı.** Kontrol akışı deterministik kodda kalır.
4. **Hermes Kanban'a paralel, harici bir görev defteri.** İlk taslağımda vardı; Hermes'in Kanban'ını kaynak kodundan doğruladıktan sonra reddettim — iki defter = ikiye bölünmüş gerçeklik.
5. **"Her şeyi embed et" / herkesin okuduğu tek dev hafıza.** Hafıza derlenir; ajan yalnızca kendi paketini görür.
6. **Ajan başına özel, uzun süreli hafıza.** Denetlenemez, geri alınamaz.
7. **Sürekli benchmark ve "kendini geliştirme"yi amaç yapmak.** Kendi başına meşguliyet üretir.
8. **Boş kapasiteyi araştırmayla doldurmak; oturum içi döngüler (`/loop`, `/heartbeat`) ile arka plan işi.**
9. **Ücretsiz kotayı çoğaltmak için çoklu hesap / anahtar çiftliği.** Kullanım koşulu ihlali, ban riski, kırılganlık.
10. **JEV'i kapı, onay mercii veya kayıt hakemi yapmak; `auto` arka uçlu topluluk JEV eklentileri.**
11. **Nous Portal'ı kontrol düzlemi veya doğruluk kaynağı yapmak.**
12. **Premium modelleri otonom döngüye bağlamak.**
13. **Üreticiyle aynı aileden doğrulama; öz-doğrulama.**
14. **Ajanın babanın tarayıcı oturumlarına, e-postasına, bankasına erişmesi; şifre kasasıyla ödeme/adres doldurma.**
15. **Eski Hermes'ten durum, config, script veya veritabanı taşımak.** Yalnızca dersler taşınır (bu belge).
16. **LiteLLM'i yönlendirme beyni yapmak.** İkinci doğruluk kaynağı (§10.9).
17. **Prompt'a yazılmış bir anayasa.** Kural kodla ve izinle uygulanır.
18. **Hermes'in API sunucusunu/webhook'larını dışarı açmak.** Gereksiz saldırı yüzeyi.
19. **Hermes middleware'ini güvenlik kapısı yapmak.** Hata durumunda işlemi geçirir (fail-open). Kapı, `fail_closed` `pre_tool_call` kancasıdır.

---

## 23. Fazlı inşa sırası (yeniden yazmayı en aza indiren)

Sıralama mantığı: **Önce geri alınabilirlik ve gözlem, sonra insan güdümlü kullanım, sonra otomasyon, en son öğrenme.** Her faz bir öncekinin gerçek verisiyle beslenir; hiçbir faz sonraki fazın bileşenini "şimdiden" kurmaz.

### Faz 0 — Zemin ve kararlar

- **Amaç:** Güvenli, geri yüklenebilir, uzaktan bakılabilir, *boş* bir "Hermes cihazı". Otonomi yok.
- **Bileşenler:** Windows sertleştirme (uyku kapalı, güncelleme etkin saatleri, cihaz şifreleme), Tailscale, WSL2 Ubuntu LTS + `wsl.conf` (systemd açık, otomatik disk bağlama kapalı, interop kapalı), kullanıcılar (`hermes`, `bakimci`), dizin düzeni, WSL'i başlatan zamanlanmış görev (açılışta ya da otomatik oturum + kilit), restic + harici disk, `policy/` `config/` `knowledge/` git depoları, ölü-adam sinyali, babayla yazılmış charter + ilk 3 kullanım senaryosu, anayasa v1 metni.
- **Bağımlılık:** §24'teki 10 karar; donanım bilgisi.
- **Bitti tanımı:** (1) Fişi çek-tak → 3 dk içinde WSL ve test servisi ayakta (önce oturum açılmadan denenir; olmazsa otomatik oturum + anında kilit yolu seçilir ve test o yolla geçer); (2) Tailscale üzerinden SSH; (3) örnek bir DB'nin yedeği alınıp geri yüklendi; (4) WSL durdurulunca ölü-adam alarmı geldi; (5) `hermes` kullanıcısı `C:\Users\*`'a erişemiyor.
- **Testler:** 3 kez yeniden başlatma; `/mnt/c` erişilemez; Windows programı çalıştırılamaz; geri yükleme tatbikatı; ölü-adam testi.
- **Geri alma:** WSL dağıtımını kaldır → dışa aktarımdan yeniden içe al. Windows tarafında yalnızca belgelenmiş ayarlar değişti.
- **Otomatikleştirilmeyecek:** Her şey. LLM çağrısı yok.

### Faz 1 — Hermes çekirdeği (kilitli, bakımcı güdümlü)

- **Amaç:** Sabit sürümlü Hermes; Kanban, cron, profiller, politika kancası v1, ücretsiz + yerel modeller. Yalnızca sen kullanıyorsun; baba henüz yok.
- **Bileşenler:** Hermes kurulumu (WSL); salt-okunur config; profiller `karsilama`/`isci`/`denetci` ve araç setleri; onaylar (gözetimsiz modlarda red); sır kaynağı; model ayarı (2–3 ücretsiz provider, fallback zinciri, yardımcı slotlar mümkün olduğunca yerel, OpenRouter'da `data_collection: deny`); politika kancası v1 (`pre_tool_call`, `fail_closed`: kart sözleşmesi, yorum kuralları, yasak yollar, sır kalıbı taraması, hassas veri → yalnızca yerel) + kanarya testi; Docker Engine + `isci` terminali konteynerde; asılı işçi eşiği 30–45 dk; panolar `aile` ve `sistem`; Tailscale arkasında kimlik doğrulamalı panel; günlük teknik özet (sana); yedeklere Hermes DB'leri dahil.
- **Bağımlılık:** Faz 0.
- **Bitti tanımı:** Babanın senaryolarından 10 gerçek kart: işçi yürütür → denetçi doğrular → sonuç panelde. Görev ortasında işçi `kill -9` → geri alınır, **bir kez** tamamlanır. Görev ortasında yeniden başlatma → devam eder. Politika testleri geçer. Loglarda/eklerde sır yok.
- **Testler:** Kaos (işçi öldür, gateway öldür, yeniden başlat, geçersiz anahtarla 429 benzet, ağı kes → yerel yedek); politika birim testleri (işçi `policy/`'ye yazmaya çalışır → red; `TÜKETİCİ`'siz kart → red; uzun yorum → red; hassas kart → yetkisiz provider → red); log/ek sır taraması; cron'un aynı dönem için iki kez kart açamaması; kanca script'i bozulunca araç çağrılarının engellenmesi (fail-closed doğrulaması); `config.yaml`'a yazma denemesinin başarısız olup alarm üretmesi.
- **Geri alma:** Hermes home anlık görüntüsü; sabit sürümü yeniden kur; config `git revert`.
- **Otomatikleştirilmeyecek:** Cron yalnızca özet, yedek, sağlık. Tekrarlayan ajan işi yok. Onaysız hafıza yazımı yok. Ajanın yazdığı skill aktif değil. Dış etki yok. Baba erişimi yok.

### Faz 2 — Babayla canlı kullanım

- **Amaç:** Baba ilk 3 senaryosunda Hermes'i mesajlaşma üzerinden kullanıyor; onaylar ve sonuçlar akıyor; babaya günlük özet.
- **Bileşenler:** Seçilen kanalda gateway (izin listesi); `karsilama` (hızlı yol, kart açma, babanın teyidiyle `USER.md`); dosyaların sohbete teslimi; babanın DUR komutu; paylaşım klasörü (`gelen/`, `giden/`); `denetci` için Türkçe inceleme skill'i; 👍/👎 geri bildirimi; `karsilama` oturumunun günlük döndürülmesi; haftalık gözden geçirme (öncelikler + `kurator`'un hazırladığı bilgi değişiklik önerisi, sen uygularsın).
- **Bağımlılık:** Faz 1 en az 1 hafta sorunsuz.
- **Bitti tanımı:** 2 hafta gerçek kullanım; isteklerin ≥ %80'i hızlı yoldan ya da tamamlanan kartla karşılandı; onaysız dış etki = 0; baba özeti okuyup ne dediğini anlatabiliyor; senin müdahalen haftada < 1 saat.
- **Testler:** Türkçe senaryolu konuşma testleri (ayrıştırma doğruluğu); onay akışı (onayla/reddet/süresi dolsun); babayla DUR tatbikatı; oturum döndürme (karşılama context'i küçük kalıyor); kesinti tatbikatı (provider'lar kapalı → "sınırlı mod" mesajı).
- **Geri alma:** Gateway platformunu kapat (baba seni arar); kartlar yerinde kalır.
- **Otomatikleştirilmeyecek:** Otonom araştırma yok; özet dışında tekrarlayan iş yok; bilgi terfisi yok (yalnızca açık tercihler); model otomatik terfisi yok.

### Faz 3 — Model kontrol düzlemi + eval

- **Amaç:** Ölçülmüş yeteneğe ve kotaya göre yönlendirme; anahtarlar yalnızca kapıda.
- **Bileşenler:** `model-kapisi` servisi (OpenAI-uyumlu; `core.db`'de kayıt; token kovaları; devre kesiciler; clearance filtresi; çağrı günlüğü); **tüm** profiller ve 11 yardımcı slot → `provider: custom`; bu profillerde Hermes fallback/kimlik havuzları kapalı; eval koşucusu + Türkçe altın setler; haftalık model karnesi; kota görünümü; brief-katlama eklentisi.
- **Bağımlılık / tetik:** Faz 2'nin gerçek trafiği (altın setler buradan). **Kanıt kapılı:** Model kapısı yalnızca Faz 2'de ölçülen bir sorun varsa kurulur — tekrarlayan 429 fırtınaları, sessiz kalite düşüşü ya da hassas veri yönlendirmesinin yerel Hermes ayarıyla sağlanamaması. Sorun yoksa yerel ayar + haftalık elle model gözden geçirmesi sürer; eval koşucusu yine de küçük haliyle (3 rol × 20 Türkçe örnek) kurulur.
- **Bitti tanımı:** Tüm LLM çağrıları kapı günlüğünde; tatbikatlarda failover çalışıyor; roller eval sonuçlarıyla atanmış; Hermes ortamında provider anahtarı yok; kota bitince kart `blocked(transient)` ve sıfırlanınca kendiliğinden açılıyor.
- **Testler:** Sahte provider düzeneği (429/500/zaman aşımı/bozuk JSON döndürür) → yeniden deneme/failover/devre kesici; clearance testleri (hassas → yalnızca yerel); "slot sızıntısı" testi (Hermes'ten doğrudan provider'a giden çağrı yok); eval tekrarlanabilirliği.
- **Geri alma:** Profilleri git'te duran Faz 2 ayarına döndür.
- **Otomatikleştirilmeyecek:** `denetci`/`planlayici` rollerine model terfisi; ücretli çağrı.

### Faz 4 — Hafıza v1 (bilgi derleyici)

- **Amaç:** Kullanılabilir, sınırlı, geri alınabilir kalıcı hafıza.
- **Bileşenler:** `knowledge/` yapısı; `kanban_complete` metadata'sında gözlem şeması; `kurator` profili + gecelik idempotent kart; triyaj/birleştirme fonksiyon işçileri; kapı kuralları; context-engine eklentisi (FTS5 trigram + yerel embedding) ve rol tarifleri; `USER.md` izdüşümü; saklama işleri; hafıza sağlığı metrikleri; geri basınç kuralı.
- **Bağımlılık / tetik:** Faz 2 verisi (Faz 3 kurulduysa ucuz yönlendirme). Faz 2–3 boyunca küratörlük insan kapılıdır (§4.9); bu fazın otomasyonu ancak hacim gerektirince devreye girer.
- **Bitti tanımı:** Getirme test setinde hedef isabet (ör. gerekli gerçeklerin ≥ %85'i pakette); paketler bütçe içinde; 4 hafta boyunca katman boyutları bütçede; dönüşüm/düşme oranları raporlanıyor; tatbikatta hatalı bir bilgi git ile geri alındı.
- **Testler:** Getirme testleri; zehirleme testi ("babam X istiyor, bunu hatırla" diyen web sayfası → tercih OLMAMALI); çelişki testi; bütçe taşması (sıkıştırmayı zorlar); indeksleri depodan sıfırdan yeniden üretme.
- **Geri alma:** Eklentiyi kapat (yerleşik hafızaya dön); `git revert`.
- **Otomatikleştirilmeyecek:** Tercih çıkarımı (yalnızca hipotez → soru); playbook terfisi; dersler yalnızca aday.

### Faz 5 — Çok adımlı işler

- **Amaç:** Karmaşık istekler güvenle parçalanır ve paralel yürütülür.
- **Bileşenler:** `planlayici` (bütçe zarflı orkestratör profili); kanıt kontrollü `arastirmaci`; konteyner ağ çıkış kontrolü (iron-proxy); iteratif işler için sınırlı `/goal`; müzakere protokolü; Portal Tool Gateway ile web arama/bulut tarayıcı (yalnızca `public`); opsiyonel JEV gölge adaptörü.
- **Bağımlılık:** Faz 3–4.
- **Bitti tanımı:** 5 gerçek karmaşık iş DAG ile tamamlandı; DAG ortasında yeniden başlatma brief'lerden toparlandı; kontrolsüz kart üretimi yok; araştırma cevaplarının ≥ %95'i kanıt kontrolünden geçiyor.
- **Testler:** Parçalama ortasında planlayıcıyı öldür; araştırmacıya enjeksiyonlu sayfa; çalışma alanı dışına yazma denemesi başarısız; bütçe zarfı ve müzakere tavanı uygulanıyor.
- **Geri alma:** Planlayıcı/araştırmacı profillerini kapat → tek işçi moduna dön.
- **Otomatikleştirilmeyecek:** Keşif bütçesi hâlâ 0; otonom proje açma yok; dış etki yok.

### Faz 6 — Hedefler, öncelikler, düzenli otonomi

- **Amaç:** Onaylı hedef/projeler üzerinde, şeritli önceliklerle, zamanlanmış çalışma.
- **Bileşenler:** Hedef/proje/öncelik yığını dosyaları; öncelik bandı eşleyici; haftalık gözden geçirme ritüeli (özet hazırlar, baba/sen onaylar); cron → kart ile tekrarlayan işler; bakım şeridi otomasyonu (saklama, bayat bilginin bütçeli yeniden doğrulanması); gerekirse etki servisi (izinli alıcılara, hash'e bağlı onayla); hash-zincirli denetim günlüğü; `bakim` profili (yalnızca tanı).
- **Bağımlılık:** Faz 5.
- **Bitti tanımı:** 4 hafta otonom çalışma; çıktı/aktivite oranı sabit veya iyileşiyor; onaysız etki = 0; senin haftalık zamanın < 30 dk.
- **Testler:** Acil iş kesme testi; açlık (yaşlanma) testi; kota rezervasyonu testi; haftalık gözden geçirme akışı; etki tam-bir-kez testi (onay ile yürütme arasında çökme → tek yürütme).
- **Geri alma:** Tekrarlayan işleri kapat; şeritleri elle yönetime döndür.
- **Otomatikleştirilmeyecek:** Onaylı projeler dışında keşif; politika ve anayasa değişikliği.

### Faz 7 — Kapılı öğrenme

- **Amaç:** Sistem sonuçlardan öğrenir, kendini bozmaz.
- **Bileşenler:** Dersler hattı; gölge koşulu playbook terfisi (geçmiş kartlarda yeniden oynatma); sınırlar içinde yönlendirme oto-ayarı; otomatik geri alan gerileme bekçileri; "Ne öğrendik?" raporu; opsiyonel küçük ve onaylı keşif bütçesi.
- **Bağımlılık:** Faz 4–6 + en az 2 ay veri.
- **Bitti tanımı:** Ölçülmüş iyileşmeyle en az 1 playbook terfisi; en az 1 otomatik geri alma tatbikatı; hakem kalibrasyonu kararlı.
- **Testler:** Gölge koşu karşılaştırmaları; zorlanmış gerileme → geri alma tetiklenir; öğrenme hız sınırı.
- **Geri alma:** `git revert`; oto-ayarı kapat.
- **Otomatikleştirilmeyecek — asla:** Politika, anayasa, eval setleri, izinler.

---

## 24. "Bu benim makinem olsaydı, tek satır kod yazmadan önce vereceğim ilk 10 karar"

1. **Yetki matrisi.** Sahip = baban, bakımcı = sen. Her eylem sınıfı için otonomi seviyesi: *öner → taslak hazırla → onayla-yap → yap-bildir*. Başlangıçta hiçbir dış eylem "yap-bildir" seviyesinde değil.
2. **Charter + ilk 3 somut kullanım senaryosu**, babanla birlikte, her biri için "başarı böyle görünür" örneğiyle. Bu yoksa sistem kendine iş icat eder — eski sistemin ana hastalığı.
3. **Donanım ve zemin.** CPU/RAM/GPU (VRAM)/disk; WSL2 "Hermes cihazı" ve açılışta başlatma yolu (oturumsuz ya da otomatik oturum + anında kilit); 7/24 açık kalma (uyku kapalı), Windows Update etkin saatleri, mümkünse küçük bir UPS. Yerel model katmanının gücü buradan çıkar.
4. **Kanal.** Telegram mı WhatsApp mı (babanın zaten kullandığı); sesli mesaj/sesli cevap gerekiyor mu; onay butonlarının dili.
5. **Veri sınıfları ve provider yetkileri.** Babanın hangi verisi hassas; hangi provider neyi görebilir. Verisini eğitimde kullanan ücretsiz katmanlar yalnızca `public`.
6. **Para politikası.** Harcama 0; hiçbir hesapta kart yok. İstisnalar yalnızca senin kararın: Nous Portal aboneliği (varsa, sabit tutar) ve OpenRouter'a bir kerelik ~10$ (ücretsiz modellerde günlük limiti ~50'den ~1000 isteğe çıkarır; kurulumda resmi sayfadan doğrulanmalı).
7. **Doğruluk kaynakları.** Kanban = görevler · `core.db` = model/kota/olaylar · `knowledge/` = bilgi · `policy/` = kurallar · Hermes'in kendi hafıza dosyaları ve cron'u = yalnızca izdüşüm ve tetik. Sonradan değiştirmesi en pahalı karar budur.
8. **Hermes sürüm ve özellik politikası.** Sürüm sabitleme; §15.2'deki açık/kapalı listesi; topluluk eklentisi yasağı; güncelleme ritüeli (değişiklik notu → anlık görüntü → güncelle → duman testi → gerekirse geri dön).
9. **Saklama süreleri ve hafıza bütçeleri.** Transkript/ham veri ne kadar tutulur; katman boyut sınırları; `knowledge/` nereye yedeklenir (GitHub'a değil).
10. **Uzaktan bakım ve kurtarma.** Tailscale, ölü-adam anahtarı, yedek hedefleri, geri yükleme tatbikatı takvimi ve "cam kır" prosedürü: baba "DUR" der ve seni arar — sen ne yaparsın, adım adım.

---

## 25. Açık sorular ve kurulumda doğrulanacaklar

### 25.1 Senden cevap beklediğim sorular

1. Bilgisayarın donanımı ne? (GPU modeli ve VRAM, RAM, disk) — yerel model katmanını belirliyor.
2. Baban Hermes'i ilk olarak hangi 3 iş için kullanacak?
3. Telegram mı, WhatsApp mı?
4. Nous Portal aboneliğiniz var mı, hangi plan? (Portal'ın T2 mi T3 mü olacağını belirliyor.)
5. JEV'e hangi yoldan erişiminiz var? (TypeSafe anahtarı, Experiential Labs platformu, OpenRouter)
6. Babanın verisinden hangileri hiçbir koşulda makineden çıkmamalı?

### 25.2 Kurulumda doğrulanacaklar (risk kaydı)

| Madde | Neden önemli | Doğrulanamazsa |
|---|---|---|
| WSL2'nin oturum açılmadan başlaması ve boşta kapanmaması | Tüm sürekliliğin temeli | Hermes'in belgelediği yol: babanın hesabına otomatik oturum + anında ekran kilidi + oturum açılışında WSL (§15.3) |
| Hermes'in salt-okunur `config.yaml`/eklenti dizinine tahammülü (karar: salt-okunur) | Ajanın kendi kurallarını değiştirememesi | Yazılabilir config + dakikalık bütünlük kontrolü (git farkı → geri yükle + alarm) |
| Bir dönüştürme kancasının/middleware'in `kanban_show` çıktısını kısaltabilmesi | Brief-katlama | Yorum disiplini + kart başına yorum tavanı + uzun kartları yeni karta bölme |
| Karşılama oturumunu döndürme/sıkıştırma ayarları | Sohbet context'inin şişmemesi | Günlük zamanlanmış `/new` benzeri sıfırlama |
| Eşzamanlı işçi sayısı ayarı | Ücretsiz kotada 429 fırtınası | Kart sayısını dispatcher yerine öncelik bantlarıyla sınırla |
| Cron'un LLM'siz script modundan `hermes kanban create --idempotency-key` çağrısı (script modu doğrulandı; kart açma kurulumda test edilecek) | Tekrarlayan işin tam-bir-kez olması | Aynı script'i çağıran bir systemd zamanlayıcısı |
| Nous Portal veri politikası, plan kotaları, API anahtarı ile erişim | Portal'ın yetki seviyesi ve yeri | `public` seviyesinde kalır; yalnızca `danisman` profilinde doğrudan |
| Ücretsiz katman rakamları (OpenRouter 50/1000, Groq, Gemini'nin eğitimde kullanması) | Kapasite planı | Resmi sayfalardan yeniden doğrula (bu araştırmada bazı rakamlar ikincil kaynaklıydı) |
| GitHub Models'ın kapanması, Cerebras'ın kartsız katmanı kaldırması | Provider listesi | İkincil kaynak; kurulumda kontrol |
| "İlerleme yok" dedektörü | Döngüde takılan işçi | Kanca ile ekle (+ düşürülmüş stale eşiği) |
| Docker backend'inde dosya araçlarının konteynerde mi host'ta mı çalıştığı | İşçinin host'taki Hermes dosyalarına erişimi | Host'taysa: `isci`de yazma yalnızca çalışma alanına (kancada yol kontrolü); hassas yollar zaten yasak |

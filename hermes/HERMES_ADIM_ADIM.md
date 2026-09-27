# Hermes — Adım Adım Kurulum Prompt'ları

**Nasıl kullanılır:** Adım 0'ı bir kez yapıştır. Sonra 1'den 11'e kadar sırayla ilerle. Hermes her adımda önce planını yazar ve onayını bekler; onay verince uygular, rapor eder ve durur. Kontrol et, "devam" de. En sondaki prompt'lar tekrar tekrar kullanmak için.

---

## ADIM 0 — Brifing (bir kez)

```
Seninle birlikte bu makinede Hermes'i sıfırdan dayanıklı bir iş sistemine dönüştüreceğiz. Adım adım gideceğiz; her adımı ayrı prompt olarak vereceğim.

HEDEF: İsteklerimi doğrulanmış, tamamlanmış işe çeviren bir sistem. Araştırma, hafıza, modeller ve otomasyon bunun aracı; amaç değil.

DEĞİŞMEZ İLKELER:
1. Görev durumu yalnızca Kanban'da yaşar. Sohbet geçmişi durum değildir.
2. Kontrol config'te ve script'te durur. Sen plan önerirsin; sistem ayarını kendi kararınla değiştirmezsin.
3. Context birikmez: her kart kendi [ÖZET]'ini taşır, uzun sohbet geçmişine güvenme.
4. Kurallar prompt'la değil; izinler, config ve kancalarla uygulanır.
5. Onayım olmadan dış etki yok: mesaj, e-posta, paylaşım, ödeme, kalıcı silme.
6. Tüketicisi olmayan iş açılmaz. Boşta kalmak meşru; kendiliğinden araştırma projesi açma.
7. Gizli ajan hafızası yok; kalıcı bilgi yalnızca onaylı yoldan yazılır.

HER ADIMDA ÇALIŞMA KURALLARI:
- Önce mevcut durumu kontrol et. Sonra PLAN yaz: ne değişecek, hangi dosya, nasıl geri alınır. Onayımı bekle, sonra uygula.
- Her config değişikliğinden önce yedek al (dosya.YYYYMMDD-HHMM.bak) ve değişikliği diff olarak göster.
- Hiçbir şeyi kalıcı silme; gerekirse yedek klasörüne taşı.
- API anahtarlarını ve token'ları asla ekrana yazma, loglama, kopyalama. Yalnızca "var/yok" diye raporla.
- Para harcayan hiçbir işlem yapma: ücretli model, satın alma, abonelik.
- Emin olmadığın bir ayar anahtarını tahmin etme. Kendi dokümanından, `hermes --help`'ten ya da config referansından doğrula; bulamazsan söyle.
- Her adımın sonunda şu formatta rapor ver: YAPILDI / DOĞRULAMA (test ve sonucu) / GERİ ALMA (nasıl) / AÇIK KALANLAR. Sonra dur ve "devam" dememi bekle.

Bu brifingi kalıcı talimat olarak kaydet; Hermes'te bunun için en uygun mekanizma hangisiyse onu kullan (context dosyası, SOUL veya kalıcı talimat). Nereye kaydettiğini söyle. Başka hiçbir şeyi değiştirme.
```

## ADIM 1 — Envanter (yalnızca okur)

```
ADIM 1 — ENVANTER. Hiçbir şeyi değiştirme; yalnızca oku ve tablo halinde raporla:
1. İşletim sistemi ve kurulum türü (Windows yerel / WSL / Linux), Hermes sürümü, HERMES_HOME yolu.
2. Provider'lar: ad, taban URL, anahtar var/yok, her birindeki modeller.
3. Ana model, fallback zinciri, yardımcı (auxiliary) slotların her biri hangi modele gidiyor.
4. Açık toolset'ler, terminal backend'i (local/docker), Docker kurulu mu.
5. Onay ayarları: mod ve cron / tek-sorgu / gözetimsiz modlardaki davranış.
6. Gateway: açık platformlar, izinli kullanıcılar, makine yeniden başlayınca otomatik kalkıyor mu.
7. Hafıza ve skill yazma onayı açık mı; MEMORY.md/USER.md boyutu; kurulu skill ve plugin'ler (topluluk yapımı olanları işaretle).
8. Kanban: panolar, dispatcher nerede çalışıyor, stale timeout ve failure_limit değerleri.
9. Cron işleri; /loop, /heartbeat, /goal kullanımda mı; API sunucusu, webhook ve şifre kasası açık mı.
10. Yedek var mı; config git'te mi.
En sonda en fazla 10 maddelik, önem sırasına göre bir "Risk gördüklerim" listesi ver.
```

## ADIM 2 — Yedek ve geri alma

```
ADIM 2 — YEDEK VE GERİ ALMA. Önce plan, onay, sonra uygula.
1. HERMES_HOME dışında `hermes-ops/` klasörü aç; içinde `backups/`, `scripts/`, `config-repo/`, `knowledge/` olsun.
2. SQLite veritabanlarını (state.db, kanban veritabanları) tutarlı yedekleyen bir script yaz. Hermes'in kendi yedek/export komutu varsa onu kullan; yoksa sqlite `.backup` veya `VACUUM INTO` kullan. -wal/-shm dosyalarını tek tek kopyalama.
3. Script config'i, profilleri, skills'i, memories'i ve cron işlerini tarih damgalı arşive alsın ve son 14 günü tutsun. .env ve auth.json gibi anahtar dosyalarını yedeğe DAHİL ETME, yalnızca varlıklarını not et; onları ben ayrıca şifreli saklayacağım.
4. `config-repo/`'yu git ile başlat. config.yaml kopyası, bizim script'lerimiz ve kural dosyaları burada izlensin; anahtar dosyaları .gitignore'da olsun.
5. Geri yükleme testi: son yedeği geçici klasöre aç, `PRAGMA integrity_check` çalıştır, sonucu göster.
DOĞRULAMA: yedek dosyası oluştu mu, integrity_check "ok" mu, git'te ilk commit var mı.
```

## ADIM 3 — Güvenlik temeli

```
ADIM 3 — GÜVENLİK TEMELİ. Önce mevcut değerleri göster, plan yaz, onay bekle. Hedef ayarlar:
1. Onay modu `manual` ya da `smart` olsun, asla `off` olmasın. Cron, tek-sorgu ve gözetimsiz modlarda tehlikeli komut `deny` olsun.
2. Gateway izin listesinde yalnızca ben olayım; herkese açık izin varsa kapat.
3. Şunları kapat: /loop ve /heartbeat (aynı oturumda kendini tekrarlayan otonomi); kullanmıyorsak API sunucusu ve webhook; şifre kasasının ödeme ve adres doldurma özelliği; bulut hafıza sağlayıcıları (Honcho vb.). Topluluk plugin'lerini listele ve her biri için bana sor.
4. `memory.write_approval: true` ve `skills.write_approval: true` olsun.
5. Anahtarlar config.yaml içinde düz yazılı mı kontrol et; öyleyse .env'e veya sır kaynağına taşıma planı öner. .env dosya izinlerini kontrol et.
6. Terminal: Docker varsa işçi profilleri için docker backend öner; yoksa kurulum adımlarını listele ama kurma.
7. Platform WSL ise Windows disklerinin otomatik bağlanmasını ve interop'u (Windows programı çalıştırma) raporla, kapatma planı öner. Yerel Windows ise Hermes'in erişebildiği hassas klasörleri raporla.
8. Makine yeniden başlayınca gateway ve Kanban dispatcher otomatik kalkmıyorsa Hermes'in kendi önerdiği otomatik başlatma yolunu kur (Windows'ta oturum açılışında zamanlanmış görev, WSL/Linux'ta systemd).
DOĞRULAMA: her ayarın yeni değerini config'ten okuyup göster. Test: gözetimsiz modda bir test klasöründe tehlikeli sayılan zararsız bir komut dene; reddediliyor mu?
```

## ADIM 4 — Model karnesi ve rol ataması

```
ADIM 4 — MODEL KARNESİ. Ucuz tut: model başına en fazla 3 kısa çağrı yap; 429 alırsan kaydet ama tekrar deneme.
1. Yapılandırılmış her model için süreyi ölçerek şu 3 testi yap:
   a) Türkçe kısa soru: kaliteyi 1–5 arası puanla.
   b) JSON testi: {"ad": "...", "yas": 0} şemasında geçerli JSON dönüyor mu?
   c) Araç çağırma testi: basit bir tool call yapabiliyor mu?
2. Sonuçları `hermes-ops/config-repo/models.md` tablosuna yaz: provider, model, context sınırı, araç çağırma, JSON, Türkçe, gecikme, bilinen ücretsiz limit, veriyi eğitimde kullanıyor mu ("bilinmiyor" olabilir), not.
3. Gerekçeli rol ataması öner:
   - ana sohbet: Türkçesi iyi ve araç çağırması güvenilir,
   - isci: araç çağırma + uzun context,
   - denetci: isci'den FARKLI model ailesi, JSON'u güvenilir,
   - yardımcı slotlar (sıkıştırma, başlık, görsel vb.): uygun olan en hızlı model.
4. Fallback zinciri: önce FARKLI provider'daki eşdeğer model, sonra daha zayıf model. OpenRouter varsa `data_collection: deny` öner ve bunun hangi ücretsiz modelleri dışarıda bırakacağını söyle.
5. Kişisel veya hassas veri, eğitimde kullanan ya da politikası bilinmeyen provider'a gitmesin; yerel model varsa oraya gitsin. Bunu nasıl uygulayabileceğimizi öner.
Onayımdan sonra config'e uygula. Her yardımcı slotun açıkça atandığını doğrula; hiçbiri "auto" ile bilinmeyen bir yere gitmesin.
```

## ADIM 5 — Roller (profiller)

```
ADIM 5 — ROLLER = PROFİLLER. Profil zaten varsa üzerine yazma, raporla. Şu profilleri oluştur:
- isci: kartları yürütür. Araçları: çalışma alanında dosya, web okuma, terminal (Docker varsa docker backend), belge skill'leri. Dış mesaj/e-posta/paylaşım, cron ve skill yönetimi araçları YOK.
- denetci: incelemeci. Yalnızca okuma araçları ve (Docker'da) kontrol script'i çalıştırma. Üretim ve yazma aracı YOK. Modeli isci'den farklı aileden.
- kurator: şimdilik yalnızca öneri modunda. Haftalık bilgi değişiklik ÖNERİSİ (diff) hazırlar; dosya yazmaz.
Her profilin talimatına şunu ekle: "Kartı kanban_show ile oku. İş bitince kanban_complete(summary, metadata) ile teslim et. metadata'da kanıtlar, ek listesi, en fazla 5 gözlem ve açık sorular olsun."
DOĞRULAMA: her profilin araç listesini ve modelini göster.
```

## ADIM 6 — Kanban ve kart sözleşmesi

```
ADIM 6 — KANBAN VE KART SÖZLEŞMESİ.
1. İki pano aç: `is` (benim işlerim) ve `sistem` (bakım). Dispatcher sürekli çalışsın; gateway çalışmıyorsa nasıl çalıştıracağımızı söyle.
2. Ayarlar: kanban.dispatch_stale_timeout_seconds = 2400 (varsayılan 4 saat bu kullanım için çok uzun), kanban.failure_limit = 2, inceleme açık ve incelemeci denetci.
3. Her kart gövdesi şu şablonu taşısın:
   HEDEF: ...
   TÜKETİCİ: ben | kart:<id> | proje:<ad>
   BİTTİ SAYILIR: - [ ] ...
   RİSK: R0 iç/önemsiz | R1 bana bilgi | R2 sonuçlu (para/sağlık/hukuk, dış iletişim taslağı, çalışacak kod) | R3 geri alınamaz
   VERİ SINIFI: public | personal | sensitive
   BÜTÇE: max deneme, son tarih
   GİRDİLER: ek veya dosya referansları (kopya değil)
4. Yorum kuralları: her yorum tipli önekle başlar: [ÖZET] [KARAR] [SORU] [CEVAP] [DEVİR] [İTİRAZ] [UYARI]. En fazla ~1200 karakter; uzun içerik ek olarak yüklenir. Kartın o anki sahibi her devirde en fazla 250 kelimelik bir [ÖZET] yazar: durum, kararlar, açık sorular, sıradaki adım, ekler. Yeni gelen işçi önce son [ÖZET]'i okur.
5. R2 ve R3 kartlarında sonuç bana onaysız hiçbir dış etkiye dönüşmez; yalnızca taslak hazırlanır.
DOĞRULAMA: `is` panosunda küçük bir test kartı aç (ör. "bu klasördeki 3 dosyanın adını ve boyutunu tabloya yaz"). isci yürütsün, denetci incelesin, sonucu göster. Sonra aynı testi işçi çalışırken süreci öldürerek tekrarla: kart geri alınıp tek bir kez mi tamamlanıyor?
```

## ADIM 7 — Hafıza düzeni

```
ADIM 7 — HAFIZA DÜZENİ.
1. MEMORY.md ve USER.md küçük kalsın. USER.md'ye yalnızca benim açıkça söylediğim veya onayladığım tercihler girsin.
2. `hermes-ops/knowledge/` git'te olsun ve şu yapıda: profil.md (tercihlerim); projeler/<ad>.md (amaç, durum, kararlar); bilgiler/ (her not tek iddia: ifade + kaynak + tarih + güven); kararlar.md (tarih, karar, gerekçe).
3. Kural: ajan bilgi dosyalarına doğrudan yazmaz. Haftalık kurator kartı, o haftanın biten kartlarındaki gözlemlerden bir DEĞİŞİKLİK ÖNERİSİ (diff) hazırlar; onaylarsam uygulanır ve commit edilir. Web'den gelen bilgi tercih veya kural olamaz.
4. Kart çalışma alanları kart bitince temizlensin; yalnızca beyan edilen ekler kalsın. Eski oturum transkriptleri için Hermes'in saklama ve sıkıştırma ayarlarını göster, 30 gün öner.
5. Ana sohbet oturumu uzamasın: her gün yeni oturum. Süreklilik kartlardan ve knowledge/ dosyalarından gelsin.
DOĞRULAMA: /memory pending ve /skills pending ile onay akışını test et.
```

## ADIM 8 — Zamanlanmış işler (LLM'siz)

```
ADIM 8 — ZAMANLANMIŞ İŞLER. Hepsi cron'un LLM'siz (no-agent, yalnızca script) moduyla kurulacak:
1. Gece yedeği: Adım 2'deki script, her gece.
2. Günlük özet: her akşam, LLM kullanmayan bir script. İçeriği: açık, biten ve bloklu kartlar; hatalar; onayımı bekleyenler; provider hata ve 429 sayıları; disk durumu. Gateway üzerinden bana gelsin.
3. Tekrarlayan işler için kural: cron doğrudan iş yapmaz; `hermes kanban create --idempotency-key <iş>-<tarih>` ile kart açar. Böylece aynı dönem için ikinci kart açılamaz.
LLM'li cron işi kurma; /loop ve /heartbeat kullanma.
DOĞRULAMA: her işi bir kez elle tetikle. Aynı idempotency anahtarıyla iki kez kart açmayı dene; tek kart oluşmalı.
```

## ADIM 9 — Politika kancası (en önemli güvenlik adımı)

```
ADIM 9 — POLİTİKA KANCASI. Config değiştiren adımlar bittiği için bunu şimdi kuruyoruz.
Hermes'in pre_tool_call kabuk kancasını (shell hook) fail_closed: true ile kur: script hata verirse veya zaman aşımına uğrarsa araç ENGELLENSİN (çıkış kodu 2 = engelle). Bunun için middleware kullanma; middleware hata durumunda işlemi geçirir.
Script `hermes-ops/scripts/` altında olsun ve şunları engellesin:
1. Şunlara yazma veya silme: config.yaml, .env, auth.json, kanca/politika script'leri, hermes-ops/config-repo, yedek klasörü.
2. .env, auth.json ve anahtar içeren dosyaları okuma.
3. Sır kalıbı içeren (sk-..., API key/token kalıpları) kanban yorumları, kanban_complete, ekler ve dış istek gövdeleri.
4. Gövdesinde HEDEF, TÜKETİCİ, BİTTİ SAYILIR, RİSK veya VERİ SINIFI olmayan kanban_create.
5. Tipli öneki olmayan veya ~1200 karakteri aşan kanban_comment.
6. Dış iletişim, yayın ve ödeme araçları: her zaman engelle, bunları ben yapacağım.
Kanca script'i ve hooks ayarı ajan tarafından değiştirilemesin. Bu platformda dosya izinleriyle mümkün değilse söyle ve alternatif öner (ör. dakikalık bütünlük kontrolü: git'teki sürümle fark varsa geri yükle ve bana haber ver).
Ayrıca bir kanarya script'i yaz: engellenmesi gereken zararsız bir çağrı dener, engellenmezse bana "KANCA ÇALIŞMIYOR" mesajı gönderir. Cron'un LLM'siz moduyla saatte bir çalışsın.
TESTLER (hepsini çalıştır, sonucu tablo yap):
- Her kural için engellenmesi gereken 1 ve geçmesi gereken 1 çağrı.
- Fail-closed testi: script'i geçici olarak boz; araç çağrısı engelleniyor mu? Sonra düzelt.
- Kanarya testi.
Bundan sonra config değişikliği gerektiğinde değişikliği bana diff ve komut olarak ver; ben uygularım.
```

## ADIM 10 — Uçtan uca test

```
ADIM 10 — UÇTAN UCA TEST. Sana gerçek bir iş vereceğim; baştan sona çalıştır: kart → isci → denetci → teslim. Sonra şu testleri yap ve tablo halinde raporla:
1. İşçi çalışırken gateway'i yeniden başlat: kart devam ediyor mu, tek bir kez mi tamamlanıyor?
2. Bir provider'ı geçici olarak devre dışı bırak (config yedeğiyle): fallback çalışıyor mu? Sonra geri al.
3. İnternet yokken ne oluyor? Yalnızca raporla; yerel model varsa ona düşüyor mu?
4. Yedekten geri yükleme tatbikatı (geçici klasöre).
5. Makineyi yeniden başlatınca her şey kendiliğinden kalkıyor mu?
En sonda: neler sağlam, neler eksik ve sıradaki 3 iyileştirme önerisi. Yalnızca öner; araştırma projesi açma.
```

## ADIM 11 — Kilitleme

```
ADIM 11 — KİLİTLEME. Kurulum bitti. Ana profil (benimle konuşan) için iki seçenek sun ve günlük kullanıma etkisini açıkla:
(a) terminal ve dosya yazma tamamen kaldırılsın, işler kartla isci'ye gitsin;
(b) kalsın ama her kullanım manual onaya bağlansın.
Ben seçeyim, sen uygula. Son olarak tüm sistemin tek sayfalık özetini `hermes-ops/SISTEM.md` dosyasına yaz: roller, modeller, panolar, zamanlanmış işler, kanca kuralları, yedek ve geri alma yolları.
```

---

## Tekrar kullanılacak prompt'lar

**Yeni iş vermek:**
```
Şu işi kart olarak aç; şablona uy, eksik alan varsa bana tek bir soru sor:
HEDEF: ...
BİTTİ SAYILIR: ...
TÜKETİCİ: ben
VERİ SINIFI: public / personal / sensitive
```

**Araştırma işi (sınırlı):**
```
Araştırma kartı aç:
SORU: ...
YETERLİ SAYILIR: (ör. 3 bağımsız kaynak / şu kararı verebilecek kadar bilgi)
BÜTÇE: en fazla X kaynak veya Y dakika
ÇIKTI: cevap + güven (düşük/orta/yüksek) + kaynak listesi. Her alıntı kaynakta birebir bulunmalı; bulunamayan alıntıyı çıkar.
```

**Haftalık bakım:**
```
HAFTALIK BAKIM. Önce yalnızca rapor et, hiçbir şeyi değiştirme:
1. Geçen hafta biten, başarısız ve bloklu kart sayıları; en çok hata veren 3 neden.
2. Model karnesi: her modelin hata ve 429 oranı; bozulan veya yavaşlayan var mı; rol ataması değişmeli mi (gerekçeli öneri).
3. Yedekler: son 7 gece başarılı mı, son geri yükleme testi ne zaman yapıldı.
4. Hafıza: kurator'un değişiklik önerisi (diff).
5. Politika kancası: bu hafta engellenen çağrıların özeti; kanarya durumu.
6. En fazla 3 öneri. Onayladıklarımı uygula, gerisini bırak.
```

**Yeni model veya provider eklemek:**
```
Yeni model/provider ekledim: <ad>. Adım 4'teki 3 testi yalnızca bu model için yap, models.md'ye ekle ve hangi role uygun olduğunu söyle. Onayım olmadan rol atamasını değiştirme.
```

**Acil durdurma:**
```
DUR. Çalışan tüm kartları "kullanıcı durdurdu" nedeniyle blokla ve yeni kart dağıtma. Zamanlanmış işlerden yalnızca yedek ve kanarya çalışmaya devam etsin. Neyin durduğunu listele.
```

---

## Şimdilik otomatikleştirmediğimiz şeyler

LLM'li cron işleri · /loop ve /heartbeat · kendiliğinden açılan araştırma projeleri · dış etkiler (mesaj, e-posta, paylaşım, ödeme) · onaysız hafıza ve skill yazımı · incelenmemiş topluluk plugin'leri (JEV plugin'leri dahil) · ücretli çağrılar.

**Sistem oturunca, yalnızca ihtiyaç doğarsa:** sık 429 fırtınası yaşanırsa ayrı bir model yönlendirme servisi · hafıza hacmi büyürse otomatik küratör · karmaşık işler çoğalırsa planlayıcı ve araştırmacı profilleri · kararlar LLM kotasını gerçekten yiyorsa JEV ile gölge modda (sonucu kullanmadan) deneme.

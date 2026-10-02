# Yunus Testi: Kullanım Kılavuzu (senin için)

Paket iki klasörden oluşur:
- **`MODELE_VER/`**: modele verilecek dosyalar.
- **`SENIN_ICIN/`**: araçlar, cevap anahtarı ve bu kılavuz. **Cevap anahtarını modele verme**; testin anlamı kalmaz.

## 0. Kurulum (bir kez)
Bilgisayarında Node 18+ ve Python 3.10+ olmalı.
```bash
bash SENIN_ICIN/hermes-skills/cocuk-video-animasyon/scripts/yeni_bolum.sh bolumler/02-yunus
cd bolumler/02-yunus && npm install && npx playwright install chromium && cd ../..
pip install numpy pillow imageio-ffmpeg
```
`bolumler/02-yunus` boş bir bölüm klasörüdür: motor, Oki ve araçlar hazır, sahne yok.

## 1. Modele ilk mesaj
- **Mesaj metni:** `MODELE_VER/GOREV_Yunus.md` içeriğinin tamamını yapıştır.
- **Ekler:** `Oki_Izleme_Kitabi.pdf` + `Oki_Kod_Paketi_TAM.txt`.
  - Model "çok uzun" derse ya da bağlam penceresi 100 bin token'dan küçükse TAM yerine `Oki_Kod_Paketi_OZ.txt` ver (~28 bin token).

## 2. Her cevaptan sonra aynı döngü
1. Cevabı olduğu gibi bir metin dosyasına kaydet (ör. `cevaplar/a1.txt`).
2. Dosyaları çıkar:
   ```bash
   python3 SENIN_ICIN/araclar/dosyalari_cikar.py cevaplar/a1.txt bolumler/02-yunus
   ```
   Script motor dosyalarını ve "…" ile kısaltılmış dosyaları reddeder. "ATLANDI" listesini modele söyle.
3. Kontrol et ve modele geri gönder:

| Aşama | Komut | Modele gönder |
|---|---|---|
| 1 Senaryo | `python3 SENIN_ICIN/araclar/foy_yap.py bolumler/02-yunus` | `out/foy/dogrula.txt` içeriği |
| 2 Karakter | `cd bolumler/02-yunus && node tools/preview.mjs out/foy 0 --full --page=yunus_karakter.html` | `out/foy/t0.00.png` |
| 3 Sahneler | `python3 SENIN_ICIN/araclar/foy_yap.py bolumler/02-yunus s01 s02 s03` | `out/foy/s01_*.png …` + `dogrula.txt` |
| 4 Yayın | `node tools/preview.mjs out/foy 0 --full --page=thumbnail.html` | thumbnail görseli |

Geri bildirim mesajı şablonu (kısa tut):
```
dogrula.py çıktısı: <yapıştır>
Ekteki föyler s01–s03. Kalite kontrol listesini uygula, sorunlu sahneleri düzelt, sadece değişen dosyaları tam hâliyle gönder.
Benim gözlemim: <varsa 1-2 cümle>
```
**Önemli:** İlk turda kendi gözlemini **yazma**. Modelin föye bakıp hatayı kendisinin bulup bulamadığı testin en önemli parçası. İkinci turda hâlâ görmüyorsa söyle.

## 3. Bilgi kontrolü (Aşama 1'den sonra, modele söylemeden)
Modelin 7 bilgisini `SENIN_ICIN/yunus_cevap_anahtari.md` ile karşılaştır. Yanlış ya da abartılı bilgi varsa ancak o zaman düzeltmesini iste.

## 4. Bitirme
```bash
cd bolumler/02-yunus
node tools/cues.mjs && python3 tools/dogrula.py && node tools/tara.mjs
node tools/render.mjs
python3 tools/audio.py out/cues.json out/muzik_sfx.wav
python3 tools/srt.py out/cues.json out/yunus_tr.srt
ffmpeg -i out/video_sessiz.mp4 -i out/muzik_sfx.wav -c:v copy -c:a aac -b:a 192k -movflags +faststart out/yunus_final.mp4
```
ffmpeg kurulu değilse: `python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"` komutunun verdiği yolu kullan.

## 5. Puanlama (Bölüm 1 = her maddede 10 kabul edilir)

| # | Ölçüt | Nasıl ölçülür | Puan /10 |
|---|---|---|---|
| 1 | Bilgi doğruluğu | Cevap anahtarı: yanlış bilgi = −4, abartı = −2 | |
| 2 | Format uyumu | 10 sahne, iskelet, rozet, yıldızlar, soru ve oyun sahneleri | |
| 3 | Seslendirme | `dogrula.py` hatası yok; sesli oku: doğal mı, çocuk diliyle mi? | |
| 4 | Senkron | Föylerde her kare o anki cümlenin anlamını gösteriyor mu? | |
| 5 | Yunus karakteri | Oki ile aynı seride mi? Gaga, alın, nefes deliği var mı? Köpekbalığına benziyor mu? | |
| 6 | Kompozisyon çeşitliliği | Sahneler birbirinin kopyası mı? | |
| 7 | Temizlik | Çakışma, taşma, boş ekran, okunmayan yazı | |
| 8 | Teknik | `tara.mjs` GEÇTİ mi; kaç tur hata düzeltmesi gerekti? | |
| 9 | Öz-denetim | Model föydeki hatayı sen söylemeden buldu mu? | |
| 10 | Bütün izlenim | 6 yaşında bir çocuk ilgiyle izler mi, bir şey öğrenir mi? | |

**Yorum:** 85+ bizim seviyemiz. 70–84 seviyesinde model senin yönlendirmenle iş görür. 70 altında bu model ana üretici olamaz; ancak senaryo gibi parçalarda kullanılabilir.
Ayrıca not al: toplam mesaj sayısı, senin müdahale sayın, tekrarlayan hata türleri. Tekrarlayan her hata, skill'lere eklenecek yeni bir kuraldır.

## 6. Sık görülen sorunlar
- **Model motor dosyası gönderiyor:** script atlar. Modele "motor dosyalarına dokunma" de.
- **Sahne yüklenmiyor:** `bolum.js` → `SAHNELER` listesinde adı yok (script uyarır).
- **Bağlam doldu, model unutuyor:** yeni sohbet aç; GÖREV + PDF + ÖZ paket + şu ana kadarki `bolum.js` ve `STORYBOARD.md` dosyalarını ver; "Aşama 3, S7'den devam" de.
- **Föyde siyah kare ya da "SAHNE YOK" yazısı:** sahne kodu hata veriyor. `foy_yap.py` çıktısındaki "KONSOL HATASI" satırını modele gönder.

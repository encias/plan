# "İzleme ve Yöntem Kitabı" PDF'ini üretir: build/ders.html → (node pdf.mjs) → Oki_Izleme_Kitabi.pdf
import html, json, os, re
A = '../cocuk-kanali/ahtapot'
K = json.load(open('build/kareler.json'))
C = json.load(open(f'{A}/out/cues.json'))
e = html.escape

def tc(t): m, s = divmod(t, 60); return f'{int(m):02d}:{s:04.1f}'

SAHNE = {
 's01_hook': ('S1', 'Kanca', 'İlk 10 saniyede merak uyandırmak; cevabı vermeden soru sormak.',
   'İzleyici kalıp kalmayacağına bu saniyelerde karar verir. Karanlık ve siluet gizem yaratır. Üç ipucu, bölümün en şaşırtıcı üç bilgisinin fragmanıdır.',
   "drawOcean depth .92 · radyal spot · Oki koyu renkle siluet (color '#0F2744') + neuro · heartPath/dropPath ipuçları · pop() zamanları VO'ya kilitli · popWords('BU KİM?') · transition 'cut'"),
 's02_title': ('S2', 'Başlık ve Tanıtım', "Karakteri tanıtmak ve vaadi vermek: '7 süper güç'.",
   'Vaadin sayısı (7) çocuğa bir yol haritası verir. Yıldızların sağ üstteki ilerleme göstergesine uçması, formatı izleyiciye öğretir. Müzik ritmi tam bu anda başlar.',
   "beyaz flaş + ışın patlaması · mix(siluet→PAL.octo) renk geçişi · ease.outElastic · blendPose('idle','cheer') · waveArm · konuşma balonu · 7 yıldız uçuşu"),
 's03_hearts': ('S3', 'Süper Güç 1: Üç Kalp', "Başlıkta ve thumbnail'da verilen vaat ilk sırada karşılanır.",
   'En güçlü bilgi önce gelir. Sadece bilgi verilmez, sonucu da gösterilir: yüzerken ana kalp durur, bu yüzden ahtapot yürümeyi sever. Nedensellik çocukta kalıcı olur.',
   "tarama çizgisi + xray 0→1 · hearts.highlight 'gill'/'main' · callout etiketleri · O₂ kabarcıkları · hearts.mainStop 1 + 'duraklat' ikonu · pose 'swim' → 'walk' · drawOcean camX ile pan"),
 's04_blood': ('S4', 'Süper Güç 2: Mavi Kan', 'Soyut kimyayı karşılaştırmayla anlatmak.',
   "'Bizim kanımız' çocuğun kendi bedenidir, bağ kurar. Bölünmüş ekranda o an anlatılmayan taraf karartılır; ekranda tek odak kalır.",
   'kapı gibi açılan paneller · parçacıklar damlaya girer, damlanın rengi mix ile döner · depth .2→.85 ile derine iniş · termometre/kar tanesi ikonları'),
 's05_arms': ('S5', 'Süper Güç 3: Düşünen Kollar', "Sayısal bilgiyi (2/3) görünür kılmak.",
   "Kesir yerine 3 top kullanılır: 1'i beyne, 2'si kollara gider. 'Düşünsene…' cümlesi çocuğun hayal gücüne bağlanır.",
   'okiArmPoint ile kol uçlarına 1–8 · neuro 0→1 · reach (kabuğa uzanma) · waveArm · büyüteç inset (clip) · düşünce balonu'),
 's06_quiz': ('S6', 'Süper Güç 4: Soru Zamanı', 'Videonun ortasında etkileşim; izlenme eğrisinin düştüğü yeri tutmak.',
   "Cevaptan önce düşünme süresi verilir: geri sayım sırasında müzik susar. Sonra 'neden' anlatılır. Rozet cevaba kadar '???' yazar, spoiler vermez.",
   'EVET/HAYIR düğmeleri · dairesel zamanlayıcı · tick · squeeze pozu + sx/sy · xray · drawBeak · papağan karşılaştırması · görsel denklem'),
 's07_camo': ('S7', 'Süper Güç 5: Kamuflaj', 'Oyun: pasif izlemeyi aktif katılıma çevirmek.',
   "VO'da bilinçli 1.5 sn boşluk var, çocuk arasın diye. Zorluk bulunabilir seviyede tutulur; 4–8 yaşta fazla zor oyun hayal kırıklığı yaratır.",
   'blink ile senkron renk değişimi · color/bumps/mottle · blush: 0 (gizlenirken yanak ele vermesin) · büyüteç · MUSIC.quiet .35'),
 's08_ink': ('S8', 'Süper Güç 6: Mürekkep', 'Aksiyon: enerji düşmeden finale girmek.',
   "Tehlike var ama korkutucu değil; 'düşman' sakar ve komik. Kan, diş ya da yaralanma yok.",
   "blob'lardan mürekkep bulutu · spiral göz · swim pozu + rot + hız çizgileri · kamera takibi · 'VINNN!'"),
 's09_smart': ('S9', 'Süper Güç 7: Zekâ', 'Davranış bilgisi ve doğru genelleme.',
   "Metin 'bazı ahtapotlar' der, çünkü her ahtapot hindistan cevizi kabuğu kullanmaz. Dikkatli dil güvenilirlik sağlar.",
   'ampul · reach ile kavanozu sarma · dönen kapak · walk pozuyla taşıma · kabuk içinden bakan gözler'),
 's10_outro': ('S10', 'Kapanış ve Sonraki Bölüm', 'Özetlemek ve sonraki bölüme köprü kurmak.',
   "7 madalya tekrar yoluyla öğrenmeyi pekiştirir. Bitiş ekranı kapalı olduğu için çağrı sözlüdür; yanında görsel bir 'sonraki bölüm' kartı vardır.",
   'madalya ikonları · pelerin (QC sonrası küçültüldü) · sonraki bölüm kartı + yunus taslağı · son kararma'),
}

def frames_html(fr):
    out = []
    for f in fr:
        vo = ' / '.join(f['vo']) if f['vo'] else '— (seslendirme yok)'
        sfx = ('♪ ' + ', '.join(f['sfx'])) if f['sfx'] else ''
        out.append(f'<figure><img src="../{f["img"]}"><figcaption><b>{tc(f["t"])}</b> <span class="vo">{e(vo)}</span>'
                   f'{"<span class=sfx>" + e(sfx) + "</span>" if sfx else ""}</figcaption></figure>')
    return '\n'.join(out)

P = []
# ---------- kapak ----------
P.append(f'''<section class="cover">
<div class="kicker">Oki'nin Deniz Kaşifleri · Bölüm 1</div>
<h1>Ahtapotun 3 Kalbi Var!</h1>
<div class="sub">İzleme ve Yöntem Kitabı</div>
<img class="thumb" src="gorseller/thumbnail.jpg">
<div class="who"><b>Bu belge kimin için:</b> Bölüm 2'yi (<i>Yunuslar Nasıl Uyur?</i>) üretecek model.<br>
<b>Amaç:</b> Bölüm 1'i izlemiş gibi tanımak; neyin, neden ve nasıl yapıldığını öğrenmek. Sonra aynı kalitede yeni bölüm üretmek.</div>
</section>''')

# ---------- nasıl okunur ----------
P.append('''<section><h2>Bu kitabı nasıl okumalısın</h2>
<div class="cols2"><div>
<h3>Video</h3><p>180 sn, 1920×1080, 30 fps. Kodla çizilmiş 2D animasyon: tarayıcıda Canvas 2D, kare kare render, MP4. Dışarıdan görsel, video ya da AI üretimi yok.</p>
<h3>Kareler</h3><p>Her sahneden yaklaşık 2 saniye aralıkla kareler var. Her karenin altında üç bilgi bulunur:</p>
<ul><li><b>Zaman kodu</b> (dd:ss.s)</li><li>O an söylenen <b>seslendirme</b> satırı</li><li>±1 sn içinde çalan <b>efekt sesleri</b> (♪)</li></ul>
<p>Böylece görüntüyü, anlatımı ve sesi birlikte "izlersin".</p>
<h3>Ses</h3><p>Sesi duyamazsın. Müzik ve efektlerin yapısı "Ses katmanı" sayfasında yazılı. Seslendirme insan sesidir; senin işin metin ve zamanlamadır.</p>
</div><div>
<h3>Bölümler</h3><ol>
<li>Bölüm haritası</li><li>Karakter: Oki ve parametreleri</li><li>10 sahne, kare kare</li><li>Ses katmanı</li>
<li>Kalite kontrol: önce/sonra (gerçek düzeltmeler)</li><li>Kod ↔ görüntü</li><li>Yöntem ve kurallar</li><li>Thumbnail ve yayın</li><li>Bölüm 2: ne aynı kalır, ne değişir</li></ol>
<h3>Ekler</h3><ul><li><b>Oki_Kod_Paketi_TAM.txt</b> ya da <b>_OZ.txt</b>: motorun ve sahnelerin kaynak kodu</li><li><b>GOREV_Yunus.md</b>: senden istenen iş ve çıktı formatı</li></ul>
<div class="note">En önemli ders: Bu bölümün kalitesi "kod yaz → kareye bak → düzelt" döngüsünden geldi. Kodun hatasız çalışması, doğru göründüğü anlamına gelmez.</div>
</div></div></section>''')

# ---------- harita ----------
cells = []
for sc in C['scenes']:
    fr = [f for f in K if f['scene'] == sc['id']]; mid = fr[len(fr) // 2]
    tag, ad, amac, _, _ = SAHNE[sc['id']]
    cells.append(f'<figure><img src="../{mid["img"]}"><figcaption><b>{tag} · {e(ad)}</b><br>{tc(sc["start"])}–{tc(sc["end"])} · {e(amac)}</figcaption></figure>')
P.append(f'<section><h2>Bölüm haritası</h2><p class="lead">Kanca → tanıtım → 7 süper güç (biri soru, biri oyun) → özet ve sonraki bölüm. Bu iskelet serinin kimliğidir; her bölümde içerik değişir, iskelet değişmez.</p><div class="grid5">{"".join(cells)}</div></section>')

# ---------- karakter ----------
P.append('''<section><h2>Karakter: Oki</h2>
<p class="lead">Oki tamamen kodla çizilir: <code>drawOki(ctx, x, y, ölçek, parametreler, zaman)</code>. Aynı fonksiyon her karede çalıştığı için karakter bölüm boyunca aynı kalır; AI görsel tutarsızlığı oluşmaz. Aşağıda her görünümün altında onu üreten parametre yazılı.</p>
<img class="wide" src="gorseller/karakter_rehberi.jpg">
<p class="small">Görsel dil: düz dolgu · kontur = dolgu rengi <code>shade(renk, -.42)</code> · sol üstte beyaz parlama elipsi · iki parlamalı iri gözler (lacivert göz bebeği) · pembe yanaklar · yere yumuşak gölge. Konuk karakterler (yunus) aynı dille çizilir.</p>
</section>''')

# ---------- sahneler ----------
for sc in C['scenes']:
    tag, ad, amac, neden, teknik = SAHNE[sc['id']]
    fr = [f for f in K if f['scene'] == sc['id']]
    P.append(f'''<section class="scene"><header><span class="tag">{tag}</span><h2>{e(ad)}</h2><span class="time">{tc(sc["start"])}–{tc(sc["end"])} · {sc["end"]-sc["start"]:g} sn</span></header>
<div class="meta"><p><b>Amaç:</b> {e(amac)}</p><p><b>Neden böyle:</b> {e(neden)}</p><p><b>Teknik:</b> <span class="mono">{e(teknik)}</span></p></div>
<div class="{'grid5f' if len(fr) > 8 else 'grid4'}">{frames_html(fr)}</div></section>''')

# ---------- ses ----------
sfx_anlam = [('pop', 'nesne/yazı belirir'), ('whoosh', 'sahne geçişi (otomatik)'), ('bubble', 'su, kabarcık, damla'), ('ding', 'bilgi vurgusu'),
  ('heartbeat', 'kalp'), ('tick', 'geri sayım'), ('tada', 'doğru cevap, başarı'), ('splat', 'mürekkep, çarpma'), ('jet', 'hızlı kaçış'),
  ('sparkle', 'parıltı, yıldız'), ('boing', 'komik zıplama'), ('swoosh_up', 'yukarı uçuş'), ('magic', 'dönüşüm, renk değişimi'),
  ('click', 'küçük mekanik an'), ('drum', 'soru öncesi gerilim'), ('squish', 'sıkışma'), ('wrong', 'durma, hata'), ('shimmer', 'sinir/ışık parıltısı')]
from collections import Counter
cnt = Counter(c['sfx'] for c in C['cues'])
rows = ''.join(f'<tr><td class="mono">{a}</td><td>{e(b)}</td><td>{cnt.get(a,0)}</td></tr>' for a, b in sfx_anlam)
mu = C['music']
P.append(f'''<section><h2>Ses katmanı (duyamadığın kısım)</h2><div class="cols2"><div>
<h3>Müzik: tamamen kodla sentezlenir</h3>
<p>Müzik <code>tools/audio.py</code> ile sentezlenir; telifsizdir. Bölüme özel ayarlar <code>bolum.js → MUSIC</code> alanındadır. Bu bölümde: <span class="mono">{e(json.dumps(mu, ensure_ascii=False))}</span></p>
<ul><li><b>0–10 sn:</b> gizemli minör ped, tek tük çan sesleri ve sona doğru yükselen bir geçiş.</li>
<li><b>10 sn:</b> karakterin ortaya çıkışıyla ritim başlar: 104 BPM, I–V–vi–IV akorları, marimba melodisi, bas ve hafif davul.</li>
<li><b>100.4–103.5 sn:</b> müzik susar, sadece geri sayım tik sesi kalır.</li>
<li><b>131.5–137.7 sn:</b> saklambaç sırasında müzik %35'e kısılır.</li>
<li><b>178.4 sn:</b> final akoru.</li></ul>
<h3>Konuşma alanı (ducking)</h3><p>Her seslendirme satırında müzik −7.5 dB, efektler −3.7 dB kısılır. Bu, <code>VO</code> zamanlarından otomatik hesaplanır; bu yüzden VO zamanlaması doğru olmalı.</p>
<h3>Senin rolün</h3><p>Müzik bestelemezsin. <code>MUSIC</code> alanını (başlangıç, bitiş, sessiz anlar) ve sahnelerdeki <code>cues</code> efekt listesini doğru kurarsın.</p>
</div><div><h3>Efekt sözlüğü (bu bölümde toplam {len(C["cues"])} efekt)</h3>
<table><tr><th>ad</th><th>ne zaman</th><th>adet</th></tr>{rows}</table>
<p class="small">Kural: 10 sn'de en fazla 12 efekt; iki efekt arası en az 0.12 sn; VO'nun üstüne binenler vol .4–.6.</p></div></div></section>''')

# ---------- QC ----------
QC = [('qc1', 'S2 · 00:14.3', 'İsim balonu yıldızların altında kaldı', 'İki öğe aynı anda aynı yerdeydi; "Ben OKİ!" yazısı 6 numaralı yıldızla çakıştı.',
       "Balon, VO'da isim söylendikten sonra kaldırıldı (lt 3.0); yıldızlar ondan sonra geliyor.", 'Önce zamanda ayır, sonra mekânda. Çakışmayı çözmenin en temiz yolu çoğu zaman zamanlamadır.'),
      ('qc2', 'S10 · 02:54.6', 'Pelerin çadıra dönüştü', 'Simetrik, dev bir pelerin karakteri yuttu; Oki elbise giymiş gibi göründü.',
       'Rüzgârda yana dalgalanan küçük bir pelerin ve yıldız amblem yapıldı.', 'Aksesuar karakteri desteklemeli, ezmemeli. Orana dikkat et.'),
      ('qc3', 'S10 · 02:57.2', 'Yunusun altında hayalet halka', 'Kod hatası: clip içinde çizilen elips yolu, restore sonrası yanlışlıkla tekrar stroke edildi (canvas yolu save/restore ile geri alınmaz).',
       'Gövde yolu bir fonksiyona alındı; stroke doğru yola uygulandı.', 'Kod hatasız çalışsa bile görüntü yanlış olabilir. Bu tür hata ancak kareye bakınca görülür.'),
      ('qc4', 'S7 · 02:13.0 (yakın plan)', 'Saklanan Oki yanaklarıyla ele veriyordu', 'Kaya rengine bürünmüş Oki pembe yanaklarıyla hemen fark ediliyordu; kamuflaj bilgisiyle çelişiyordu.',
       "Motora blush parametresi eklendi; gizlenirken 0'a iniyor, ortaya çıkınca geri geliyor.", 'Görsel, anlatılan bilgiyle çelişmemeli.')]
for i in range(0, 4, 2):
    blk = ''
    for k, yer, bas, sorun, cozum, ders in QC[i:i + 2]:
        blk += f'''<div class="qc"><h3>{e(bas)} <span class="time">{e(yer)}</span></h3><div class="pair"><figure><img src="gorseller/{k}_once.jpg"><figcaption class="bad">ÖNCE</figcaption></figure>
<figure><img src="gorseller/{k}_sonra.jpg"><figcaption class="good">SONRA</figcaption></figure></div>
<p><b>Sorun:</b> {e(sorun)} <b>Çözüm:</b> {e(cozum)}</p><p class="ders">Ders: {e(ders)}</p></div>'''
    P.append(f'<section><h2>Kalite kontrol: gerçek düzeltmeler {i//2+1}/2</h2>{blk}</section>')

# ---------- kod ↔ görüntü ----------
src = open(f'{A}/js/scenes/s01_hook.js', encoding='utf-8').read().splitlines()
def blok(bas, son):
    a = next(i for i, l in enumerate(src) if bas in l); b = next(i for i, l in enumerate(src) if i > a and son in l)
    return '\n'.join(src[a:b + 1])
kod = blok('// ipucu 1', "txt(ctx, '3 KALP'") + '\n    …\n' + blok('// soru', "popWords(ctx, 'BU KİM?'")
s1 = [f for f in K if f['scene'] == 's01_hook']
P.append(f'''<section class="codepage"><h2>Kod ↔ görüntü: S1'in iki vuruşu</h2><p class="lead">Her görsel olay bir zaman aralığına bağlıdır. <code>pop(lt, başla)</code> öğeyi o saniyede zıplatarak getirir; zamanlar seslendirme satırlarına kilitlidir (ilk VO 0.5 sn'de başlar, kalpler 0.55 sn'de belirir).</p>
<div class="cols2"><pre>{e(kod)}</pre><div class="grid2">{frames_html([s1[0], s1[-1]])}</div></div>
<p class="small">Tam kaynak: Kod Paketi → <span class="mono">js/scenes/s01_hook.js</span>. Bilgi sahneleri 250–500 satırdır; kısa sahneler (S1, S2, S10) 60–120 satır.</p></section>''')

# ---------- yöntem ----------
P.append('''<section><h2>Yöntem 1/2: format ve seslendirme</h2><div class="cols2"><div>
<h3>180 saniyelik iskelet</h3><table>
<tr><th>Sahne</th><th>Süre</th><th>İşlev</th></tr>
<tr><td>S1 Kanca</td><td>0–10</td><td>Siluet + 3 ipucu + "Sence bu kim?"</td></tr>
<tr><td>S2 Tanıtım</td><td>10–18</td><td>Ortaya çıkış, başlık, 7 yıldız. Ritim başlar</td></tr>
<tr><td>S3 Güç 1</td><td>~26 sn</td><td>Başlıktaki bilgi; en zengin sahne</td></tr>
<tr><td>S4 Güç 2</td><td>~20 sn</td><td>Karşılaştırma (biz ↔ o)</td></tr>
<tr><td>S5 Güç 3</td><td>~26 sn</td><td>Çocuğun kendi bedeniyle bağ</td></tr>
<tr><td>S6 Güç 4</td><td>~26 sn</td><td>SORU: EVET/HAYIR + 3-2-1 + neden</td></tr>
<tr><td>S7 Güç 5</td><td>~24 sn</td><td>OYUN: "… nerede?" + 1.5 sn boşluk</td></tr>
<tr><td>S8 Güç 6</td><td>~17 sn</td><td>Aksiyon</td></tr>
<tr><td>S9 Güç 7</td><td>~13 sn</td><td>Davranış/zekâ, dikkatli genelleme</td></tr>
<tr><td>S10 Kapanış</td><td>170–180</td><td>7 madalya + sonraki bölüm kartı</td></tr></table>
</div><div><h3>Seslendirme kuralları (nedenleriyle)</h3><ul>
<li><b>Ortalama 2.3, en fazla 2.8 kelime/sn.</b> Çocuk anlatıcı yavaş konuşur; hızlı metin kayda sığmaz.</li>
<li><b>Satır süresi ≈ kelime/2.3 + 0.3 sn.</b> Satırlar arası en az 0.2 sn nefes.</li>
<li><b>Cümle ≤ 12 kelime, tek fikir.</b> 4–8 yaşın çalışma belleği kısadır.</li>
<li><b>Satır sahne sınırını geçmez.</b> Sınırın ±0.42 sn'si kabarcık perdesiyle kapalıdır.</li>
<li><b>Çocukla konuş:</b> "Sence…?", "Düşünsene…". Sorudan sonra boşluk bırak.</li>
<li><b>Teknik terim yok</b> (hemosiyanin, kromatofor); sonucu söyle.</li>
<li><b>Sabit kalıp:</b> "Birinci süper güç: …". Tekrar, çocuğa yerini gösterir.</li>
<li><b>Belirsiz bilgi yumuşatılır:</b> "Bazı…", "Bilim insanları düşünüyor ki…".</li>
<li><b>Kapanış sözlüdür:</b> "Bir sonraki bölümde…". Çocuk videosunda yorum ve bitiş ekranı kapalıdır.</li></ul>
</div></div></section>''')
P.append('''<section><h2>Yöntem 2/2: görsel dil, kalite, "bitti" tanımı</h2><div class="cols3"><div>
<h3>Görsel dil</h3><ul>
<li>Her 2–4 sn'de bir değişim: yeni öğe, kamera hareketi ya da ifade.</li>
<li>Ekranda tek anlatım odağı. Bölünmüş ekranda anlatılmayan taraf karartılır.</li>
<li>Görsel, o an söylenen cümlenin <i>anlamını</i> gösterir; süs değildir.</li>
<li>Soyut bilgi karşılaştırmayla gösterilir; sayılar görünür (1-2-3, 1–8).</li>
<li>Ekran yazısı ≤ 3 kelime ve BÜYÜK HARF. Seslendirme cümlesi ekrana yazılmaz.</li>
<li>Karakter tepki verir: şaşırır, yorulur, güler; anlatılan şeye bakar.</li>
<li>Sevimli, asla korkutucu değil.</li>
<li>Güvenli alan: sol üst rozet (x&lt;950, y&lt;210), sağ üst yıldızlar (x&gt;1440, y&lt;150), kenarlardan 80 px içeride.</li></ul>
</div><div><h3>"AI slop" sinyalleri</h3><ul>
<li>Karakterin sahneden sahneye değişmesi</li><li>Bilgiyle ilgisiz parıltı ya da konfeti yağmuru</li>
<li>Bilgi yerine "HARİKA!", "MUHTEŞEM!"</li><li>Her sahnede aynı kompozisyon</li>
<li>Uzun durağanlık ya da 1 sn'de 4 olay</li><li>Doğrulanmamış ya da abartılmış bilgi</li></ul>
<h3>Teknik kurallar</h3><ul><li>Motor dosyalarına dokunulmaz (core, octopus, main, audio)</li><li><code>Math.random</code> yok, sadece <code>rng/hash</code></li>
<li>Global adlar sahne önekiyle başlar (<code>s07_…</code>)</li><li>save/restore dengeli</li></ul>
</div><div><h3>"Bitti" tanımı</h3><ol>
<li><code>dogrula.py</code> → GEÇTİ</li><li><code>tara.mjs</code> → GEÇTİ (hata yok, boş kare yok)</li>
<li>Her sahne için temas föyüne bakıldı ve kalite listesi uygulandı</li><li>Final MP4'ten kareler kontrol edildi</li><li>Bir insan videoyu sesli izledi</li></ol>
<div class="note">Bölüm 1'de 10 sahnenin 4'ünde, kareye bakılınca ilk hâlde görünmeyen kusur bulundu ("Kalite kontrol" sayfaları).</div></div></div></section>''')

# ---------- thumbnail ----------
P.append('''<section><h2>Thumbnail ve yayın</h2><div class="cols2"><div><img class="wide" src="gorseller/thumbnail.jpg"></div><div>
<ul><li><b>Tek vaat:</b> başlıkla ve S3 ile aynı bilgi ("3 KALP VAR!"). Videoda olmayan bir şey gösterilmez.</li>
<li><b>≤ 3 kelime, dev punto.</b> Telefonda 168 px genişlikte okunmalı.</li>
<li><b>Güçlü duygulu yüz:</b> şaşkın Oki; göz yazıya bakar.</li>
<li><b>Tek vurgu öğesi:</b> kalplere bakan ok.</li>
<li><b>Başlık formülü:</b> <i>&lt;Şaşırtıcı bilgi&gt;! 🐙 &lt;Hayvan&gt;'ın 7 Süper Gücü | Çocuklar İçin Eğitici Çizgi Film</i></li>
<li>Kitle: "Çocuklara uygun". Sentetik içerik beyanı gerekmez (gerçekçi olmayan animasyon).</li></ul></div></div></section>''')

# ---------- bölüm 2 ----------
P.append('''<section><h2>Bölüm 2: ne aynı kalır, ne değişir</h2><div class="cols2"><div>
<table><tr><th>AYNI KALIR</th><th>DEĞİŞİR</th></tr>
<tr><td>Motor: core.js, octopus.js, main.js, audio.py</td><td><code>js/bolum.js</code>: süre, sahneler, VO, MUSIC</td></tr>
<tr><td>Oki: serinin sunucusu, aynı görünüm</td><td>Konuk karakter: <code>js/karakterler/yunus.js</code></td></tr>
<tr><td>Palet, fontlar, rozet, ilerleme yıldızları, kabarcık geçişi</td><td>10 sahne dosyası</td></tr>
<tr><td>180 sn iskelet ve sahne işlevleri</td><td>7 bilgi ve onların görsel fikirleri</td></tr>
<tr><td>SFX listesi, araçlar, kalite kuralları</td><td>Thumbnail kompozisyonu, yayın paketi</td></tr></table>
<h3>Süreklilik</h3><p>Bölüm 1, "Bir sonraki bölümde: Yunuslar nasıl uyur?" sözüyle bitti. Bölüm 2 bu soruyla açılmalı ve S3 bu soruyu cevaplamalı (thumbnail vaadi).</p>
</div><div><h3>Yunusun ilk taslağı (S10 kartı)</h3><img class="wide" src="gorseller/yunus_ilk.jpg">
<p><b>Eleştiri, bu tasarımı kopyalama:</b> Bu çizim kapanış kartı için yapılmış hızlı bir taslak ve köpekbalığına benziyor. Bölüm 2'de yunus yıldız karakter; şunlar olmalı:</p>
<ul><li>Belirgin, kısa ve yuvarlak bir <b>gaga (rostrum)</b></li><li>Kavisli, yüksek bir <b>alın (melon)</b></li><li>Başın tepesinde <b>nefes deliği</b> (nefes alma bilgisi için gerekli)</li>
<li>Yatay, hilal biçimli <b>kuyruk yüzgeci</b> (yandan bakışta ince)</li><li>Gülümseyen ağız çizgisi ve Oki'nin göz stili; tek göz açık/kapalı uyuma pozu</li></ul>
<p class="small">Renk paleti: Oki'nin mercan rengiyle çakışmayan serin gri-mavi tonlar. Kontur kuralı aynı: <code>shade(renk, -.42)</code>.</p></div></div></section>''')

CSS = '''@font-face{font-family:Nunito;font-weight:400;src:url(fonts/nunito-latin-400-normal.woff2)}@font-face{font-family:Nunito;font-weight:400;src:url(fonts/nunito-latin-ext-400-normal.woff2);unicode-range:U+0100-02BA,U+1E00-1E9F}
@font-face{font-family:Nunito;font-weight:700;src:url(fonts/nunito-latin-700-normal.woff2)}@font-face{font-family:Nunito;font-weight:700;src:url(fonts/nunito-latin-ext-700-normal.woff2);unicode-range:U+0100-02BA,U+1E00-1E9F}
@font-face{font-family:Baloo;font-weight:800;src:url(fonts/baloo-2-latin-800-normal.woff2)}@font-face{font-family:Baloo;font-weight:800;src:url(fonts/baloo-2-latin-ext-800-normal.woff2);unicode-range:U+0100-02BA,U+1E00-1E9F}
@page{size:A4 landscape;margin:11mm 13mm}
*{box-sizing:border-box}body{margin:0;font:400 9.3pt/1.42 Nunito,'DejaVu Sans',sans-serif;color:#0B2545;-webkit-print-color-adjust:exact}
section{break-after:page}section:last-child{break-after:auto}
h1,h2,h3{font-family:Baloo,Nunito,sans-serif;font-weight:800;margin:0;line-height:1.1}
h2{font-size:21pt;margin-bottom:3mm;color:#0B2545}h3{font-size:11pt;margin:3mm 0 1.2mm;color:#1E7FA6}
p{margin:0 0 2mm}ul,ol{margin:0 0 2mm;padding-left:5mm}li{margin-bottom:.8mm}
.lead{font-size:10.2pt;max-width:250mm;margin-bottom:4mm}.small{font-size:8.2pt;color:#3d5570}
code,.mono,pre{font-family:'DejaVu Sans Mono',monospace;font-size:7.6pt}code{background:#EAF6F8;padding:0 1mm;border-radius:1mm}
pre{background:#0B2545;color:#E9FCFF;padding:3mm;border-radius:2mm;white-space:pre-wrap;font-size:6.7pt;line-height:1.35;margin:0}
.note{background:#FFF6D6;border-left:3px solid #FFD23F;padding:2.5mm 3mm;margin-top:3mm;font-size:9pt}
.cols2{display:grid;grid-template-columns:1fr 1fr;gap:8mm}.cols3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7mm}
table{border-collapse:collapse;width:100%;font-size:8.6pt}th{text-align:left;background:#0B2545;color:#fff;padding:1.4mm 2mm}td{padding:1.2mm 2mm;border-bottom:1px solid #DCE9ED;vertical-align:top}
img{display:block;width:100%;border-radius:1.5mm}.wide{width:100%}
figure{margin:0}figcaption{font-size:7.3pt;line-height:1.3;margin-top:1mm}figcaption b{color:#1E7FA6}.vo{display:block}.sfx{display:block;color:#C2507A;font-size:6.9pt}
.grid5f{display:grid;grid-template-columns:repeat(5,1fr);gap:2.5mm 3mm}.grid5f figcaption{font-size:6.8pt}.codepage .grid2 img{width:82%}.codepage .grid2 figcaption{width:82%}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm 3.5mm}.grid5{display:grid;grid-template-columns:repeat(5,1fr);gap:4mm}.grid2{display:grid;grid-template-columns:1fr;gap:3mm}
.scene header{display:flex;align-items:baseline;gap:3mm;margin-bottom:1.5mm}.scene h2{margin:0}.tag{background:#FFD23F;font:800 11pt Baloo;padding:.6mm 2.4mm;border-radius:2mm}
.time{font:700 8.5pt Nunito;color:#5a7590}.meta{display:grid;grid-template-columns:1fr 1.25fr 1.25fr;gap:5mm;font-size:8.2pt;margin-bottom:3mm;padding:2mm 0;border-top:1px solid #DCE9ED;border-bottom:1px solid #DCE9ED}.meta p{margin:0}
.cover{display:flex;flex-direction:column;align-items:flex-start;background:linear-gradient(135deg,#0B2545,#1E7FA6);color:#fff;padding:14mm 16mm;height:186mm;min-height:0;border-radius:3mm;position:relative}
.cover h1{font-size:40pt;color:#FFD23F}.cover .kicker{font:700 10pt Nunito;letter-spacing:.12em;text-transform:uppercase;opacity:.8;margin-bottom:3mm}.cover .sub{font:800 18pt Baloo;margin:2mm 0 7mm}
.cover .thumb{width:118mm;position:absolute;right:16mm;top:40mm;box-shadow:0 6mm 14mm rgba(0,0,0,.35)}.cover .who{max-width:140mm;font-size:10.5pt;margin-top:auto}
.qc{margin-bottom:4mm}.qc h3{margin-top:0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:4mm;max-width:190mm;margin-bottom:1.5mm}.bad{color:#D9534B;font-weight:700}.good{color:#2FA37A;font-weight:700}.ders{color:#1E7FA6;font-weight:700}'''
open('build/ders.html', 'w', encoding='utf-8').write(f'<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Oki İzleme Kitabı</title><style>{CSS}</style></head><body>\n' + '\n'.join(P) + '\n</body></html>')
print('build/ders.html', len(P), 'bölüm')

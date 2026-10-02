# Kod paketleri: Oki_Kod_Paketi_TAM.txt (her şey) ve Oki_Kod_Paketi_OZ.txt (temel set)
A = '../cocuk-kanali/ahtapot/'; SK = '../hermes-skills/'
YONTEM = [SK + 'cocuk-video-senaryo/SKILL.md', SK + 'cocuk-video-senaryo/references/format.md', SK + 'cocuk-video-animasyon/SKILL.md',
          SK + 'cocuk-video-animasyon/references/sahne-sozlesmesi.md', SK + 'cocuk-video-animasyon/references/kalite-kontrol.md']
YAYIN = [SK + 'cocuk-video-yayin/SKILL.md', SK + 'cocuk-video-yayin/references/youtube-cocuk-kurallari.md']
API = [SK + 'cocuk-video-animasyon/references/motor-api.md']
VERI = [A + 'js/bolum.js', A + 'docs/STORYBOARD.md', SK + 'cocuk-video-senaryo/assets/bolum_sablonu.js']
SAHNE_TUM = [A + f'js/scenes/{s}.js' for s in ['s01_hook', 's02_title', 's03_hearts', 's04_blood', 's05_arms', 's06_quiz', 's07_camo', 's08_ink', 's09_smart', 's10_outro']]
SAHNE_OZ = [A + f'js/scenes/{s}.js' for s in ['s01_hook', 's02_title', 's03_hearts', 's10_outro']]
MOTOR = [A + 'index.html', A + 'js/core.js', A + 'js/octopus.js', A + 'js/main.js', A + 'karakter.html', A + 'thumbnail.html']
ARAC = [A + 'tools/' + f for f in ['dogrula.py', 'preview.mjs', 'sheet.py', 'cues.mjs', 'tara.mjs', 'render.mjs', 'audio.py', 'srt.py']]

def ad(p): return p.replace(A, '').replace(SK, 'skills/')
def paket(cikti, gruplar, baslik):
    parcalar, liste = [], []
    for grup, dosyalar in gruplar:
        parcalar.append(f'\n\n{"=" * 80}\n=== BÖLÜM: {grup}\n{"=" * 80}\n')
        for p in dosyalar:
            s = open(p, encoding='utf-8').read(); n = s.count('\n') + 1; liste.append(f'  {ad(p)} ({n} satır)')
            parcalar.append(f'\n{"#" * 80}\n### DOSYA: {ad(p)}   ({n} satır)\n{"#" * 80}\n{s.rstrip()}\n')
    govde = ''.join(parcalar)
    bas = (f'OKİ\'NİN DENİZ KAŞİFLERİ — {baslik}\n'
           'Bu dosya, "Ahtapotun 3 Kalbi Var!" bölümünü üreten sistemin metin hâlidir. Görsel karşılığı: Oki_Izleme_Kitabi.pdf\n'
           'Okuma sırası: YÖNTEM → MOTOR API → BÖLÜM 1 VERİSİ → BÖLÜM 1 SAHNELERİ → (varsa) MOTOR KAYNAĞI / ARAÇLAR.\n'
           'Her dosya "### DOSYA: <yol>" satırıyla başlar. Motor dosyaları (js/core.js, js/octopus.js, js/main.js, tools/audio.py) DEĞİŞTİRİLMEZ.\n'
           f'Yaklaşık boyut: {len(govde):,} karakter ≈ {len(govde)//3.3/1000:.0f}k token\n\nİÇİNDEKİLER\n' + '\n'.join(liste))
    open(cikti, 'w', encoding='utf-8').write(bas + govde)
    print(cikti, f'{len(liste)} dosya, ~{len(govde)//3.3/1000:.0f}k token')

paket('Oki_Kod_Paketi_TAM.txt', [('YÖNTEM (skill belgeleri)', YONTEM + YAYIN), ('MOTOR API', API), ('BÖLÜM 1 VERİSİ', VERI),
      ('BÖLÜM 1 SAHNELERİ (10 dosya)', SAHNE_TUM), ('MOTOR KAYNAĞI (okumak için; değiştirme)', MOTOR), ('ARAÇLAR (çalıştırmak için)', ARAC)], 'KOD PAKETİ (TAM)')
paket('Oki_Kod_Paketi_OZ.txt', [('YÖNTEM (skill belgeleri)', YONTEM), ('MOTOR API', API), ('BÖLÜM 1 VERİSİ', VERI),
      ('ÖRNEK SAHNELER (4 dosya)', SAHNE_OZ), ('KARAKTER REFERANSI (yunusu bu dille çiz; karakter sayfası kalıbı)', [A + 'js/octopus.js', A + 'karakter.html'])], 'KOD PAKETİ (ÖZ)')

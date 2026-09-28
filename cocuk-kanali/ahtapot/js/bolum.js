// ============================================================
//  BÖLÜM VERİSİ — bölüme özel her şey burada. Motor dosyaları (core.js, octopus.js, main.js) bölümden bölüme DEĞİŞMEZ.
//  Bölüm: Ahtapotun 3 Kalbi Var! (Oki'nin Deniz Kaşifleri #1)
// ============================================================
const DURATION = 180;

// Sahne zaman aralıkları (saniye, mutlak). Sahne dosyaları bunları kullanır.
const T = {
  s01: [0, 10], s02: [10, 18], s03: [18, 44], s04: [44, 64], s05: [64, 90],
  s06: [90, 116], s07: [116, 140], s08: [140, 157], s09: [157, 170], s10: [170, 180]
};

// Seslendirme — mutlak zaman. Görseller bu satırlara senkron. SRT buradan üretilir.
const VO = [
  [0.5, 2.3, 'Üç kalbi var...'],
  [2.6, 4.2, 'Kanı mavi...'],
  [4.5, 6.9, 'Ve kolları kendi kendine düşünebiliyor!'],
  [7.3, 9.6, 'Sence bu gizemli canlı kim?'],
  [10.3, 12.4, 'Bu bir ahtapot! Adı Oki.'],
  [12.8, 17.2, "Hadi, Oki'nin yedi süper gücünü birlikte keşfedelim!"],
  [18.5, 21.5, 'Birinci süper güç: Ahtapotun tam üç kalbi var!'],
  [22.0, 27.5, 'İki küçük kalp, kanı solungaçlara pompalar. Böylece ahtapot sudaki oksijeni alır.'],
  [28.0, 31.5, 'Büyük kalp ise kanı bütün vücuda gönderir.'],
  [32.2, 36.8, 'Ama ilginç bir şey var: Ahtapot yüzerken büyük kalbi durur!'],
  [37.4, 43.2, 'O yüzden ahtapotlar yüzmek yerine, kollarıyla yürümeyi sever.'],
  [44.5, 47.5, 'İkinci süper güç: Ahtapotun kanı mavidir!'],
  [48.0, 51.8, 'Bizim kanımızda demir var, bu yüzden kırmızı.'],
  [52.3, 56.3, 'Ahtapotun kanında ise bakır var. Bu da kanı maviye boyar.'],
  [57.0, 63.2, 'Mavi kan, soğuk ve derin sularda oksijen taşımaya çok yardım eder.'],
  [64.5, 68.0, 'Üçüncü süper güç: Düşünen kollar!'],
  [68.5, 74.0, 'Ahtapotun sinir hücrelerinin üçte ikisi kafasında değil, kollarındadır.'],
  [74.5, 78.2, 'Yani her kol, bir işi kendi başına çözebilir.'],
  [78.8, 82.8, 'Hatta vantuzlarıyla dokunduğu şeyin tadına bakabilir!'],
  [83.4, 89.2, 'Düşünsene: Elinle dokunup çileğin tadını almak!'],
  [90.5, 93.0, 'Dördüncü süper güç... Önce bir soru!'],
  [93.4, 97.6, 'Sence Oki, bu minicik delikten geçebilir mi?'],
  [98.0, 99.8, 'Evet mi, hayır mı?'],
  [100.3, 103.3, 'Üç... iki... bir...'],
  [103.6, 105.4, 'Cevap: Evet!'],
  [105.8, 108.4, 'Çünkü ahtapotun hiç kemiği yok.'],
  [108.8, 115.7, 'Tek sert parçası, papağanınkine benzeyen gagası. Gagası sığarsa, bütün vücudu da sığar!'],
  [116.5, 119.5, 'Beşinci süper güç: Kamuflaj!'],
  [120.0, 124.5, 'Ahtapot, göz açıp kapayıncaya kadar rengini değiştirebilir.'],
  [125.0, 130.5, 'Derisini bile tümsek tümsek yapıp kayaya, kuma ya da mercana benzeyebilir.'],
  [131.2, 134.2, 'Hadi bakalım... Oki nerede?'],
  [135.8, 137.8, 'İşte orada!'],
  [140.5, 143.3, 'Altıncı süper güç: Mürekkep!'],
  [143.8, 148.3, 'Tehlike gelince ahtapot, koyu bir mürekkep bulutu fışkırtır.'],
  [148.8, 154.8, 'Düşman şaşırırken, o da suyu hızla püskürtüp jet gibi kaçar. Vınnn!'],
  [157.5, 161.0, 'Yedinci süper güç: Ahtapot çok zekidir!'],
  [161.5, 165.0, 'Kapağı kapalı bir kavanozu açabilir.'],
  [165.4, 169.6, 'Bazı ahtapotlar hindistan cevizi kabuklarını taşıyıp kendine ev bile yapar!'],
  [170.3, 175.0, 'Üç kalp, mavi kan, düşünen kollar... Ahtapot gerçek bir süper kahraman!'],
  [175.4, 179.4, 'Bir sonraki bölümde: Yunuslar nasıl uyur? Hoşça kal!']
];

// Bilgi sahneleri (ilerleme göstergesindeki yıldızlar, sırasıyla)
const FACTS = [T.s03, T.s04, T.s05, T.s06, T.s07, T.s08, T.s09];

// Müzik yönetimi (tools/audio.py okur): ritmin başladığı an, bitiş akoru, kısık/sessiz aralıklar [başla, bitir, seviye 0..1]
const MUSIC = { bpm: 104, start: 10.0, end: 178.4, quiet: [[100.4, 103.5, 0], [131.5, 137.7, .35]] };

// Sahne dosyaları (js/scenes/<ad>.js), sırasıyla — index.html bunları yükler
const SAHNELER = ['s01_hook', 's02_title', 's03_hearts', 's04_blood', 's05_arms', 's06_quiz', 's07_camo', 's08_ink', 's09_smart', 's10_outro'];

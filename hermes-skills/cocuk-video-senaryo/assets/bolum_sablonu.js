// ============================================================
//  BÖLÜM VERİSİ — bölüme özel her şey burada. Motor dosyaları (core.js, octopus.js, main.js) DEĞİŞMEZ.
//  Bölüm: <BAŞLIK> (Oki'nin Deniz Kaşifleri #<NO>)
//  Tam dolu örnek: cocuk-video-senaryo/references/ornek-bolum-ahtapot.js
// ============================================================
const DURATION = 180;

// Sahne zaman aralıkları (saniye, mutlak). Boşluksuz ve 0 → DURATION kesintisiz olmalı.
const T = {
  s01: [0, 10], s02: [10, 18], s03: [18, 44], s04: [44, 64], s05: [64, 90],
  s06: [90, 116], s07: [116, 140], s08: [140, 157], s09: [157, 170], s10: [170, 180]
};

// Seslendirme — [başla, bitir, 'metin'] mutlak saniye. Görseller buna senkron; SRT ve müzik kısma buradan üretilir.
// Kural: süre ≈ kelime/2.3 + 0.3 sn; ≤ 2.8 kelime/sn; satır sahne sınırını geçmez; satırlar arası ≥ 0.2 sn.
const VO = [
  [0.5, 2.3, '<kanca ipucu 1>'],
  // ...
];

// Bilgi sahneleri (ilerleme göstergesindeki 7 yıldız, sırasıyla)
const FACTS = [T.s03, T.s04, T.s05, T.s06, T.s07, T.s08, T.s09];

// Müzik: ritmin başladığı an (karakterin ortaya çıkışı), bitiş akoru, kısık/sessiz aralıklar [başla, bitir, seviye 0..1]
// Geri sayımda seviye 0 (sadece tik sesi), arama oyununda 0.35.
const MUSIC = { bpm: 104, start: 10.0, end: 178.4, quiet: [[100.4, 103.5, 0], [131.5, 137.7, .35]] };

// Ek dosyalar (js/<ad>.js): konuk hayvan karakteri ve ortak nesneler. Sahnelerden ÖNCE yüklenir.
const EKLER = [];  // ör. ['karakterler/yunus', 'props']

// Sahne dosyaları (js/scenes/<ad>.js), sırasıyla. Ad = T anahtarı + '_' + kısa konu (ör. 's03_kalpler').
const SAHNELER = ['s01_kanca', 's02_baslik', 's03_', 's04_', 's05_', 's06_soru', 's07_oyun', 's08_', 's09_', 's10_kapanis'];

#!/usr/bin/env bash
# Yeni bölüm klasörü kurar: motor + araçlar + boş bölüm verisi. Kullanım: bash scripts/yeni_bolum.sh <hedef_klasör>
set -euo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"; HEDEF="${1:?hedef klasör ver}"
[ -e "$HEDEF/js/core.js" ] && { echo "HATA: $HEDEF zaten bir bölüm klasörü"; exit 1; }
mkdir -p "$HEDEF"/{js/scenes,tools,docs,out}
cp -r "$SKILL/assets/motor/." "$HEDEF/"
cp "$SKILL/scripts/"*.mjs "$SKILL/scripts/"*.py "$HEDEF/tools/"
SENARYO="$SKILL/../cocuk-video-senaryo/assets/bolum_sablonu.js"
[ -f "$HEDEF/js/bolum.js" ] || cp "$SENARYO" "$HEDEF/js/bolum.js"
( cd "$HEDEF" && sha256sum js/core.js js/octopus.js js/main.js tools/audio.py > MOTOR_SHA256.txt )
echo "Kuruldu: $HEDEF"
echo "Sonraki: cd $HEDEF && npm install && npx playwright install chromium && pip install numpy pillow imageio-ffmpeg"
echo "Sonra js/bolum.js'i senaryo çıktısıyla doldur, js/scenes/ altına sahneleri yaz."

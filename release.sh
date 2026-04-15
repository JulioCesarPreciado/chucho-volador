#!/bin/bash

set -e

# ─── Validar parámetro de versión ────────────────────────────────────────────
VERSION=$1

if [ -z "$VERSION" ]; then
  echo "❌  Debes pasar la versión como parámetro."
  echo "    Uso: ./release.sh 0.5.0"
  exit 1
fi

if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "❌  Versión inválida: '$VERSION'. Usa formato semver (ej. 0.5.0)"
  exit 1
fi

TAG="v$VERSION"

echo ""
echo "🚀  Iniciando release $TAG"
echo "────────────────────────────────────────"

# ─── 1. Build ─────────────────────────────────────────────────────────────────
echo ""
echo "📦  [1/7] Construyendo el proyecto..."
yarn build
echo "✅  Build exitoso."

# ─── 2. Generar notas de release desde commits ────────────────────────────────
echo ""
echo "📝  [2/7] Generando notas de release..."

LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

if [ -z "$LAST_TAG" ]; then
  COMMIT_RANGE="HEAD"
else
  COMMIT_RANGE="$LAST_TAG..HEAD"
fi

# Obtener subjects de commits en el rango
ALL_COMMITS=$(git log --pretty=format:"%s" $COMMIT_RANGE)

# Filtrar y formatear features (✨ feat:)
FEATS_LIST=""
while IFS= read -r line; do
  if echo "$line" | grep -q "✨ feat:"; then
    ITEM=$(echo "$line" | sed 's/✨ feat: //')
    FEATS_LIST="${FEATS_LIST}- ${ITEM}"$'\n'
  fi
done <<< "$ALL_COMMITS"

# Filtrar y formatear bugfixes (🐛 fix:)
FIXES_LIST=""
while IFS= read -r line; do
  if echo "$line" | grep -q "🐛 fix:"; then
    ITEM=$(echo "$line" | sed 's/🐛 fix: //')
    FIXES_LIST="${FIXES_LIST}- ${ITEM}"$'\n'
  fi
done <<< "$ALL_COMMITS"

# Construir cuerpo de la release
RELEASE_NOTES="## ✨ What's Changed"$'\n'
if [ -n "$FEATS_LIST" ]; then
  RELEASE_NOTES="${RELEASE_NOTES}${FEATS_LIST}"
else
  RELEASE_NOTES="${RELEASE_NOTES}No new changes."$'\n'
fi

RELEASE_NOTES="${RELEASE_NOTES}"$'\n'"## 🐛 Bug Fixes"$'\n'
if [ -n "$FIXES_LIST" ]; then
  RELEASE_NOTES="${RELEASE_NOTES}${FIXES_LIST}"
else
  RELEASE_NOTES="${RELEASE_NOTES}No bug fixes."$'\n'
fi

echo "✅  Notas generadas."

# ─── 3. Bump versión en package.json ─────────────────────────────────────────
echo ""
echo "🔖  [3/7] Actualizando versión en package.json a $VERSION..."
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.version = '$VERSION';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"
echo "✅  package.json actualizado."

# ─── 4. Git commit ───────────────────────────────────────────────────────────
echo ""
echo "💾  [4/7] Commiteando cambios..."
git add package.json
if git diff --cached --quiet; then
  echo "⚠️   package.json ya estaba en $VERSION, omitiendo commit."
else
  git commit -m "$TAG"
  echo "✅  Commit creado."
fi

# ─── 5. Git tag ──────────────────────────────────────────────────────────────
echo ""
echo "🏷️   [5/7] Creando tag $TAG..."
git tag "$TAG"
echo "✅  Tag creado."

# ─── 6. Git push (commit + tag) ──────────────────────────────────────────────
echo ""
echo "⬆️   [6/7] Haciendo push del commit y el tag..."
git push origin HEAD
git push origin "$TAG"
echo "✅  Push completado."

# ─── 7. GitHub Release ───────────────────────────────────────────────────────
echo ""
echo "🎉  [7/7] Creando GitHub Release $TAG..."
gh release create "$TAG" \
  --title "Version $VERSION" \
  --notes "$RELEASE_NOTES"
echo "✅  GitHub Release creada."

echo ""
echo "────────────────────────────────────────"
echo "✅  Release $TAG completada con éxito."
echo ""

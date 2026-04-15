# Script de Release

Documentación del script `release.sh` para publicar nuevas versiones de la librería.

---

## Requisitos previos

Antes de ejecutar el script asegúrate de tener todo lo siguiente configurado:

### 1. GitHub CLI autenticado

```bash
gh auth login
```

Verifica que estés autenticado correctamente:

```bash
gh auth status
```

### 2. Permisos en el repositorio

Tu cuenta debe tener permisos de **write** en el repositorio para poder hacer push y crear releases.

### 3. Autenticación con GitHub Packages

Para publicar en el registry de GitHub Packages necesitas un token con el scope `write:packages`. Configúralo en tu archivo `~/.npmrc`:

```
//npm.pkg.github.com/:_authToken=TU_TOKEN_AQUI
```

Puedes generar el token en: **GitHub → Settings → Developer settings → Personal access tokens**

Scopes necesarios: `write:packages`, `read:packages`, `repo`

### 4. Node.js y Yarn instalados

```bash
node -v   # v18 o superior recomendado
yarn -v
```

### 5. Estar en la rama correcta

El script hace push a la rama actual. Asegúrate de estar en `main` o `develop` según corresponda antes de ejecutarlo.

```bash
git branch --show-current
```

---

## Cómo usar el script

Desde la raíz del proyecto:

```bash
./release.sh <versión>
```

### Ejemplo

```bash
./release.sh 0.5.0
```

### Formato de versión

La versión debe seguir el estándar **semver** (`MAJOR.MINOR.PATCH`):

| Tipo de cambio | Ejemplo | Cuándo usarlo |
|---|---|---|
| `PATCH` | `0.4.1 → 0.4.2` | Bugfixes sin cambios de API |
| `MINOR` | `0.4.1 → 0.5.0` | Features nuevas sin romper compatibilidad |
| `MAJOR` | `0.4.1 → 1.0.0` | Cambios que rompen compatibilidad |

---

## ¿Qué hace el script paso a paso?

```
[1/7] yarn build               → Compila el proyecto (vite build)
[2/7] Generar notas            → Extrae feat/fix commits desde el último tag
[3/7] Bump version             → Actualiza "version" en package.json
[4/7] git commit               → Commit con mensaje "v1.6.0"
[5/7] git tag                  → Crea el tag v1.6.0
[6/7] git push origin HEAD     → Sube el commit
      git push origin v1.6.0   → Sube el tag
[7/7] gh release create        → Crea la release en GitHub con notas
                                  generadas desde los commits
```

---

## Generación automática de notas de release

El script genera las notas de la release a partir de los commits realizados **desde el último tag hasta el commit actual**.

Solo se incluyen dos tipos de commits:

| Prefijo del commit | Sección en la release |
|---|---|
| `✨ feat:` | ✨ Cambios en esta versión |
| `🐛 fix:` | 🐛 Bugfixes |

Los commits con otros prefijos (`📝 docs:`, `⬆️ bump:`, `🗑️ remove:`, etc.) **no aparecen** en las notas.

### Ejemplo de notas generadas

```markdown
## ✨ Cambios en esta versión
- Agregar componente GuestLayout con su documentación y tipos de props
- Agregar componente BaseButton y su tipo de props

## 🐛 Bugfixes
Sin bugfixes.
```

---

## Consideraciones importantes

- **No ejecutes el script dos veces con la misma versión.** El tag ya existirá en git y fallará.
- **El script aborta ante cualquier error.** Si falla en el paso de build, no se crea ningún tag ni release.
- **El tag de git es la fuente de verdad** de la versión. Nunca edites manualmente `package.json` con la versión nueva sin crear el tag correspondiente.

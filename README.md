# Peñita Mundial 2026 · Supermerge

Repositorio unificado y listo para Vercel/GitHub a partir de los zips disponibles en el proyecto.

## Qué queda montado

- Next.js App Router con páginas de:
  - Inicio
  - Clasificación
  - Resultados
  - Mi Club
  - Versus
  - Mundial 2026
  - Probabilidades en vivo
- Datos demo deterministas para arrancar sin backend.
- Proxy opcional para resultados con `API_SPORTS_KEY`.
- Módulo de probabilidades con Polymarket y fallback Kalshi.
- Navegación mobile-first.
- Assets saneados para Vercel: logo seguro y banderas con nombres ASCII.
- Estructura preparada para GitHub con workflow de CI.

## Zips fusionados

La base funcional se ha construido con esta estrategia:

- `penita-mundial.zip` → base completa con Tailwind, configs y assets.
- `penita-mundial-update.zip` y `penita-mundial-update_1.zip` → absorbidos por versiones posteriores.
- `penita-mundial-wc-update.zip` → aporta el bloque Mundial 2026 / probabilidades.
- `penita-mundial-final-update.zip` → capa final sobre la base, usada como versión principal del runtime.
- `penita-mundial-vercel.zip` → cherry-picks útiles para despliegue y repo:
  - `.env.example`
  - `data/source/participants.csv`
  - `scripts/build_demo_data.py`
  - `public/logo.svg`
- `Banderaszip.zip` → fuente usada para regenerar banderas seguras.

## Mejoras ya aplicadas en esta fusión

- Renombrado de banderas a nombres seguros (`public/flags/*.png`) para evitar problemas de unicode en Vercel.
- Unificación de resolución de banderas en `lib/worldcup/normalize-team.ts` y `lib/flags.ts`.
- Sustitución del logo con path seguro (`/logo.svg`).
- Icono de app seguro (`app/icon.svg`).
- `.github/workflows/ci.yml` para validar build en GitHub Actions.
- `.env.example` alineado con la app final.

## Desarrollo local

```bash
npm install
npm run dev
```

App en:

```bash
http://localhost:3000
```

## Variables de entorno

```bash
API_SPORTS_KEY=
WORLDCUP_MANUAL_MARKET_MAP={}
WORLDCUP_MANUAL_KALSHI_MAP={}
```

Sin variables, la app sigue funcionando con datos demo.

## Subir a GitHub

```bash
git init
git add .
git commit -m "feat: penita mundial supermerge"
git branch -M main
git remote add origin <tu-repo>
git push -u origin main
```

## Desplegar en Vercel

### Opción GitHub

1. Importa el repo en Vercel.
2. Framework detectado: Next.js.
3. Añade variables de entorno si quieres live data.
4. Deploy.

### Opción CLI

```bash
npx vercel
npx vercel --prod
```

## Estructura relevante

```text
app/
  api/results/fixtures/route.ts
  api/worldcup-probabilities/route.ts
  clasificacion/
  mi-club/
  mundial-2026/
  probabilidades/
  resultados/
  versus/
components/
lib/
  data.ts
  flags.ts
  flag-manifest.ts
  venues.ts
  worldcup/
  predictions/
public/
  logo.svg
  flags/
scripts/
  build_demo_data.py
  sanitize_flags.py
```

## Notas

- El repo queda preparado para GitHub, pero el remoto no se crea desde aquí porque requiere tus credenciales.
- La app queda centrada en la variante más completa y coherente de los zips, evitando mezclar en runtime prototipos incompatibles entre sí.
- La propuesta de evolución fuerte está en `MEJORA_BRUTAL.md`.
- El detalle de la fusión está en `MERGE_REPORT.md`.

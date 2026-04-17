# Merge report

## Runtime elegido

Se ha tomado como runtime principal el stack `penita-mundial.zip` + `penita-mundial-final-update.zip`, porque es la combinación que deja:

- configuración Next/Tailwind completa,
- páginas finales más avanzadas,
- módulos de Mundial 2026 y Probabilidades,
- menos fricción para despliegue directo en Vercel.

## Decisiones de fusión

### 1. Base estructural

Copiado desde `penita-mundial.zip`:

- `next.config.js`
- `postcss.config.js`
- `tailwind.config.ts`
- `tsconfig.json`
- `.gitignore`
- `public/flags/` original (luego saneado)

### 2. Overlay principal

Copiado encima desde `penita-mundial-final-update.zip`:

- `app/`
- `components/`
- `lib/`
- `package.json`
- `README.md` original (reemplazado luego por README del supermerge)

### 3. Cherry-picks útiles de `penita-mundial-vercel.zip`

- `.env.example`
- `data/source/participants.csv`
- `scripts/build_demo_data.py`
- `public/logo.svg`

### 4. Assets regenerados

A partir de `Banderaszip.zip`:

- se regeneraron todas las banderas con nombres ASCII seguros en `public/flags/`
- se generó `lib/flag-manifest.ts`
- se unificó la resolución de banderas en una sola capa lógica

## Qué no se ha metido en runtime

### `porra-worldcup-premium-starter.zip`

No se ha inyectado directamente en `app/` porque arrastra una arquitectura paralela (`src/`, providers y componentes propios) que compite con la app final y rompería el árbol actual si se mezcla sin refactor. Se ha usado como referencia conceptual para la propuesta de evolución, no como overlay directo de runtime.

### API routes server-driven del zip `penita-mundial-vercel.zip`

No se han activado en producción dentro del árbol principal porque pertenecen a otro modelo de datos (`lib/server`, `lib/types`, `repository`, sesiones cookie-based) distinto al runtime final. Son buenos candidatos para una fase 2 de backend real.

## Validaciones hechas

- Resolución de imports locales `@/` sin rutas rotas.
- Parseo TypeScript/TSX sin errores de sintaxis.
- Revisión de referencias a logo y banderas para eliminar paths problemáticos.

## Resultado

Un repo único, coherente y listo para subir a GitHub y desplegar en Vercel.

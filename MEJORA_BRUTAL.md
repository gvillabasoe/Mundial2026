# Propuesta de mejora brutal

## Visión

Convertir Peñita Mundial 2026 en una plataforma de porra premium, no solo en un dashboard bonito.

La mejora brutal no va de añadir dos pantallas más; va de pasar de **demo visual potente** a **producto serio, social, trazable y adictivo**.

---

## Objetivo producto

Montar una app con 5 capas:

1. **Core competitivo**
   - scoring real y verificable
   - picks bloqueados por deadlines
   - recalculado automático por partido

2. **Core social**
   - peñas privadas
   - rankings por grupos de amigos
   - comentarios, piques, activity feed real

3. **Core live**
   - partido en directo
   - evolución de puntos en tiempo real
   - delta de posiciones según goles / resultados

4. **Core predictivo**
   - simulador de escenarios
   - probabilidades de acabar top 3/top 10/último
   - comparador “qué necesito para remontar”

5. **Core operativo**
   - panel admin
   - importación de CSV/Excel
   - auditoría de scoring
   - despliegue estable + observabilidad

---

## Brutalidad nivel 1: pasar la demo a motor real

### 1. Ingesta real de datos

Crear un pipeline de importación desde:

- `Plantilla_Mundial.xlsx`
- `Plantilla_Mundial_muestra_50_nicknames.csv`

Resultado:

- participantes reales
- picks reales por usuario
- especiales reales
- scoring recalculable sin mocks

### 2. Scoring engine único

Mover toda la lógica de puntuación a un motor central:

- `lib/scoring/engine.ts`
- `lib/scoring/rules.ts`
- `lib/scoring/audit.ts`

Con esto consigues:

- misma lógica para ranking, participante, versus y admin
- trazabilidad por partido y por regla
- facilidad para debug

### 3. Snapshots del torneo

Guardar snapshots versionados del estado del torneo:

- `snapshot-0001.json`
- `snapshot-0002.json`
- `snapshot-live.json`

Eso habilita:

- rollback
- recalculado histórico
- comparativas antes/después
- debugging serio

---

## Brutalidad nivel 2: experiencia live que enganche

### 4. Live Match Center

Para cada partido:

- marcador live
- timeline de goles
- qué equipos de la porra ganan o pierden puntos con cada gol
- ranking instantáneo durante el partido

### 5. Ranking en tiempo real

Nueva vista:

- “si el partido acaba así”
- “si mete gol España”
- “si hay empate”

Con animación de:

- subidas/bajadas de posición
- puntos ganados en directo
- cambios de podio

### 6. Modo tensión

Pantalla específica para jornadas clave:

- top 10 en directo
- perseguidores inmediatos
- gap al líder
- picks que te separan del rival

---

## Brutalidad nivel 3: juego social de verdad

### 7. Peñas privadas

Cada usuario puede crear o unirse a:

- peña familiar
- peña curro
- peña amigos
- peña premium pública

Cada peña con:

- tabla propia
- mini feed
- avatar / branding
- premio / castigo

### 8. Activity feed real

Eventos tipo:

- “Carlos sube al 1º”
- “Laura clava doble puntuación”
- “Pepe falla campeón”
- “Marta adelanta a 3 rivales en 4 minutos”

### 9. Chat y piques ligeros

No hace falta un Discord dentro.

Sí hacen falta:

- reacciones rápidas
- comentarios por jornada
- mensajes automáticos del sistema
- badges sociales (“cazador del líder”, “rey del signo”, “doble killer”)

---

## Brutalidad nivel 4: inteligencia de producto

### 10. Simulador de escenarios

El usuario elige:

- gana A / empate / gana B
- clasifica X / cae Y

Y la app responde:

- tu nueva posición
- puntos proyectados
- rivales a los que adelantas
- opciones reales de podio

### 11. Probabilidad de resultado final de la porra

No solo probabilidades del Mundial.

También probabilidades de la propia porra:

- probabilidad de quedar 1º
- top 3
- top 10
- farolillo rojo

### 12. Explainable scoring

Cada punto debe ser explicable:

- de dónde sale
- qué pick lo generó
- qué regla aplicó
- qué cambió desde el último snapshot

Eso da muchísima confianza y reduce discusiones.

---

## Brutalidad nivel 5: modo admin / negocio

### 13. Panel de administración

Backoffice con:

- importar picks
- subir resultados oficiales
- recalcular porra
- bloquear picks
- abrir/cerrar mini porras
- exportar ranking y auditorías

### 14. Logs y observabilidad

Necesario para Vercel serio:

- errores por ruta
- latencia API
- jobs fallidos
- snapshot versioning
- diff de scoring entre ejecuciones

### 15. Modelo premium opcional

Si quieres llevarlo lejos:

- peñas premium con branding
- export PDF/imagen del ranking
- histórico por edición
- predicciones avanzadas
- notificaciones push

---

## Arquitectura recomendada

### Front

- Next.js App Router
- Server Components para lectura
- Client Components solo donde haya interacción live
- SWR o React Query para polling fino

### Datos

- PostgreSQL + Prisma
- tablas de usuarios, equipos, picks, fixtures, snapshots, rankings, peñas, activity

### Jobs

- cron o background jobs para:
  - ingestión de resultados
  - recalculado de scoring
  - generación de snapshots
  - recomputación de rankings

### Infra

- Vercel para front y routes ligeras
- Neon/Supabase/Postgres para persistencia
- Upstash Redis para cache de ranking live
- Sentry para errores

---

## Roadmap recomendado

### Fase 1 · dejarla lista para producción

- merge limpio
- assets seguros
- GitHub + CI
- deploy estable en Vercel
- limpieza de datos demo

### Fase 2 · motor real

- parser Excel/CSV
- scoring engine único
- snapshots
- admin mínimo

### Fase 3 · live y social

- ranking live
- activity feed real
- peñas privadas
- comentarios ligeros

### Fase 4 · capa wow

- simulador de escenarios
- probabilidades de la porra
- explainable scoring
- exports premium

---

## Mi recomendación más bestia pero más rentable

Si solo eliges **una** gran mejora, que sea esta:

## “Motor real + snapshots + ranking live”

Porque eso te da a la vez:

- credibilidad
- emoción en directo
- base técnica sólida
- posibilidad de monetizar o escalar
- menos trabajo duplicado después

Sin eso, todo lo demás es maquillaje.
Con eso, la app ya parece un producto serio.

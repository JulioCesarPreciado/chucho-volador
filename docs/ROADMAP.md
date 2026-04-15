# Roadmap — Wuiwuichu: Alien Invasion

> Estado actual: Prototipo en construcción  
> Objetivo final: Juego completo publicable

---

## Filosofía del roadmap

Este proyecto avanza en **fases acumulativas**: cada fase produce algo jugable por sí sola antes de pasar a la siguiente. Nunca se rompe lo que ya funciona — se construye encima.

El eje central es:

```
Flappy Bird en Phaser → Prototipo platformer → Loop roguelite → Juego completo
```

---

## Fase 0 — Migración a Phaser ✅

> Fundamento técnico: el juego original corriendo en el stack moderno.

- [x] Setup Vite + Phaser 3 + TypeScript
- [x] BootScene, MenuScene, GameScene
- [x] Login con localStorage
- [x] Física del pájaro (velocidad constante, sin gravedad)
- [x] Tuberías con spawn, movimiento y culling
- [x] Colisión AABB manual
- [x] Marcador de puntos
- [x] Retorno al menú con puntuación

---

## Fase 1 — Cimientos del platformer

> Objetivo: reemplazar el Flappy Bird por un personaje que corra y salte sobre tiles.  
> Al terminar esta fase existe un nivel jugable, sin combate ni enemigos.

### 1.1 — Controles y física SMB3
- [ ] Personaje con arcade physics body (gravedad real)
- [ ] Correr con aceleración e inercia al cambiar de dirección
- [ ] Salto variable: altura depende de cuánto se mantiene el botón
- [ ] Gravedad aumentada post-peak (caída rápida)
- [ ] Agacharse
- [ ] Colisión sólida con el suelo y plataformas

### 1.2 — Tilemap base
- [ ] Primer tilemap estático con Tiled (suelo, plataformas, paredes)
- [ ] Integración Phaser Tilemap + Arcade Physics
- [ ] Cámara que sigue al personaje horizontalmente
- [ ] Límites de mundo (no caer al vacío infinito)

### 1.3 — Assets temporales
- [ ] Sprite sheet del gato (idle, correr, saltar, caer) — placeholder pixel art
- [ ] Tileset básico (suelo, plataforma, fondo) — puede ser geométrico
- [ ] Animaciones conectadas al estado del personaje

---

## Fase 2 — Combate automático

> Objetivo: el gato dispara solo. El primer sabor del loop de Vampire Survivors.  
> Al terminar esta fase el juego se puede "jugar" aunque no tenga progresión.

### 2.1 — Sistema de armas base
- [ ] Clase `WeaponSystem` que se llama desde `update`
- [ ] Primera arma: Pistola de agua (proyectil recto, cadencia fija)
- [ ] Object pool de proyectiles (no crear/destruir cada frame)
- [ ] Dirección automática: dispara hacia el enemigo más cercano

### 2.2 — Primer enemigo
- [ ] Clase `Enemy` base con vida, velocidad y sprite
- [ ] Dron básico: vuela horizontalmente y dispara al gato
- [ ] Spawn manual en posiciones fijas para pruebas

### 2.3 — Sistema de vida
- [ ] Barra de vida del gato (HUD)
- [ ] Daño al recibir proyectil o contacto con enemigo
- [ ] Muerte del gato → pantalla de game over
- [ ] Muerte de enemigos → desaparecen con efecto

---

## Fase 3 — Generación procedural

> Objetivo: cada run genera un mapa diferente.  
> Al terminar esta fase no hay dos partidas iguales.

### 3.1 — Sistema de chunks
- [ ] Definir formato de chunk (array de tiles + reglas de spawn)
- [ ] Pool de chunks por tipo: llanura, plataformas, cueva
- [ ] Generador que encadena chunks aleatoriamente
- [ ] Transiciones suaves entre chunks

### 3.2 — Scroll y carga dinámica
- [ ] Chunks se generan adelante del jugador conforme avanza
- [ ] Chunks viejos se destruyen detrás (memoria)
- [ ] Scroll horizontal automático con velocidad base configurable

### 3.3 — Spawn de enemigos por chunk
- [ ] Cada tipo de chunk tiene su tabla de enemigos posibles
- [ ] Spawn condicional según tiempo de run transcurrido
- [ ] Densidad de enemigos escala con el progreso

---

## Fase 4 — Loop roguelite

> Objetivo: las decisiones del jugador importan run a run.  
> Al terminar esta fase el juego tiene replay value real.

### 4.1 — Experiencia y niveles
- [ ] Orbes de XP al matar enemigos (con animación de atracción)
- [ ] Barra de XP en HUD
- [ ] Al subir nivel: pausa + pantalla de 3 cartas aleatorias

### 4.2 — Pool de mejoras
- [ ] Sistema de cartas: armas, pasivas, activas
- [ ] Segunda arma: Escopeta de burbujas (disparo en cono)
- [ ] 5 pasivas iniciales: +velocidad, +vida máx., +área, +cadencia, +daño
- [ ] Lógica de rareza: común, poco común, raro

### 4.3 — Meta-progresión
- [ ] Guardado de desbloqueos en localStorage
- [ ] Condiciones de desbloqueo (matar X enemigos, llegar al piso 2, etc.)
- [ ] Pantalla de colección: items desbloqueados vs. siluetas pendientes

---

## Fase 5 — Estructura de pisos

> Objetivo: la run tiene inicio, desarrollo y jefe final.  
> Al terminar esta fase existe el primer final completo del juego.

### 5.1 — Sistema de pisos
- [ ] Piso 1 completo: Afueras del Pueblo (chunks + enemigos propios)
- [ ] Boss del piso 1: Centinela Alienígena (patrones simples, 2 fases)
- [ ] Transición entre pisos (pantalla de interludio + stat summary)
- [ ] Piso 2: Los Tejados (nuevo tileset, enemigos nuevos)

### 5.2 — Eventos especiales
- [ ] Tienda del pueblo (NPC vende items con monedas drop)
- [ ] Sala del tesoro (item garantizado + enemigos élite)
- [ ] Evento de oleada (sobrevivir X segundos = recompensa)

### 5.3 — Primer final jugable
- [ ] Derrotar boss del piso 2 → cinemática simple → créditos
- [ ] Pantalla de resultados: kills, tiempo, items usados
- [ ] Este es el **Final 2** del árbol de finales del GDD

---

## Fase 6 — Polish y publicación del prototipo

> Objetivo: el juego se ve y se siente como un producto real.  
> Esta fase convierte el prototipo en algo que otros pueden jugar y disfrutar.

### 6.1 — Arte y audio
- [ ] Sprites finales del gato (idle, run, jump, fall, hurt, die)
- [ ] Tilesets definitivos para pisos 1 y 2
- [ ] Efectos de partículas: polvo al aterrizar, chispas en impactos
- [ ] Música chiptune por piso
- [ ] SFX: salto, disparo, impacto, muerte, subir nivel

### 6.2 — UX y menús
- [ ] Pantalla de inicio con animación
- [ ] Menú de pausa in-game
- [ ] Settings: volumen música/sfx
- [ ] Tutorial implícito (primer chunk siempre es plano y sin enemigos)

### 6.3 — Despliegue
- [ ] Build de producción optimizado (`npm run build`)
- [ ] Deploy en hosting web (actualizar pgm-apps.com o GitHub Pages)
- [ ] PWA: service worker + instalable en móvil
- [ ] Pruebas en móvil (touch controls para salto y agacharse)

---

## Después del prototipo — evolución a proyecto serio

> Esta sección no tiene tickets — es la visión a largo plazo que guía las decisiones de arquitectura de hoy.

Cuando el prototipo esté publicado y validado, el proyecto escala en estas direcciones:

**Contenido**
- Pisos 3–6 completos con sus bosses
- 7 finales desbloqueables (árbol completo del GDD)
- 6+ armas, 15+ pasivas, 3 activas
- 10+ tipos de enemigos

**Infraestructura técnica**
- Migrar estado del juego a un sistema formal (máquina de estados o store reactivo)
- Separar datos de juego en archivos JSON (armas, enemigos, chunks) — sin magic numbers en código
- Sistema de eventos desacoplado para comunicación entre sistemas
- Tests de integración para los sistemas más críticos (generación procedural, roguelite)

**Distribución**
- Backend mínimo para leaderboard global
- Cuenta de jugador (no solo localStorage)
- Posible port a desktop via Electron o Tauri si la demanda lo justifica

---

*Roadmap vivo — cada fase se cierra con un commit de release y una entrada en RELEASE-NOTES.md.*

# Game Design Document — Chucho Volador: Alien Invasion

> Version 0.2.0 — Concepto inicial  
> Estado: En diseño

---

## Resumen ejecutivo

**Título tentativo:** Wuiwuichu: Alien Invasion  
**Género:** Platformer 2D + Auto-shooter + Roguelite  
**Plataforma:** Web (navegador), posible PWA  
**Perspectiva:** Side-scroller 2D  
**Estética:** Pixel art 8-bit, inspirado en NES  
**Referentes principales:**
- Super Mario Bros 3 (NES) — mecánicas de plataforma
- Vampire Survivors — sistema de disparo automático y progresión roguelite
- Spelunky / Dead Cells — generación procedural y loop roguelite
- The Binding of Isaac - estructura de pisos + meta-progresión + finales múltiples

---

## Historia y contexto

Un gato ordinario vive en un pequeño pueblo tranquilo. Un día, una flota alienígena aparece en el cielo y comienza el ataque. Sin ejército, sin héroes disponibles, el gato decide tomar las armas y defender su hogar.

El jugador controla al gato en runs sucesivas, cada vez más lejos del pueblo, enfrentando oleadas de alienígenas con habilidades y armas que desbloquea en el camino.

---

## Gameplay Core

### Filosofía de diseño

El juego tiene **dos capas que coexisten sin interferirse:**

1. **Plataforma pura** — el jugador piensa en el movimiento, el terreno, los saltos
2. **Combate automático** — el juego dispara solo, el jugador decide qué armas/habilidades tiene equipadas

El reto no es apuntar. El reto es *sobrevivir el terreno mientras el caos alien sucede a tu alrededor.*

---

## Mecánicas de plataforma

### Inspiración: Super Mario Bros 3 (NES)

Los controles deben sentirse **responsivos, pesados y precisos** al mismo tiempo. No floaty, no resbaladizo.

| Acción | Comportamiento |
|---|---|
| Correr | Velocidad base + aceleración al mantener el botón |
| Salto | Altura variable según duración del botón (tap = salto corto, hold = salto alto) |
| Caída | Gravedad aumentada después del peak del salto (no flota en el aire) |
| Salto en carrera | Mayor distancia horizontal, inercia conservada |
| Agacharse | Protección de proyectiles bajos, deslizarse en pendientes |
| Borde de plataforma | Sin "coyote time" exagerado — debe sentirse NES-puro |

### Sensación objetivo

- Peso real en los saltos
- Sin aceleración excesiva al cambiar de dirección (cierta inercia)
- El terreno importa: desniveles, plataformas móviles, caídas con consecuencias
- Precisión pixel-perfect en plataformas pequeñas

---

## Sistema de combate

### Disparo automático (Vampire Survivors style)

El gato dispara **automáticamente sin input del jugador.** El jugador no apunta; el sistema elige el objetivo más cercano / más peligroso según el arma equipada.

- Cada arma tiene su propia cadencia, rango, patrón y tipo de daño
- Múltiples armas pueden estar activas simultáneamente
- El foco del jugador es el movimiento y la supervivencia, no el aim

### Tipos de armas (ideas iniciales)

| Arma | Comportamiento |
|---|---|
| Pistola de agua | Proyectil recto, rápido, bajo daño |
| Escopeta de burbujas | Disparo en cono, corto alcance, alto daño |
| Rayo láser | Haz continuo que traspasa enemigos |
| Bomba de queso | AOE al impacto, lanzada en arco |
| Boomerang de lata | Regresa al gato, puede golpear 2 veces |
| Arañas robóticas | Minions que orbitan al gato y atacan solos |

---

## Sistema Roguelite

### Loop de una run

```
Inicio de run
    ↓
Mundo procedural generado
    ↓
El gato avanza, enemigos aparecen
    ↓
Enemigos sueltan Experiencia al morir
    ↓
Al subir de nivel → pantalla de elección (3 opciones)
    ↓
Elegir: nueva arma / pasiva / activa
    ↓
Continuar hasta morir o completar el run
    ↓
Pantalla de resultados → meta-progresión (desbloqueos permanentes)
```

### Experiencia y niveles

- Los enemigos sueltan **orbes de XP** al morir
- Al llenar la barra de XP → pantalla de pausa con **3 cartas** aleatorias
- El jugador elige 1
- Sin segunda oportunidad — la elección es definitiva para esa run

### Tipos de mejoras

**Armas (activas)**
- Añaden o mejoran una fuente de daño
- Máximo 6 armas simultáneas (igual que Vampire Survivors)
- Cada arma tiene hasta 5 niveles de mejora

**Pasivas**
- No tienen nivel, son binarias (tienes o no tienes)
- Ejemplos: +velocidad de movimiento, +vida máxima, +área de daño, +rebote de proyectiles

**Activas (habilidades)**
- Cooldown manual, activadas con un botón
- Ejemplos: dash invencible, escudo temporal, llamar refuerzos del pueblo

### Meta-progresión (entre runs) — estilo The Binding of Isaac

El progreso off-game es acumulativo y permanente. Cada run, sin importar si ganas o pierdes, puede desbloquear algo nuevo que amplía el pool de futuras runs.

**Principio:** el juego se vuelve más rico con cada intento. Nunca das un paso atrás.

#### Cómo se desbloquea contenido

| Condición | Desbloqueo |
|---|---|
| Llegar al piso 2 por primera vez | Nueva arma entra al pool |
| Matar X enemigos en una run | Nueva pasiva disponible |
| Derrotar un boss por primera vez | Nuevo final parcial + nuevo enemigo en pool |
| Completar una run sin recibir daño en un piso | Item secreto desbloqueado |
| Morir por primera vez con un arma específica | Variante mejorada de esa arma |
| Alcanzar nivel X de XP en una sola run | Slot extra de arma activa |
| Encontrar un item especial oculto | Se agrega al pool permanente |

#### Pool de desbloqueos

- Todo lo que se desbloquea entra al **pool global permanente** guardado en localStorage
- El pool crece con cada run — cuanto más juegas, más variedad de opciones ves en las cartas
- Al inicio solo hay 3 armas y 5 pasivas disponibles; con el tiempo el pool puede llegar a 30+ items
- Algunos items solo aparecen si ciertos otros items ya están desbloqueados (árboles de dependencia)

#### Tracking visible

- Pantalla de colección (como el "+" de Isaac) donde el jugador ve qué ha desbloqueado
- Items no desbloqueados aparecen como siluetas con pistas sobre cómo obtenerlos
- Contador de runs, kills totales, bosses derrotados

---

## Estructura de pisos — estilo The Binding of Isaac

### Concepto de pisos

Una run se divide en **pisos** con identidad propia: bioma, enemigos, boss y paleta visual únicos. Al final de cada piso hay un boss obligatorio. Derrotarlo abre la puerta al siguiente piso.

```text
RUN
├── Piso 1: Afueras del Pueblo        (tutorial implícito, enemigos básicos)
│   └── Boss: Centinela Alienígena
├── Piso 2: Los Tejados               (plataformas estrechas, más verticalidad)
│   └── Boss: Dron Comandante
├── Piso 3: El Bosque Contaminado     (terreno irregular, trampas naturales)
│   └── Boss: Bestia Mutante
├── Piso 4: Las Ruinas                (ambiente post-apocalíptico, enemigos élite)
│   └── Boss: Guardián de las Ruinas
├── Piso 5: La Nave Alienígena        (interior metálico, gravedad alterada)
│   └── Boss: General Alienígena
└── Piso 6: El Núcleo                 (final, solo accesible con ciertos desbloqueos)
    └── Boss Final: El Invasor Supremo
```

### Generación procedural del mundo

Dentro de cada piso, el mapa se genera usando **reglas de construcción por bloques (chunk-based generation):**

- El mundo se construye en segmentos horizontales (chunks)
- Cada chunk pertenece al bioma del piso actual (tileset, enemigos, obstáculos propios)
- Los chunks se encadenan con transiciones suaves
- La dificultad de los chunks aumenta hacia el final del piso (acercándose al boss)

### Tipos de chunks por piso

| Piso | Chunks característicos |
|---|---|
| Afueras del Pueblo | Llanura, puentes de madera, graneros |
| Los Tejados | Plataformas suspendidas, chimeneas, tendederos |
| El Bosque Contaminado | Árboles caídos, charcos tóxicos, cuevas pequeñas |
| Las Ruinas | Escombros, pisos que colapsan, andamios |
| La Nave Alienígena | Plataformas metálicas, láseres trampa, gravedad reducida |
| El Núcleo | Fragmentos flotantes, void, terreno inestable |

### Eventos especiales dentro de un piso

Antes de llegar al boss, pueden aparecer eventos aleatorios que añaden variedad:

| Evento | Descripción |
|---|---|
| Tienda del pueblo | NPC vende items a cambio de monedas drop de enemigos |
| Sala del tesoro | Item garantizado, pero rodeado de enemigos élite |
| Sala maldita | Debuff temporal a cambio de XP masiva |
| Portal secreto | Acceso a piso alternativo (cambia el final posible) |
| Evento de oleada | Sobrevivir X segundos de spawn masivo = recompensa |

### Cámara

Side-scroller horizontal con scroll automático suave — el mapa avanza aunque el jugador no se mueva (como un endless runner pero con control total del personaje).

---

## Enemigos

### Filosofía

Enemigos simples individualmente, peligrosos en cantidad. Cada enemigo tiene **un patrón legible** para que el jugador pueda predecirlo y esquivarlo con el movimiento.

### Tipos base

| Enemigo | Comportamiento |
|---|---|
| Dron básico | Vuela en línea recta, dispara al gato |
| Araña cosmica | Camina por el suelo, sube paredes |
| Medusa estelar | Flota hacia el gato lentamente, explota al contacto |
| Soldado alien | Camina, salta plataformas, dispara en ráfagas |
| Tanque oruga | Lento, mucha vida, proyectil AOE |
| Boss: Comandante | Aparece cada X tiempo, patrones múltiples fases |

### Escalado de dificultad

- Con el tiempo, aumenta la **frecuencia** de spawn y la **variedad** de enemigos
- Enemies empiezan a aparecer en combinaciones peligrosas
- Cada X minutos aparece un mini-boss o evento especial

---

## Estética y arte

### Referencia visual

- Pixel art NES/SNES — paleta limitada, sprites pequeños y claros
- Fondo de parallax con cielo nocturno, pueblo iluminado, nave alienígena en el horizonte
- Efectos de partículas simples: polvo al aterrizar, chispas en impactos, orbes de XP animados

### Sonido

- Música chiptune 8-bit
- SFX crunchy: saltos, disparos, impactos, explosiones
- Tema musical que escala con la intensidad de la run

### Personaje principal

- Gato pixel art, animaciones: idle, correr, saltar, caer, morir
- Diferentes "skins" desbloqueables como recompensa meta

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | **Phaser 3** |
| Build tool | **Vite** |
| Lenguaje | **TypeScript** |
| Física | Phaser Arcade Physics |
| Tilemaps | Tiled + Phaser Tilemap API |
| Generación procedural | Custom chunk system sobre tilemaps |
| Audio | Phaser Sound Manager |
| Persistencia | localStorage (meta-progresión) |
| Despliegue | Web estático (mismo hosting actual) |

---

## Roadmap de desarrollo

### Fase 1 — Fundamentos
- [ ] Setup Vite + Phaser 3 + TypeScript
- [ ] Escena básica con tilemap
- [ ] Personaje con física de plataforma (SMB3-feel)
- [ ] Cámara side-scroller

### Fase 2 — Combate
- [ ] Sistema de disparo automático (primera arma)
- [ ] Primer enemigo con pathfinding simple
- [ ] Sistema de vida (jugador y enemigos)
- [ ] Orbes de XP + barra de experiencia

### Fase 3 — Roguelite
- [ ] Sistema de niveles y pantalla de elección de cartas
- [ ] 3 armas implementadas
- [ ] 5 pasivas implementadas
- [ ] Pantalla de game over + resultados

### Fase 4 — Mundo procedural
- [ ] Sistema de chunks
- [ ] 3 tipos de chunks generados aleatoriamente
- [ ] Escalado de dificultad por tiempo

### Fase 5 — Contenido y polish
- [ ] 6+ armas
- [ ] 5+ tipos de enemigos
- [ ] Boss fight
- [ ] Meta-progresión entre runs
- [ ] Sonido y música
- [ ] Pantalla de inicio, menú, settings

---

## Finales múltiples — estilo The Binding of Isaac

El juego tiene **varios finales**, la mayoría bloqueados en la primera run. Cada final requiere cumplir condiciones específicas que el jugador descubre explorando o fallando.

### Árbol de finales

```text
Final 1: "Retirada"         → Morir en cualquier piso (el pueblo sobrevive pero el gato cae)
Final 2: "Victoria parcial" → Derrotar al boss del piso 5 sin haber encontrado el portal secreto
Final 3: "El pueblo resiste"→ Derrotar al boss del piso 5 con al menos 1 NPC del pueblo vivo
Final 4: "El núcleo"        → Acceder al piso 6 (requiere haber derrotado el piso 5 al menos 1 vez)
Final 5: "Origen"           → Derrotar al boss final habiendo coleccionado los 4 fragmentos ocultos
Final 6: "El último gato"   → Completar una run sin usar ninguna arma desbloqueada (solo la inicial)
Final 7: ???                → Condición oculta, se descubre jugando
```

### Cómo se desbloquean los finales

- **Final 1** siempre está disponible (es perder)
- **Final 2** disponible desde la primera run si llegas lejos
- **Final 3** requiere que el sistema de NPCs del pueblo esté desbloqueado (meta-progresión)
- **Final 4** requiere haber completado el final 2 o 3 al menos una vez
- **Final 5** requiere haber visto el final 4 y conocer las ubicaciones de los fragmentos
- **Final 6** es un desafío para jugadores avanzados, desbloquea una skin especial
- **Final 7** es secreto — pista visible solo en la pantalla de colección cuando tienes 6 de 7 finales

### Pantalla de finales

En el menú principal hay una galería de finales donde:

- Los finales vistos muestran su escena y texto completo
- Los finales no vistos aparecen como `???` con una pista críptica
- Ver todos los finales desbloquea el modo "Invasión extrema" (dificultad adicional)

---

## Preguntas abiertas de diseño

- ¿Tiene el gato vidas limitadas o solo una por run (permadeath puro)?
- ¿El scroll es forzado (auto-runner) o el jugador controla el avance horizontal?
- ¿Hay interacción con el pueblo como hub entre runs?
- ¿Los NPCs del pueblo dan misiones o diálogos que expanden la historia?
- ¿Hay un estado "win" o es infinito hasta morir?

---

*Documento vivo — actualizar con cada decisión de diseño importante.*

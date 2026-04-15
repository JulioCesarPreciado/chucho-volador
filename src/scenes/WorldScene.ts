import Phaser from 'phaser'
import { Player } from '../objects/Player'

// Dimensiones del nivel de prueba (Phase 1.1)
// Lo suficientemente largo para explorar saltos y movimiento
const LEVEL_WIDTH  = 4000
const TILE_SIZE    = 32

export class WorldScene extends Phaser.Scene {
  private player!: Player
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private debugText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'WorldScene' })
  }

  // ─── Crear texturas procedurales ──────────────────────────────────────────
  // Mientras no haya sprites definitivos, generamos colores sólidos en memoria.
  // Fácil de reemplazar con sprites reales en fases futuras.

  private createTextures() {
    // Pixel blanco base — se tinta por plataforma
    // Usamos add.graphics() y destroy() para generar la textura sin dejarla en escena
    const gfx = this.add.graphics()
    gfx.fillStyle(0xffffff)
    gfx.fillRect(0, 0, TILE_SIZE, TILE_SIZE)
    gfx.generateTexture('tile', TILE_SIZE, TILE_SIZE)
    gfx.destroy()

    // Placeholder del gato — capas de detalle sobre sprite 32x48
    const cat = this.add.graphics()

    // Capa 1: cuerpo y cabeza — gris oscuro
    cat.fillStyle(0x484744)
    cat.fillRect(2, 8, 28, 38)                    // cuerpo principal

    // Capa 2: orejas externas — misma tonalidad gris
    cat.fillStyle(0x484744)
    cat.fillTriangle(2, 10,  12, 10,  7, 0)       // oreja izquierda
    cat.fillTriangle(20, 10, 30, 10, 25, 0)       // oreja derecha

    // Capa 3: interior de orejas — blanco cremoso
    cat.fillStyle(0xfff0f0)
    cat.fillTriangle(4, 9,   10, 9,   7, 2)       // interior izquierdo
    cat.fillTriangle(22, 9,  28, 9,  25, 2)       // interior derecho

    // Capa 4: pecho — blanco
    cat.fillStyle(0xffffff)
    cat.fillEllipse(16, 36, 14, 18)               // manchón del pecho

    // Capa 5: collar — rojo
    cat.fillStyle(0xcc1111)
    cat.fillRect(4, 21, 24, 4)                    // banda del collar

    // Capa 6: ojos — amarillo iris
    cat.fillStyle(0xf5d400)
    cat.fillCircle(10, 15, 3)                     // ojo izquierdo
    cat.fillCircle(22, 15, 3)                     // ojo derecho

    // Capa 7: pupila vertical — negro (forma de ranura de gato)
    cat.fillStyle(0x111111)
    cat.fillEllipse(10, 15, 2, 4)                 // pupila izquierda
    cat.fillEllipse(22, 15, 2, 4)                 // pupila derecha

    // Capa 8: nariz — triangulito rosa
    cat.fillStyle(0xff9999)
    cat.fillTriangle(14, 19, 18, 19, 16, 22)

    cat.generateTexture('cat_placeholder', 32, 48)
    cat.destroy()
  }

  // ─── Crear plataformas ────────────────────────────────────────────────────

  private buildLevel() {
    const h = this.scale.height

    // Helper: crea una plataforma y la añade al grupo estático
    const platform = (x: number, y: number, tiles: number, color: number) => {
      const w = tiles * TILE_SIZE
      // staticGroup.create necesita una textura — usamos 'tile' con tint
      const p = this.platforms.create(x + w / 2, y + TILE_SIZE / 2, 'tile') as Phaser.Physics.Arcade.Image
      p.setDisplaySize(w, TILE_SIZE).setTint(color).refreshBody()
    }

    // ── Suelo completo ──────────────────────────────────────────────────────
    // Dos filas para dar sensación de grosor
    platform(0,        h - TILE_SIZE * 1, 125, 0x5d8a3c)   // capa verde (césped)
    platform(0,        h - TILE_SIZE * 2, 125, 0x7cba4a)   // capa más clara

    // ── Plataformas del nivel de prueba ─────────────────────────────────────
    // Distribuidas para testear: salto corto, salto largo, doble gap, altura máx.

    // Plataformas bajas (primer tramo)
    platform(160,  h - 128,  4, 0x8b6914)   // pequeña, accesible
    platform(380,  h - 160,  6, 0x8b6914)
    platform(640,  h - 96,   3, 0x8b6914)   // "trampolín" bajo

    // Zona media (gap + recuperación)
    platform(880,  h - 224,  5, 0x6b4f12)
    platform(1100, h - 192,  4, 0x6b4f12)
    platform(1280, h - 288,  3, 0x6b4f12)   // plataforma alta

    // Zona con escalones
    platform(1520, h - 128,  3, 0x8b6914)
    platform(1620, h - 192,  3, 0x8b6914)
    platform(1720, h - 256,  3, 0x8b6914)
    platform(1820, h - 320,  3, 0x8b6914)   // escalera ascendente

    // Zona de plataformas estrechas (requiere precisión)
    platform(2100, h - 256,  2, 0x4a3510)
    platform(2220, h - 288,  2, 0x4a3510)
    platform(2340, h - 256,  2, 0x4a3510)
    platform(2460, h - 320,  2, 0x4a3510)

    // Zona final — plataforma de descanso antes del borde del mundo
    platform(2700, h - 192,  8, 0x8b6914)
    platform(3000, h - 128, 12, 0x5d8a3c)   // suelo elevado con brecha
    platform(3400, h - 256,  5, 0x6b4f12)
    platform(3700, h - 192,  8, 0x5d8a3c)   // llegada final
  }

  // ─── create ───────────────────────────────────────────────────────────────

  create() {
    const { width, height } = this.scale

    this.createTextures()

    // Mundo con bounds para que el player no salga
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, height)

    // Fondo con parallax (bg.jpeg existente del proyecto)
    // scrollFactorX < 1 = se mueve más lento que la cámara → efecto de profundidad
    this.add.tileSprite(0, 0, LEVEL_WIDTH, height, 'background')
      .setOrigin(0, 0)
      .setScrollFactor(0.25, 1)
      .setDisplaySize(LEVEL_WIDTH, height)

    // Plataformas estáticas
    this.platforms = this.physics.add.staticGroup()
    this.buildLevel()

    // Player — empieza sobre el suelo izquierdo
    this.player = new Player(this, 80, height - 160)
    this.player.body.setCollideWorldBounds(true)

    // Colisión player ↔ plataformas
    this.physics.add.collider(this.player, this.platforms)

    // Cámara sigue al player, limitada al mundo
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, height)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setZoom(1)

    // ── HUD de debug ────────────────────────────────────────────────────────
    // Muestra velocidad y estado — útil para afinar la física en Phase 1.1
    // Se puede eliminar cuando la física esté tuneada
    this.debugText = this.add.text(12, 12, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 6, y: 4 },
    })
      .setScrollFactor(0) // fijo en pantalla, no sigue la cámara
      .setDepth(10)

    // ── Controles en pantalla ───────────────────────────────────────────────
    this.add.text(width / 2, 18, '← → / A D  mover  |  ↑ / Z / Espacio  saltar  |  Shift  correr', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.4)',
      padding: { x: 8, y: 4 },
    })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(10)
  }

  // ─── update ───────────────────────────────────────────────────────────────

  update(_time: number, delta: number) {
    this.player.update(delta)
    this.updateDebug()
  }

  private updateDebug() {
    const b = this.player.body
    const vx = Math.round(b.velocity.x)
    const vy = Math.round(b.velocity.y)
    const grounded = b.blocked.down ? 'suelo' : 'aire'
    this.debugText.setText(
      `vx: ${vx.toString().padStart(5)}  vy: ${vy.toString().padStart(5)}  estado: ${grounded}`
    )
  }
}

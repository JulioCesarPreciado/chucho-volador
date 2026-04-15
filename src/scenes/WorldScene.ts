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

  // ─── Crear texturas procedurales de nivel ────────────────────────────────
  // Solo queda el tile blanco base para las plataformas.
  // Los sprites del jugador vienen de player.png / waiting.png (cargados en BootScene).

  private createTextures() {
    if (this.textures.exists('tile')) return  // evita regenerar al reiniciar escena
    const gfx = this.add.graphics()
    gfx.fillStyle(0xffffff)
    gfx.fillRect(0, 0, TILE_SIZE, TILE_SIZE)
    gfx.generateTexture('tile', TILE_SIZE, TILE_SIZE)
    gfx.destroy()
  }

  // ─── Registrar animaciones ────────────────────────────────────────────────
  private createAnimations() {
    if (this.anims.exists('waiting')) return  // evita duplicados al reiniciar escena

    // waiting — 7 frames de 36x64, se activa tras 20 s sin moverse
    this.anims.create({
      key: 'waiting',
      frames: this.anims.generateFrameNumbers('waiting', { start: 0, end: 6 }),
      frameRate: 8,
      repeat: -1,
    })
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
    this.createAnimations()

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

import Phaser from 'phaser'

// Constantes idénticas al juego original
const BIRD_SIZE     = 60    // px — tamaño del sprite del pájaro
const BIRD_SPEED    = 500   // px/s — original: 0.5 px/ms = 500 px/s
const JUMP_DURATION = 125   // ms — misma duración de salto que el original
const PIPE_SPEED    = 500   // px/s — original: 0.5 px/ms = 500 px/s
const PIPE_INTERVAL = 1500  // ms — misma cadencia de tuberías
const PIPE_WIDTH    = 70    // px
const HOLE_HEIGHT   = 230   // px

// Tipo interno para cada par de tuberías
interface PipePair {
  top: Phaser.GameObjects.TileSprite
  bottom: Phaser.GameObjects.TileSprite
  scored: boolean
}

export class GameScene extends Phaser.Scene {
  private bird!: Phaser.GameObjects.Image
  private pipes: PipePair[] = []
  private pipeTimer!: Phaser.Time.TimerEvent
  private scoreText!: Phaser.GameObjects.Text
  private score = 0
  private timeSinceLastJump = Infinity
  private gameOver = false

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const { width, height } = this.scale

    // Estado inicial
    this.score = 0
    this.timeSinceLastJump = Infinity
    this.pipes = []
    this.gameOver = false

    // --- Fondo ---
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height)

    // --- Pájaro ---
    // Mismo X que el original: left = BIRD_SIZE (60px desde la izquierda)
    this.bird = this.add.image(BIRD_SIZE, height / 2, 'bird')
      .setDisplaySize(BIRD_SIZE, BIRD_SIZE)
      .setDepth(1)

    // --- Marcador (circle-button del original) ---
    const scoreBg = this.add.circle(width - 55, 55, 37, 0xc300ff).setDepth(2)
    this.scoreText = this.add.text(scoreBg.x, scoreBg.y, '0', {
      fontFamily: '"Righteous", serif',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(3)

    // --- Input: clic y barra espaciadora ---
    this.input.on('pointerdown', this.handleJump, this)
    this.input.keyboard?.on('keydown-SPACE', this.handleJump, this)

    // --- Spawner de tuberías ---
    // Primer spawn inmediato para que no haya espera inicial
    this.spawnPipe()
    this.pipeTimer = this.time.addEvent({
      delay: PIPE_INTERVAL,
      callback: this.spawnPipe,
      callbackScope: this,
      loop: true,
    })
  }

  // ─── Input ───────────────────────────────────────────────────────────────────

  private handleJump() {
    if (this.gameOver) return
    this.timeSinceLastJump = 0
  }

  // ─── Spawn de tuberías ────────────────────────────────────────────────────────

  private spawnPipe() {
    const { width, height } = this.scale

    // Posición aleatoria del hueco — misma lógica que pipe.js original
    const holeTop = Phaser.Math.Between(
      HOLE_HEIGHT * 1.5,
      height - HOLE_HEIGHT * 0.5
    )

    const topHeight    = holeTop - HOLE_HEIGHT / 2
    const bottomY      = holeTop + HOLE_HEIGHT / 2
    const bottomHeight = height - bottomY

    // TileSprite tilea la textura verticalmente sin distorsionarla
    const top = this.add.tileSprite(
      width + PIPE_WIDTH / 2,
      topHeight / 2,
      PIPE_WIDTH,
      topHeight,
      'pipe'
    ).setDepth(0)

    const bottom = this.add.tileSprite(
      width + PIPE_WIDTH / 2,
      bottomY + bottomHeight / 2,
      PIPE_WIDTH,
      bottomHeight,
      'pipe'
    ).setDepth(0)

    this.pipes.push({ top, bottom, scored: false })
  }

  // ─── Loop principal ───────────────────────────────────────────────────────────

  update(_time: number, delta: number) {
    if (this.gameOver) return

    const dt = delta / 1000 // convierte ms → segundos para cálculos en px/s

    // Movimiento del pájaro — velocidad constante igual/opuesta (como el original)
    // Durante JUMP_DURATION ms sube, después cae. Sin aceleración gravitacional.
    this.timeSinceLastJump += delta
    if (this.timeSinceLastJump < JUMP_DURATION) {
      this.bird.y -= BIRD_SPEED * dt
    } else {
      this.bird.y += BIRD_SPEED * dt
    }

    // Mover y gestionar tuberías
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i]

      pipe.top.x    -= PIPE_SPEED * dt
      pipe.bottom.x -= PIPE_SPEED * dt

      // Puntaje: el pájaro superó esta tubería
      if (!pipe.scored && pipe.top.x + PIPE_WIDTH / 2 < this.bird.x) {
        pipe.scored = true
        this.score++
        this.scoreText.setText(String(this.score))
      }

      // Eliminar tuberías que salieron de pantalla
      if (pipe.top.x + PIPE_WIDTH / 2 < 0) {
        pipe.top.destroy()
        pipe.bottom.destroy()
        this.pipes.splice(i, 1)
      }
    }

    // ─── Detección de colisiones (AABB manual — igual que el original) ───────

    const { height } = this.scale
    const birdBounds = this.bird.getBounds()

    // Fuera del mundo
    if (birdBounds.top < 0 || birdBounds.bottom > height) {
      this.handleLose()
      return
    }

    // Colisión con tuberías
    for (const pipe of this.pipes) {
      if (
        this.aabbOverlap(birdBounds, pipe.top.getBounds()) ||
        this.aabbOverlap(birdBounds, pipe.bottom.getBounds())
      ) {
        this.handleLose()
        return
      }
    }
  }

  // ─── Utilidades ───────────────────────────────────────────────────────────────

  private aabbOverlap(a: Phaser.Geom.Rectangle, b: Phaser.Geom.Rectangle): boolean {
    return (
      a.left   < b.right  &&
      a.right  > b.left   &&
      a.top    < b.bottom &&
      a.bottom > b.top
    )
  }

  private handleLose() {
    this.gameOver = true
    this.pipeTimer.remove()

    // Delay de 100ms antes de volver al menú — igual que el setTimeout original
    this.time.delayedCall(100, () => {
      this.scene.start('MenuScene', { score: this.score })
    })
  }

  // Limpieza de listeners al salir de la escena
  shutdown() {
    this.input.off('pointerdown', this.handleJump, this)
    this.input.keyboard?.off('keydown-SPACE', this.handleJump, this)
  }
}

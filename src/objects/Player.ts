import Phaser from 'phaser'

// ─── Constantes de física ─────────────────────────────────────────────────────
const GRAVITY_NORMAL    = 2000
const GRAVITY_JUMP_HOLD = 800
const GRAVITY_FALL_FAST = 4000

const WALK_SPEED   = 180
const RUN_SPEED    = 320
const ACCEL        = 900
const SKID_ACCEL   = 2000
const DRAG         = 1200

const JUMP_VELOCITY  = -680
const COYOTE_TIME    = 80
const JUMP_BUFFER    = 120

// 20 segundos sin moverse activa la animación de espera
const WAIT_THRESHOLD = 20_000

export class Player extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.Body

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private jumpKey: Phaser.Input.Keyboard.Key
  private runKey: Phaser.Input.Keyboard.Key
  private jumpKeyZ: Phaser.Input.Keyboard.Key

  private coyoteTimer = 0
  private jumpBuffer  = 0
  private jumpHeld    = false

  // ── Estado de animación ───────────────────────────────────────────────────
  // idleTimer acumula ms desde que el jugador dejó de moverse en el suelo.
  // isWaiting indica que la animación waiting.png está activa.
  private idleTimer  = 0
  private isWaiting  = false

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Textura inicial: player.png (frame único, sirve de base para todos los estados)
    super(scene, x, y, 'player')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Hitbox ajustada al sprite real de 36x64
    // Un poco más estrecha para que los saltos entre plataformas se sientan justos
    this.body.setSize(26, 58)
    this.body.setOffset(5, 4)

    this.body.setGravityY(GRAVITY_NORMAL)

    const kb = scene.input.keyboard!
    this.cursors  = kb.createCursorKeys()
    this.jumpKey  = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.jumpKeyZ = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    this.runKey   = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
  }

  update(delta: number) {
    this.handleHorizontal()
    this.handleJump(delta)
    this.handleGravity()
    this.updateAnimation(delta)
  }

  // ─── Animaciones ─────────────────────────────────────────────────────────────
  // Estados posibles:
  //   waiting  — sin moverse ≥ 20 s en el suelo → spritesheet waiting.png
  //   cualquier otro — player.png estático (hasta que existan los otros sprites)

  private updateAnimation(delta: number) {
    const onGround  = this.body.blocked.down
    const moving    = Math.abs(this.body.velocity.x) > 20
    const anyInput  = this.cursors.left.isDown   || this.cursors.right.isDown
                   || this.cursors.up.isDown      || this.jumpKey.isDown
                   || this.jumpKeyZ.isDown        || this.runKey.isDown

    // Si hay movimiento o input → salir del estado waiting y resetear timer
    if (moving || anyInput || !onGround) {
      this.idleTimer = 0

      if (this.isWaiting) {
        this.isWaiting = false
        this.anims.stop()
        this.setTexture('player')
      }
      return
    }

    // Jugador quieto en el suelo — acumular tiempo
    this.idleTimer += delta

    if (!this.isWaiting && this.idleTimer >= WAIT_THRESHOLD) {
      this.isWaiting = true
      this.play('waiting')
    }
  }

  // ─── Movimiento horizontal ────────────────────────────────────────────────

  private handleHorizontal() {
    const left  = this.cursors.left.isDown  || this.scene.input.keyboard!.addKey('A').isDown
    const right = this.cursors.right.isDown || this.scene.input.keyboard!.addKey('D').isDown
    const maxSpeed = this.runKey.isDown ? RUN_SPEED : WALK_SPEED

    this.body.setMaxVelocityX(maxSpeed)

    if (left) {
      const accel = this.body.velocity.x > 50 ? -SKID_ACCEL : -ACCEL
      this.body.setAccelerationX(accel)
      this.body.setDragX(0)
      this.setFlipX(true)

    } else if (right) {
      const accel = this.body.velocity.x < -50 ? SKID_ACCEL : ACCEL
      this.body.setAccelerationX(accel)
      this.body.setDragX(0)
      this.setFlipX(false)

    } else {
      this.body.setAccelerationX(0)
      this.body.setDragX(DRAG)
    }
  }

  // ─── Salto: variable + coyote time + jump buffer ──────────────────────────

  private handleJump(delta: number) {
    const onGround = this.body.blocked.down

    if (onGround) {
      this.coyoteTimer = COYOTE_TIME
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta)
    }

    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.jumpKey)
                     || Phaser.Input.Keyboard.JustDown(this.jumpKeyZ)
                     || Phaser.Input.Keyboard.JustDown(this.cursors.up)
    if (jumpPressed) {
      this.jumpBuffer = JUMP_BUFFER
    } else {
      this.jumpBuffer = Math.max(0, this.jumpBuffer - delta)
    }

    const canJump = onGround || this.coyoteTimer > 0
    if (this.jumpBuffer > 0 && canJump) {
      this.body.setVelocityY(JUMP_VELOCITY)
      this.coyoteTimer = 0
      this.jumpBuffer  = 0
      this.jumpHeld    = true
    }

    const jumpDown = this.jumpKey.isDown || this.jumpKeyZ.isDown || this.cursors.up.isDown
    if (!jumpDown && this.body.velocity.y < 0) {
      this.jumpHeld = false
    }
  }

  // ─── Gravedad dinámica ────────────────────────────────────────────────────

  private handleGravity() {
    const ascending = this.body.velocity.y < 0

    if (ascending && this.jumpHeld) {
      this.body.setGravityY(GRAVITY_JUMP_HOLD)
    } else if (!this.body.blocked.down) {
      this.body.setGravityY(GRAVITY_FALL_FAST)
    } else {
      this.body.setGravityY(GRAVITY_NORMAL)
    }
  }
}

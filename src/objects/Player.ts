import Phaser from 'phaser'

// ─── Constantes de física ─────────────────────────────────────────────────────
// Inspiradas en Super Mario Bros 3 NES: movimiento con peso e inercia,
// salto variable según duración del botón, caída rápida post-peak.

const GRAVITY_NORMAL    = 2000   // px/s² — gravedad en caída libre
const GRAVITY_JUMP_HOLD = 800    // px/s² — gravedad reducida mientras se sube con jump held
const GRAVITY_FALL_FAST = 4000   // px/s² — gravedad extra al soltar jump o post-peak

const WALK_SPEED   = 180  // px/s máximo caminando
const RUN_SPEED    = 320  // px/s máximo corriendo (Shift)
const ACCEL        = 900  // px/s² aceleración normal
const SKID_ACCEL   = 2000 // px/s² al cambiar de dirección (sensación de patinar)
const DRAG         = 1200 // px/s² desaceleración sin input

const JUMP_VELOCITY  = -680 // px/s — velocidad inicial de salto
const COYOTE_TIME    = 80   // ms — gracia para saltar después de caminar del borde
const JUMP_BUFFER    = 120  // ms — buffer para salto presionado antes de aterrizar

export class Player extends Phaser.GameObjects.Sprite {
  // Referencia tipada al body para no hacer cast en cada frame
  declare body: Phaser.Physics.Arcade.Body

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private jumpKey: Phaser.Input.Keyboard.Key
  private runKey: Phaser.Input.Keyboard.Key
  private jumpKeyZ: Phaser.Input.Keyboard.Key

  // Timers para coyote time y jump buffer
  private coyoteTimer   = 0
  private jumpBuffer    = 0

  // ¿Se está sosteniendo el botón de salto mientras sube?
  private jumpHeld = false

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'cat_placeholder')

    // Registra en la escena y añade physics body
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Hitbox ligeramente más pequeña que el sprite para colisiones justas
    this.body.setSize(28, 44)
    this.body.setOffset(2, 2)

    // El mundo NO tiene gravedad global (main.ts: gravity.y = 0)
    // Toda la gravedad se controla aquí por body.setGravityY
    this.body.setGravityY(GRAVITY_NORMAL)

    // Input
    const kb = scene.input.keyboard!
    this.cursors  = kb.createCursorKeys()
    this.jumpKey  = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.jumpKeyZ = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    this.runKey   = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
  }

  // Llamado manualmente desde WorldScene.update()
  update(delta: number) {
    this.handleHorizontal()
    this.handleJump(delta)
    this.handleGravity()
  }

  // ─── Movimiento horizontal ─────────────────────────────────────────────────

  private handleHorizontal() {
    const left  = this.cursors.left.isDown  || this.scene.input.keyboard!.addKey('A').isDown
    const right = this.cursors.right.isDown || this.scene.input.keyboard!.addKey('D').isDown
    const maxSpeed = this.runKey.isDown ? RUN_SPEED : WALK_SPEED

    this.body.setMaxVelocityX(maxSpeed)

    if (left) {
      // Cambio de dirección → patinada (skid)
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
      // Sin input: frena con drag
      this.body.setAccelerationX(0)
      this.body.setDragX(DRAG)
    }
  }

  // ─── Salto: variable + coyote time + jump buffer ───────────────────────────

  private handleJump(delta: number) {
    const onGround = this.body.blocked.down

    // Coyote time: empieza a contar al abandonar el suelo
    if (onGround) {
      this.coyoteTimer = COYOTE_TIME
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta)
    }

    // Jump buffer: guarda el input aunque se presione un poco antes de aterrizar
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.jumpKey)
                     || Phaser.Input.Keyboard.JustDown(this.jumpKeyZ)
                     || Phaser.Input.Keyboard.JustDown(this.cursors.up)
    if (jumpPressed) {
      this.jumpBuffer = JUMP_BUFFER
    } else {
      this.jumpBuffer = Math.max(0, this.jumpBuffer - delta)
    }

    // Ejecutar salto si hay buffer activo y el gato puede saltar
    const canJump = onGround || this.coyoteTimer > 0
    if (this.jumpBuffer > 0 && canJump) {
      this.body.setVelocityY(JUMP_VELOCITY)
      this.coyoteTimer = 0
      this.jumpBuffer  = 0
      this.jumpHeld    = true
    }

    // Soltar jump antes del peak → corta el salto (salto bajo vs alto)
    const jumpDown = this.jumpKey.isDown || this.jumpKeyZ.isDown || this.cursors.up.isDown
    if (!jumpDown && this.body.velocity.y < 0) {
      this.jumpHeld = false
    }
  }

  // ─── Gravedad dinámica ────────────────────────────────────────────────────
  // Tres estados: subiendo con jump held (suave), neutro en suelo, cayendo (rápido)

  private handleGravity() {
    const ascending = this.body.velocity.y < 0

    if (ascending && this.jumpHeld) {
      // Subiendo con botón presionado: gravedad reducida → salto alto
      this.body.setGravityY(GRAVITY_JUMP_HOLD)
    } else if (!this.body.blocked.down) {
      // Cayendo o jump soltado: gravedad extra → caída rápida tipo NES
      this.body.setGravityY(GRAVITY_FALL_FAST)
    } else {
      // En suelo: gravedad base (para que body.blocked.down se active correctamente)
      this.body.setGravityY(GRAVITY_NORMAL)
    }
  }
}

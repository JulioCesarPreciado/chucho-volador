import Phaser from 'phaser'

// Carga todos los assets antes de arrancar el juego.
// publicDir en vite.config apunta a /resource, así que:
//   resource/img/bg.jpeg   → /img/bg.jpeg
//   resource/img/bird.jpeg → /img/bird.jpeg
//   resource/img/pipe.jpeg → /img/pipe.jpeg
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.load.image('background', '/img/bg.png')
    this.load.image('bird', '/img/bird.jpeg')
    this.load.image('pipe', '/img/pipe.jpeg')

    // Sprites del jugador
    // player.png  — frame único para idle/run/jump/fall (hasta que existan esos sprites)
    // waiting.png — 7 frames de 36x64 para la animación de espera (20 s sin moverse)
    this.load.image('player', '/img/player.png')
    this.load.spritesheet('waiting', '/img/waiting.png', {
      frameWidth:  36,
      frameHeight: 64,
    })
  }

  create() {
    this.scene.start('MenuScene', { score: 0 })
  }
}

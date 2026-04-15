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
    this.load.image('background', '/img/bg.jpeg')
    this.load.image('bird', '/img/bird.jpeg')
    this.load.image('pipe', '/img/pipe.jpeg')
    this.load.audio('music', 'https://pgm-apps.com/julio/js/games/flappy_bird/resource/sound/game_theme.mp3')
  }

  create() {
    this.scene.start('MenuScene', { score: 0 })
  }
}

import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { MenuScene } from './scenes/MenuScene'
import { GameScene } from './scenes/GameScene'
import { WorldScene } from './scenes/WorldScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#74b9ff',
  // Soporte para elementos DOM (input de username)
  dom: {
    createContainer: true,
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
  },
  // Gravedad global en 0 — cada escena la controla por su cuenta:
  //   GameScene: velocidad constante manual (Flappy Bird)
  //   WorldScene: gravedad por body del player (platformer SMB3)
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, WorldScene],
}

new Phaser.Game(config)

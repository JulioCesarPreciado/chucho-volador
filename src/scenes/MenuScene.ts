import Phaser from 'phaser'

// Maneja dos estados:
//  1. Sin username en localStorage → muestra formulario de login (igual que el index.html original)
//  2. Con username → muestra título + puntuación anterior + botón de jugar
export class MenuScene extends Phaser.Scene {
  private lastScore = 0

  constructor() {
    super({ key: 'MenuScene' })
  }

  init(data: { score?: number }) {
    this.lastScore = data.score ?? 0
  }

  create() {
    const { width, height } = this.scale
    const username = localStorage.getItem('username')

    // Fondo
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height)

    if (!username) {
      this.showLoginForm(width, height)
    } else {
      this.showMenu(width, height, username)
    }
  }

  private showLoginForm(width: number, height: number) {
    // Título animado — mismo estilo que el h1 original
    this.add.text(width / 2, height * 0.28, 'Chucho Volador', {
      fontFamily: '"Raleway", sans-serif',
      fontSize: '64px',
      color: '#3b2774',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#0c2ffb', blur: 0, fill: true },
    }).setOrigin(0.5)

    this.add.text(width / 2, height * 0.44, 'Ingresa un nombre', {
      fontFamily: '"Righteous", serif',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#333',
      strokeThickness: 2,
    }).setOrigin(0.5)

    // Input HTML sobre el canvas via DOM element de Phaser
    const domInput = this.add.dom(width / 2, height * 0.53).createFromHTML(`
      <input
        id="username-input"
        type="text"
        placeholder="Escribe un nombre"
        maxlength="20"
        style="
          font-family: sans-serif;
          font-size: 17px;
          color: #fff;
          padding: 10px 14px;
          border-radius: 6px;
          border: none;
          background: rgba(3,3,3,0.35);
          width: 280px;
          outline: none;
          display: block;
        "
      />
    `)

    const button = this.add.text(width / 2, height * 0.64, 'REGISTRATE', {
      fontFamily: '"Righteous", serif',
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#7d07cc',
      padding: { x: 24, y: 14 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#cf2bd5' }))
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#7d07cc' }))

    const handleLogin = () => {
      const input = domInput.getChildByID('username-input') as HTMLInputElement
      const value = input?.value?.trim()
      if (!value) return
      localStorage.setItem('username', value)
      // Destruye el DOM element antes de cambiar de escena
      domInput.destroy()
      this.scene.restart({ score: 0 })
    }

    button.on('pointerdown', handleLogin)

    // También permite Enter en el input
    domInput.addListener('keydown')
    domInput.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') handleLogin()
    })
  }

  private showMenu(width: number, height: number, username: string) {
    // Título
    this.add.text(width / 2, height * 0.28, 'Chucho Volador', {
      fontFamily: '"Raleway", sans-serif',
      fontSize: '64px',
      color: '#3b2774',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#0c2ffb', blur: 0, fill: true },
    }).setOrigin(0.5)

    // Puntuación anterior (solo si jugó al menos una vez)
    if (this.lastScore > 0) {
      this.add.text(
        width / 2,
        height * 0.50,
        `${username} has realizado ${this.lastScore} Puntos`,
        {
          fontFamily: '"Righteous", serif',
          fontSize: '26px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3,
        }
      ).setOrigin(0.5)
    }

    // Botón de jugar
    const button = this.add.text(width / 2, height * 0.62, 'PRESIONA PARA JUGAR', {
      fontFamily: '"Righteous", serif',
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#7d07cc',
      padding: { x: 24, y: 14 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#cf2bd5' }))
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#7d07cc' }))
    button.on('pointerdown', () => this.scene.start('GameScene'))
  }
}

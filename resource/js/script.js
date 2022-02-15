import { updateBird, setupBird, getBirdRect } from "./bird.js"
import {
  updatePipes,
  setupPipes,
  getPassedPipesCount,
  getPipeRects,
} from "./pipe.js"

document.querySelector("[submit-play]").addEventListener('click', handleStart, { once: true });
const title = document.querySelector("[data-title]")
const navbar = document.querySelector("[data-navbar]")
const subtitle = document.querySelector("[data-subtitle]")
const points = document.querySelector("[data-points]")
const gameMusic = new Audio('https://pgm-apps.com/julio/js/games/flappy_bird/resource/sound/game_theme.mp3')
const username = localStorage['username'] || 'defaultValue';

let lastTime
function updateLoop(time) {
  if (lastTime == null) {
    lastTime = time
    window.requestAnimationFrame(updateLoop)
    return
  }
  const delta = time - lastTime
  updateBird(delta)
  updatePipes(delta)
  if (checkLose()) return handleLose()
  lastTime = time
  window.requestAnimationFrame(updateLoop)
}

function checkLose() {
  const birdRect = getBirdRect()
  const insidePipe = getPipeRects().some(rect => isCollision(birdRect, rect))
  const outsideWorld = birdRect.top < 0 || birdRect.bottom > window.innerHeight
  return outsideWorld || insidePipe
}

function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  )
}

function handleStart() {
  gameMusic.play()
  points.textContent = 0
  title.classList.add("hide")
  navbar.classList.remove("hide")
  setupBird()
  setupPipes()
  lastTime = null
  window.requestAnimationFrame(updateLoop)
}

function handleLose() {
  setTimeout(() => {
    gameMusic.pause();
    gameMusic.currentTime = 0;
    navbar.classList.add("hide")
    title.classList.remove("hide")
    subtitle.classList.remove("hide")
    subtitle.textContent = `${username} has realizado ${getPassedPipesCount()} Puntos`
    document.querySelector("[submit-play]").addEventListener('click', handleStart, { once: true });
  }, 100)
}
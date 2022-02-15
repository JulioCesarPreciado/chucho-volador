const birdElem = document.querySelector("[data-bird]")
const BIRD_SPEED = 0.5
const JUMP_DURATION = 125
let timeSinceLastJump = Number.POSITIVE_INFINITY

export function setupBird() {
  setTop(window.innerHeight / 2)
  document.removeEventListener("click", handleJump)
  document.addEventListener("click", handleJump)
}

export function updateBird(delta) {
  if (timeSinceLastJump < JUMP_DURATION) {
    setTop(getTop() - BIRD_SPEED * delta)
  } else {
    setTop(getTop() + BIRD_SPEED * delta)
  }

  timeSinceLastJump += delta
}

export function getBirdRect() {
  return birdElem.getBoundingClientRect()
}

function setTop(top) {
  birdElem.style.setProperty("--bird-top", top)
}

function getTop() {
  return parseFloat(getComputedStyle(birdElem).getPropertyValue("--bird-top"))
}

function handleJump(e) {
  timeSinceLastJump = 0
}
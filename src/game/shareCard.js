// Draws a shareable result image with the browser's Canvas API.
// Returns a Promise that resolves to a PNG Blob.

const W = 1200
const H = 630

// Load an image so it can be drawn on the canvas. crossOrigin='anonymous'
// is needed, otherwise the browser would block exporting the canvas.
// If the image can't be loaded (or takes too long), resolve with null.
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const timer = setTimeout(() => resolve(null), 3000)
    img.onload = () => { clearTimeout(timer); resolve(img) }
    img.onerror = () => { clearTimeout(timer); resolve(null) }
    img.src = src
  })
}

// Shrink long names so they fit in maxWidth.
function fitText(ctx, text, maxWidth, size, font) {
  let s = size
  do {
    ctx.font = `${s}px ${font}`
    s -= 2
  } while (ctx.measureText(text).width > maxWidth && s > 12)
}

// Draw a fighter "portrait": the product photo if we have one, else its emoji.
function drawPortrait(ctx, img, emoji, x, y, size, color) {
  ctx.save()
  ctx.fillStyle = img ? '#ffffff' : 'rgba(255,255,255,.12)'
  ctx.strokeStyle = color
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.roundRect(x, y, size, size, 28)
  ctx.fill()
  ctx.stroke()
  if (img) {
    const scale = Math.min((size - 40) / img.width, (size - 40) / img.height)
    const w = img.width * scale
    const h = img.height * scale
    ctx.drawImage(img, x + (size - w) / 2, y + (size - h) / 2, w, h)
  } else {
    ctx.font = `${size * 0.6}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(emoji ?? '🍪', x + size / 2, y + size / 2 + 8)
  }
  ctx.restore()
}

export async function createShareImage({ winner, loser, finisherName, turns, hpLeft }) {
  // Make sure the pixel font is ready, otherwise the canvas uses a fallback.
  try { await document.fonts.load('40px "Press Start 2P"') } catch { /* ignore */ }
  const arcade = '"Press Start 2P", monospace'

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#3a1450')
  bg.addColorStop(1, '#12091f')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#ffd23f'
  ctx.fillRect(0, 0, W, 14)
  ctx.fillRect(0, H - 14, W, 14)

  // Title
  ctx.fillStyle = '#ffd23f'
  ctx.font = `34px ${arcade}`
  ctx.textAlign = 'center'
  ctx.fillText('SNACK FIGHTER', W / 2, 80)

  // Portraits
  const [winImg, loseImg] = await Promise.all([loadImage(winner.image), loadImage(loser.image)])
  drawPortrait(ctx, winImg, winner.emoji, 110, 150, 300, '#ffd23f')
  ctx.globalAlpha = 0.55
  drawPortrait(ctx, loseImg, loser.emoji, W - 410, 150, 300, '#888888')
  ctx.globalAlpha = 1

  // "K.O." between them
  ctx.fillStyle = '#ff2a2a'
  ctx.font = `64px ${arcade}`
  ctx.textAlign = 'center'
  ctx.fillText(finisherName ? '💀' : 'K.O.', W / 2, 330)

  // Names
  ctx.fillStyle = '#ffffff'
  fitText(ctx, winner.name, 380, 26, arcade)
  ctx.fillText(winner.name, 260, 510)
  ctx.fillStyle = '#aaaaaa'
  fitText(ctx, loser.name, 380, 20, arcade)
  ctx.fillText(loser.name, W - 260, 510)

  // Result line
  ctx.fillStyle = '#ffd23f'
  const line = finisherName
    ? `${finisherName} – SNACKALITY!`
    : `WON IN ${turns} TURNS · ${hpLeft} HP LEFT`
  fitText(ctx, line, W - 120, 26, arcade)
  ctx.fillText(line, W / 2, 585)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create image'))), 'image/png')
  })
}

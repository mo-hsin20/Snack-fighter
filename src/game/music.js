// A tiny chiptune music player built on the Web Audio API.
// The melody below is original, written for this game: four bars in
// A minor (chords Am – F – C – G), played in a loop.
//
// How it works: a timer runs every 25 ms and schedules the notes that
// should start in the next 0.15 s. Scheduling a little ahead keeps the
// rhythm steady even if the browser is busy for a moment.

const BPM = 140
const STEP = 60 / BPM / 2 // one step = an eighth note, in seconds

// MIDI note numbers (69 = A4). null = rest.
const LEAD = [
  69, 72, 76, 81, 79, 76, 72, 74, // Am
  65, 69, 72, 77, 76, 72, 69, 71, // F
  64, 67, 72, 76, 74, 72, 67, 69, // C
  67, 71, 74, 79, 77, 74, 71, 74, // G
]
const BASS = [
  45, null, 45, 57, 45, null, 45, 57,
  41, null, 41, 53, 41, null, 41, 53,
  48, null, 48, 60, 48, null, 48, 60,
  43, null, 43, 55, 43, null, 43, 55,
]

const midiToHz = (note) => 440 * 2 ** ((note - 69) / 12)

let ctx = null
let master = null
let timer = null
let nextTime = 0
let step = 0
let volume = 0.4

function playNote(note, time, type, gainValue, length) {
  if (note === null) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = midiToHz(note)
  gain.gain.setValueAtTime(gainValue, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + length)
  osc.connect(gain).connect(master)
  osc.start(time)
  osc.stop(time + length)
}

function schedule() {
  while (nextTime < ctx.currentTime + 0.15) {
    playNote(LEAD[step], nextTime, 'square', 0.05, STEP * 0.9)
    playNote(BASS[step], nextTime, 'triangle', 0.12, STEP * 0.95)
    nextTime += STEP
    step = (step + 1) % LEAD.length
  }
}

export function startMusic() {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)()
    if (!master) {
      master = ctx.createGain()
      master.connect(ctx.destination)
    }
    master.gain.value = volume
    ctx.resume()
    if (timer) return // already playing
    nextTime = ctx.currentTime + 0.05
    step = 0
    timer = setInterval(schedule, 25)
  } catch {
    // No Web Audio support – the game simply has no music.
  }
}

export function stopMusic() {
  clearInterval(timer)
  timer = null
}

export function setVolume(value) {
  volume = value
  if (master) master.gain.value = value
}

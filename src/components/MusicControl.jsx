import { useEffect, useState } from 'react'
import { startMusic, stopMusic, setVolume } from '../game/music.js'
import { getMusicOn, setMusicOn, getMusicVolume, setMusicVolume } from '../game/settings.js'

// Music on/off button + volume slider for the navigation bar.
// Browsers only allow sound after the user has clicked something, so if
// music was left on last time, it starts at the first click on the page.
export default function MusicControl() {
  const [on, setOn] = useState(getMusicOn)
  const [volume, setVolumeState] = useState(getMusicVolume)

  useEffect(() => {
    setVolume(volume)
    if (!on) {
      stopMusic()
      return
    }
    const begin = () => startMusic()
    window.addEventListener('pointerdown', begin, { once: true })
    window.addEventListener('keydown', begin, { once: true })
    return () => {
      window.removeEventListener('pointerdown', begin)
      window.removeEventListener('keydown', begin)
    }
  }, [on, volume])

  function toggle() {
    const next = !on
    setOn(next)
    setMusicOn(next)
    if (next) startMusic()
    else stopMusic()
  }

  function changeVolume(e) {
    const value = Number(e.target.value)
    setVolumeState(value)
    setMusicVolume(value)
  }

  return (
    <div className="music-control">
      <button type="button" className="btn btn-sm btn-outline-light" onClick={toggle} aria-pressed={on}>
        {on ? '🎵 Music on' : '🔇 Music off'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={changeVolume}
        aria-label="Music volume"
        disabled={!on}
        className="form-range music-volume"
      />
    </div>
  )
}

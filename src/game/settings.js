// Small player preferences saved in localStorage.

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value === null ? fallback : JSON.parse(value)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage blocked */ }
}

// 'play' = you choose P1's moves, 'watch' = both fighters fight on their own
export const getControl = () => read('sf-control', 'play')
export const setControl = (value) => write('sf-control', value)

// The two fighters picked on the selection screen, so a page refresh keeps them.
export const getSavedFighters = () => read('sf-fighters', { left: null, right: null })
export const saveFighters = (fighters) => write('sf-fighters', fighters)

// Background music
export const getMusicOn = () => read('sf-music', false)
export const setMusicOn = (value) => write('sf-music', value)
export const getMusicVolume = () => read('sf-music-volume', 0.4)
export const setMusicVolume = (value) => write('sf-music-volume', value)

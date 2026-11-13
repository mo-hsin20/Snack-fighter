import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ARROWS, randomCombo } from '../game/finishers.js'
import { sfx } from '../game/sfx.js'

const TIME_LIMIT = 6000 // ms to enter the combo

// "FINISH THEM!" – shows a combo of arrow keys. Enter it in time with the
// keyboard or by tapping the arrow buttons. Calls onSuccess or onFail.
export default function FinishPrompt({ winnerName, onSuccess, onFail }) {
  // useState(() => ...) runs randomCombo only once, on the first render.
  const [combo] = useState(() => randomCombo(4))
  const [progress, setProgress] = useState(0) // how many keys are correct so far
  const [failed, setFailed] = useState(false)

  function press(key) {
    if (failed) return
    if (key === combo[progress]) {
      sfx.select()
      if (progress + 1 === combo.length) onSuccess()
      else setProgress(progress + 1)
    } else {
      sfx.wrong()
      setFailed(true)
      setTimeout(onFail, 500)
    }
  }

  // Keyboard input
  useEffect(() => {
    function onKey(e) {
      if (ARROWS[e.key]) {
        e.preventDefault()
        press(e.key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Time limit
  useEffect(() => {
    const t = setTimeout(onFail, TIME_LIMIT)
    return () => clearTimeout(t)
  }, [onFail])

  return (
    <div className="finish-overlay" role="dialog" aria-label="Finishing move">
      <motion.div
        className="finish-title"
        initial={{ scale: 4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
      >
        FINISH THEM!
      </motion.div>
      <p className="finish-hint">Enter the combo to unleash {winnerName}’s finishing move</p>

      <div className="combo" aria-live="polite">
        {combo.map((key, i) => (
          <span key={i} className={`combo-key ${i < progress ? 'done' : ''} ${failed && i === progress ? 'wrong' : ''}`}>
            {ARROWS[key]}
          </span>
        ))}
      </div>

      <div className="finish-timer">
        <motion.div
          className="finish-timer-fill"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: TIME_LIMIT / 1000, ease: 'linear' }}
        />
      </div>

      {/* Touch controls – arranged like a game pad */}
      <div className="dpad">
        {['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].map((key) => (
          <button key={key} type="button" className={`dpad-btn dpad-${key}`} onClick={() => press(key)} aria-label={key.replace('Arrow', '')}>
            {ARROWS[key]}
          </button>
        ))}
      </div>
    </div>
  )
}

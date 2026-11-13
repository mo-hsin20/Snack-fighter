import { useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { sfx } from '../game/sfx.js'

// Food emojis that float in the background. Positions are fixed numbers
// (not random) so they stay in the same place on every render.
const FLOATERS = [
  { e: '🍫', x: 8, d: 0 }, { e: '🥨', x: 22, d: 2.5 }, { e: '🍬', x: 38, d: 1.2 },
  { e: '🥕', x: 55, d: 3.4 }, { e: '🍪', x: 70, d: 0.6 }, { e: '🥜', x: 84, d: 2 },
  { e: '🍩', x: 93, d: 4 }, { e: '🍎', x: 47, d: 5 },
]

// Screen 1: arcade-style title screen. Press Enter / Space / tap to start.
export default function Intro() {
  const navigate = useNavigate()

  const start = useCallback(() => {
    sfx.start()
    navigate('/select')
  }, [navigate])

  // Listen for Enter or Space anywhere on the page, like a real arcade game.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        start()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey) // cleanup
  }, [start])

  return (
    <div className="intro" onClick={start}>
      <div className="intro-rays" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />

      {FLOATERS.map((f, i) => (
        <span key={i} className="floater" style={{ left: `${f.x}%`, animationDelay: `${f.d}s` }} aria-hidden="true">
          {f.e}
        </span>
      ))}

      <div className="intro-content">
        {/* The two words slam in from opposite sides, then a white flash */}
        <h1 className="intro-logo">
          <motion.span
            className="logo-word logo-red"
            initial={{ x: '-120vw', skewX: -20 }}
            animate={{ x: 0, skewX: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.3 }}
          >
            SNACK
          </motion.span>
          <motion.span
            className="logo-word logo-blue"
            initial={{ x: '120vw', skewX: 20 }}
            animate={{ x: 0, skewX: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.6 }}
          >
            FIGHTER
          </motion.span>
        </h1>

        <motion.div
          className="intro-flash"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0] }}
          transition={{ duration: 0.5, delay: 0.95 }}
        />

        <motion.p
          className="intro-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          Real snacks. Real nutrition data. One winner.
        </motion.p>

        <motion.button
          type="button"
          className="press-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          onClick={(e) => { e.stopPropagation(); start() }}
        >
          PRESS START
        </motion.button>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }} className="mb-4">
          <Link to="/snackverse" className="portal-link" onClick={(e) => e.stopPropagation()}>
            <span className="portal-swirl" aria-hidden="true">🌀</span> Story mode: enter the Snackverse
          </Link>
          <div className="intro-modes mt-3">
            <Link to="/daily" onClick={(e) => e.stopPropagation()}>📅 Daily challenge</Link>
            <Link to="/tournament" onClick={(e) => e.stopPropagation()}>🏆 Tournament</Link>
            <Link to="/hall-of-fame" onClick={(e) => e.stopPropagation()}>👑 Hall of Fame</Link>
          </div>
        </motion.div>

        <motion.ul
          className="intro-rules"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
        >
          <li>❤️ Nutri-Score = health</li>
          <li>🧂 Sugar, salt &amp; fat = heavy hits that hurt the attacker too</li>
          <li>💪 Protein &amp; fiber = clean hits</li>
          <li>🛡️ Good Eco-Score = shield</li>
        </motion.ul>
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { motion } from 'motion/react'
import { sfx } from '../game/sfx.js'

const DURATION = 2300 // ms

// Tekken-style "VS" screen shown before the first round: the two
// fighters slide in from opposite sides and a big VS slams down.
// Click/tap to skip.
export default function VsSplash({ left, right, title, onDone }) {
  useEffect(() => {
    const slam = setTimeout(sfx.hit, 550)
    const done = setTimeout(onDone, DURATION)
    return () => { clearTimeout(slam); clearTimeout(done) }
  }, [onDone])

  return (
    <motion.div
      className="vs-splash"
      onClick={onDone}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="presentation"
    >
      {title && <div className="vs-title arcade-label">{title}</div>}
      {[['left', left, -1], ['right', right, 1]].map(([side, snack, dir]) => (
        <motion.div
          key={side}
          className={`vs-half vs-${side}`}
          initial={{ x: `${dir * 100}%` }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          <div className="vs-portrait">
            {snack.image
              ? <img src={snack.image} alt="" />
              : <span aria-hidden="true">{snack.emoji ?? '🍪'}</span>}
          </div>
          <div className="vs-name">{snack.name}</div>
        </motion.div>
      ))}
      <motion.div
        className="vs-big"
        initial={{ scale: 4, opacity: 0, rotate: -20 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 0.45, type: 'spring', stiffness: 400, damping: 14 }}
        aria-hidden="true"
      >
        VS
      </motion.div>
      <span className="visually-hidden">{left.name} versus {right.name}</span>
    </motion.div>
  )
}

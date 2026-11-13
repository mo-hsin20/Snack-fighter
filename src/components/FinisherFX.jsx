import { useMemo } from 'react'
import { motion } from 'motion/react'

// Particle effects for a finishing move, drawn over the losing fighter.
// `pattern` decides how the particles move:
//   rain  – fall from the sky      burst – explode outwards
//   rise  – float up like flames   slam  – one giant emoji drops down
//   whirl – spin around the loser
export default function FinisherFX({ finisher, side }) {
  const centerX = side === 'left' ? 25 : 75 // % of the arena width

  // Create the particles once per finisher. useMemo keeps the random
  // values stable, so they don't jump around on every re-render.
  const particles = useMemo(() => {
    const count = finisher.pattern === 'slam' ? 1 : 26
    return Array.from({ length: count }, (_, i) => {
      const emoji = finisher.particles[i % finisher.particles.length]
      const angle = Math.random() * Math.PI * 2
      const spread = 80 + Math.random() * 160
      const delay = Math.random() * 0.8
      switch (finisher.pattern) {
        case 'rain':
          return { emoji, initial: { left: `${centerX + (Math.random() - 0.5) * 30}%`, top: '-10%' }, animate: { top: '70%', rotate: 360 }, transition: { duration: 0.9, delay, ease: 'easeIn' } }
        case 'rise':
          return { emoji, initial: { left: `${centerX + (Math.random() - 0.5) * 22}%`, top: '80%', scale: 0.5, opacity: 1 }, animate: { top: '15%', scale: 1.6, opacity: 0 }, transition: { duration: 1.4, delay, repeat: 1 } }
        case 'slam':
          return { emoji, big: true, initial: { left: `${centerX - 8}%`, top: '-60%', scale: 3 }, animate: { top: '20%', scale: 3 }, transition: { duration: 0.35, delay: 0.9, ease: 'easeIn' } }
        case 'whirl':
          return { emoji, initial: { left: `${centerX}%`, top: '45%', x: 0, y: 0 }, animate: { x: [0, Math.cos(angle) * 90, Math.cos(angle + 3) * 140], y: [0, Math.sin(angle) * 60, Math.sin(angle + 3) * 90], opacity: [1, 1, 0] }, transition: { duration: 1.4, delay: delay / 2 } }
        default: // burst
          return { emoji, initial: { left: `${centerX}%`, top: '45%', x: 0, y: 0, opacity: 1 }, animate: { x: Math.cos(angle) * spread, y: Math.sin(angle) * spread, rotate: 540, opacity: 0 }, transition: { duration: 1.2, delay: 1 + delay / 4, ease: 'easeOut' } }
      }
    })
  }, [finisher, centerX])

  return (
    <div className="finisher-fx" aria-hidden="true">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className={`fx-particle ${p.big ? 'fx-big' : ''}`}
          initial={p.initial}
          animate={p.animate}
          transition={p.transition}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  )
}

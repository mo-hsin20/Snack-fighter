import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

// Reveals text one letter at a time, like story text in a fighting game.
// Clicking the text shows it all at once.
export default function Typewriter({ text, speed = 22, className = '' }) {
  const reduceMotion = useReducedMotion()
  const [count, setCount] = useState(0)

  // Start again from zero whenever the text changes.
  useEffect(() => { setCount(0) }, [text])

  useEffect(() => {
    if (reduceMotion || count >= text.length) return
    const t = setTimeout(() => setCount((c) => c + 1), speed)
    return () => clearTimeout(t)
  }, [count, text, speed, reduceMotion])

  const shown = reduceMotion ? text : text.slice(0, count)

  return (
    <p className={`typewriter ${className}`} onClick={() => setCount(text.length)}>
      {shown}
      {/* Screen readers get the full text right away */}
      <span className="visually-hidden">{text.slice(shown.length)}</span>
    </p>
  )
}

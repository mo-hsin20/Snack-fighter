import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Container, Button, Alert } from 'react-bootstrap'
import { motion } from 'motion/react'
import { CHARACTERS, BOSS, findCharacter } from '../data/snackverse.js'
import { loadProgress, markCleared } from '../game/progress.js'
import Arena from '../components/Arena.jsx'
import Typewriter from '../components/Typewriter.jsx'
import ControlToggle from '../components/ControlToggle.jsx'
import { getControl } from '../game/settings.js'

// Pick `n` random items from a list (Fisher–Yates shuffle, then slice).
function pickRandom(list, n) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

// The four opponents of one story run, Tekken-style:
// two random fighters -> your rival -> the final boss.
function buildLadder(hero) {
  if (hero.boss) {
    return pickRandom(CHARACTERS, 4) // the boss fights four heroes
  }
  const rival = findCharacter(hero.rival)
  const others = CHARACTERS.filter((c) => c.id !== hero.id && c.id !== rival.id)
  return [...pickRandom(others, 2), rival, BOSS]
}

// What each fighter says before the fight. Rivals get special lines.
function quotesFor(hero, opponent) {
  return {
    left: opponent.id === hero.rival ? hero.rivalLine : hero.taunt,
    right: opponent.rival === hero.id ? opponent.rivalLine : opponent.taunt,
  }
}

// Screen 6: one character's story run.
// screen: 'prologue' -> 'ladder' -> 'fight' -> (next stage …) -> 'ending'
export default function Story() {
  const { id } = useParams()
  const navigate = useNavigate()
  const hero = findCharacter(id)

  const [ladder] = useState(() => (hero ? buildLadder(hero) : []))
  const [stage, setStage] = useState(0)        // index into the ladder
  const [screen, setScreen] = useState('prologue')
  const [control, setControlState] = useState(getControl)

  if (!hero) {
    return <Container><Alert variant="warning">This fighter doesn’t exist in any reality. <Link to="/snackverse">Back</Link></Alert></Container>
  }
  if (hero.boss && loadProgress().cleared.length === 0) {
    return <Container><Alert variant="dark">🔒 This fighter is still locked. Clear any story first. <Link to="/snackverse">Back</Link></Alert></Container>
  }

  const opponent = ladder[stage]
  const isFinal = stage === ladder.length - 1

  function winStage() {
    if (isFinal) {
      markCleared(hero.id)
      setScreen('ending')
    } else {
      setStage(stage + 1)
      setScreen('ladder')
    }
  }

  // ----- Fight -----
  if (screen === 'fight') {
    return (
      <Arena
        key={stage} // a new Arena for every stage, so its state starts fresh
        left={hero}
        right={opponent}
        quotes={quotesFor(hero, opponent)}
        playerSide="left"
        control={control}
        mode="story"
        title={isFinal ? 'FINAL STAGE' : `STAGE ${stage + 1}`}
        renderResult={({ winner, rematch }) =>
          winner === 'left' ? (
            <>
              <p className="fst-italic">“{hero.win}”</p>
              <Button className="fight-btn" onClick={winStage}>{isFinal ? 'SEE ENDING' : 'NEXT STAGE'}</Button>
            </>
          ) : (
            <>
              <p className="fst-italic">“{opponent.win}”</p>
              <div className="d-flex justify-content-center gap-2">
                <Button className="fight-btn" onClick={rematch}>CONTINUE?</Button>
                <Button variant="outline-light" onClick={() => navigate('/snackverse')}>Give up</Button>
              </div>
            </>
          )
        }
      />
    )
  }

  return (
    <div className="story-page" style={{ '--char-color': hero.color, '--arena-tint': hero.arena }}>
      <Container className="py-4">
        <Link to="/snackverse" className="small">← The Snackverse</Link>

        <div className="story-hero text-center my-4">
          <motion.div className="story-emoji" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} aria-hidden="true">
            {hero.emoji}
          </motion.div>
          <h1 className="arcade-title story-name">{hero.name}</h1>
          <div className="char-title">{hero.title} · {hero.reality}</div>
        </div>

        {/* ----- Prologue ----- */}
        {screen === 'prologue' && (
          <section className="story-box">
            <h2 className="arcade-label mb-3">PROLOGUE</h2>
            <Typewriter text={hero.prologue} />
            <div className="text-center">
              <Button className="fight-btn" onClick={() => setScreen('ladder')}>BEGIN</Button>
            </div>
          </section>
        )}

        {/* ----- Ladder (the tower of opponents) ----- */}
        {screen === 'ladder' && (
          <section className="story-box">
            <h2 className="arcade-label mb-3 text-center">STAGE {stage + 1} / {ladder.length}</h2>
            <ol className="ladder" reversed>
              {[...ladder].reverse().map((opp, i) => {
                const index = ladder.length - 1 - i
                const state = index < stage ? 'beaten' : index === stage ? 'current' : 'upcoming'
                const hidden = state === 'upcoming' && index === ladder.length - 1
                return (
                  <li key={opp.id + index} className={`ladder-step ${state}`}>
                    <span className="ladder-emoji" aria-hidden="true">{hidden ? '❓' : opp.emoji}</span>
                    <span>{hidden ? '???' : opp.name}</span>
                    {state === 'beaten' && <span className="ms-auto">✓</span>}
                    {opp.id === hero.rival && !hidden && <span className="ms-auto rival-tag">RIVAL</span>}
                  </li>
                )
              })}
            </ol>
            <div className="text-center mt-3">
              <p className="mb-1">Next: <strong>{opponent.name}</strong> from {opponent.reality}</p>
              <p className="small text-body-secondary">{opponent.title}</p>
              <div className="mb-3"><ControlToggle id="story-control" onChange={setControlState} /></div>
              <Button className="fight-btn" onClick={() => setScreen('fight')}>FIGHT!</Button>
            </div>
          </section>
        )}

        {/* ----- Ending ----- */}
        {screen === 'ending' && (
          <section className="story-box">
            <h2 className="arcade-label mb-3">ENDING</h2>
            <Typewriter text={hero.epilogue} />
            <p className="small text-info">✓ Ending unlocked – read it again any time in the Snackverse.</p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <Button className="fight-btn" onClick={() => navigate('/snackverse')}>BACK TO THE SNACKVERSE</Button>
            </div>
          </section>
        )}
      </Container>
    </div>
  )
}

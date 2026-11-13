import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Container, Button, ButtonGroup } from 'react-bootstrap'
import { motion, AnimatePresence, useAnimate, useReducedMotion } from 'motion/react'
import confetti from 'canvas-confetti'
import { simulateBattle, startBattle, playTurn } from '../game/battleEngine.js'
import { getFinisher } from '../game/finishers.js'
import { sfx, isMuted, setMuted } from '../game/sfx.js'
import { recordFight } from '../game/stats.js'
import HealthBar from './HealthBar.jsx'
import StatusIcons from './StatusIcons.jsx'
import BattleLog from './BattleLog.jsx'
import FinishPrompt from './FinishPrompt.jsx'
import FinisherFX from './FinisherFX.jsx'
import VsSplash from './VsSplash.jsx'
import MovePicker from './MovePicker.jsx'
import ShareButton from './ShareButton.jsx'

const TURN_MS = 1400 // time per turn at normal speed

// Create a fresh battle.
//  - 'watch': the whole fight is calculated at once (simulateBattle) and
//    the Arena just replays the events.
//  - 'play':  only the start state is created; turns are added one by one
//    as the player (and the computer) choose moves.
function newBattle(left, right, control) {
  if (control === 'play') {
    const live = startBattle(left, right)
    return { fighters: live.fighters, events: [], winner: null, live }
  }
  const result = simulateBattle(left, right)
  return { fighters: result.fighters, events: result.events, winner: result.winner, live: null }
}

// The fighting arena, shared by every mode (Versus, Story, Tournament, Daily).
//
// phase:  'vs'       -> VS splash screen
//         'round'    -> "ROUND 1 … FIGHT!" (+ pre-fight quotes)
//         'fight'    -> turns play one by one
//         'finish'   -> "FINISH THEM!" combo prompt
//         'finisher' -> the finishing move plays
//         'ko'       -> plain K.O. (combo failed or timed out)
//         'result'   -> winner panel, rendered by the parent via renderResult()
//
// Props:
//   left, right   – the two snacks
//   control       – 'watch' (default) or 'play' (the player picks moves for playerSide)
//   playerSide    – which side the player is ('left' by default in play mode).
//                   If the computer wins, it decides by itself whether to finish.
//   quotes        – optional { left, right } lines said before the fight
//   title         – optional text on the VS splash, e.g. "SEMI-FINAL"
//   mode          – label stored in the Hall of Fame ('versus', 'story', …)
//   renderResult  – function that returns the buttons/text for the result panel
//   onResult      – optional callback when the fight is decided
export default function Arena({
  left, right, control = 'watch', playerSide, quotes, title, mode = 'versus', renderResult, onResult,
}) {
  const reduceMotion = useReducedMotion()
  const player = control === 'play' ? (playerSide ?? 'left') : playerSide
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState('vs')
  const [announce, setAnnounce] = useState('')
  const [step, setStep] = useState(-1)        // index of the event currently shown
  const [speed, setSpeed] = useState(1)
  const [finished, setFinished] = useState(false) // was the finisher performed?
  const [inputReady, setInputReady] = useState(false)
  const [muted, setMutedState] = useState(isMuted())
  const [battle, setBattle] = useState(() => newBattle(left, right, control))
  const [scope, animate] = useAnimate()       // lets us animate elements inside the arena
  const recordedRound = useRef(0)             // so each round is saved only once
  const [newAchievements, setNewAchievements] = useState([])

  const { fighters, events, winner } = battle
  const loser = winner === 'left' ? 'right' : 'left'
  const finisher = useMemo(() => (winner ? getFinisher(fighters[winner]) : null), [fighters, winner])
  const current = step >= 0 ? events[step] : null
  const caughtUp = step === events.length - 1
  const hp = current ? current.hp : { left: fighters.left.maxHp, right: fighters.right.maxHp }
  const shieldUsed = (side) => events.slice(0, step + 1).some((e) => e.blocked && e.defender === side)
  const playersTurn = control === 'play' && phase === 'fight' && caughtUp && !winner &&
    battle.live.attacker === player

  // --- 1. "ROUND 1 … FIGHT!" ---------------------------------------
  useEffect(() => {
    if (phase !== 'round') return
    const wait = quotes && round === 1 ? 2600 : 0 // time to read the pre-fight quotes
    setAnnounce(wait ? '' : `ROUND ${round}`)
    const t0 = setTimeout(() => setAnnounce(`ROUND ${round}`), wait)
    const t1 = setTimeout(() => { setAnnounce('FIGHT!'); sfx.fight() }, wait + 1100)
    const t2 = setTimeout(() => { setAnnounce(''); setPhase('fight') }, wait + 1900)
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2) } // cleanup if we leave early
  }, [phase, round, quotes])

  // When the last turn has been shown: let the player try the finisher –
  // unless the computer won, then it finishes (or not) on its own.
  const endFight = useCallback(() => {
    if (player && winner !== player) {
      const cpuFinishes = Math.random() < 0.5
      setFinished(cpuFinishes)
      setPhase(cpuFinishes ? 'finisher' : 'ko')
    } else {
      setPhase('finish')
    }
  }, [player, winner])

  // Play one turn in 'play' mode (move = null lets the attacker choose).
  const doTurn = useCallback((move) => {
    setBattle((b) => {
      const { state, event } = playTurn(b.live, move)
      return { ...b, live: state, events: [...b.events, event], winner: state.winner }
    })
  }, [])

  // --- 2. Advance the fight ------------------------------------------
  useEffect(() => {
    if (phase !== 'fight') return
    let timer
    if (step + 1 < events.length) {
      // Show the next event. In play mode it was just created, so show it at once.
      const delay = control === 'play' ? 0 : step === -1 ? 200 : TURN_MS / speed
      timer = setTimeout(() => setStep(step + 1), delay)
    } else if (winner) {
      timer = setTimeout(endFight, step === -1 ? 0 : 1100)
    } else if (control === 'play' && battle.live.attacker !== player) {
      // The computer's turn: wait for the previous animation, then attack.
      timer = setTimeout(() => doTurn(null), step === -1 ? 400 : TURN_MS / speed)
    }
    return () => clearTimeout(timer)
  }, [phase, step, events.length, winner, speed, control, battle.live, player, endFight, doTurn])

  // In play mode, show the move buttons only after the last hit's animation.
  useEffect(() => {
    setInputReady(false)
    if (!playersTurn) return
    const t = setTimeout(() => setInputReady(true), step === -1 ? 0 : 800)
    return () => clearTimeout(t)
  }, [playersTurn, step])

  // --- 3. Effects for the current turn -------------------------------
  useEffect(() => {
    if (!current) return
    const dir = current.attacker === 'left' ? 1 : -1
    // Attacker lunges forward…
    animate(`.fighter-${current.attacker} .sprite`, { x: [0, dir * 60, 0] }, { duration: 0.35 })
    // …defender gets hit: shake + white flash (or a shield glow if blocked).
    if (current.blocked) {
      animate(`.fighter-${current.defender} .sprite`, { scale: [1, 1.08, 1] }, { duration: 0.4, delay: 0.3 })
    } else if (!reduceMotion) {
      animate(
        `.fighter-${current.defender} .sprite`,
        { x: [0, -14, 14, -8, 8, 0], filter: ['brightness(1)', 'brightness(2.5)', 'brightness(1)'] },
        { duration: 0.4, delay: 0.3 }
      )
    }
    // Critical hits shake the whole arena.
    if (current.crit && !current.blocked && !reduceMotion) {
      animate(scope.current, { x: [0, -12, 12, -8, 8, 0], y: [0, 8, -8, 4, 0] }, { duration: 0.45, delay: 0.3 })
    }
    const sound = setTimeout(() => {
      if (current.blocked) sfx.block()
      else if (current.crit) sfx.crit()
      else sfx.hit()
    }, 300)
    return () => clearTimeout(sound)
  }, [current, animate, scope, reduceMotion])

  // --- 4. Finish / K.O. / result -----------------------------------
  useEffect(() => {
    if (phase === 'finish') {
      sfx.finishThem()
      // The loser wobbles, dizzy – like in classic fighting games.
      animate(`.fighter-${loser} .sprite`, { rotate: [0, -8, 8, -8, 0] }, { duration: 1, repeat: Infinity })
    }
    if (phase === 'finisher') {
      sfx.finisher()
      animate(`.fighter-${loser} .sprite`, { rotate: 0 }, { duration: 0 })
      animate(`.fighter-${loser} .sprite`, finisher.loser, { duration: 2, times: [0, 0.4, 1], delay: 0.6 })
      if (!reduceMotion) {
        animate(scope.current, { x: [0, -10, 10, -6, 6, 0] }, { duration: 0.5, delay: 1.1 })
      }
      const t = setTimeout(() => setPhase('result'), 4200)
      return () => clearTimeout(t)
    }
    if (phase === 'ko') {
      sfx.ko()
      animate(`.fighter-${loser} .sprite`, { rotate: winner === 'left' ? 75 : -75, y: 40, opacity: 0.4 }, { duration: 0.8 })
      const t = setTimeout(() => setPhase('result'), 2000)
      return () => clearTimeout(t)
    }
    if (phase === 'result') {
      sfx.win()
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { x: winner === 'left' ? 0.25 : 0.75, y: 0.45 },
        disableForReducedMotion: true,
      })
    }
  }, [phase, winner, loser, finisher, animate, scope, reduceMotion])

  // Save the result to the Hall of Fame (once per round) and tell the parent.
  useEffect(() => {
    if (phase !== 'result' || recordedRound.current === round) return
    recordedRound.current = round
    const result = { mode, winner, finished, turns: events.length, fighters, player, finisher }
    setNewAchievements(recordFight(result))
    onResult?.(result)
  }, [phase, round, mode, winner, finished, events.length, fighters, player, finisher, onResult])

  // useCallback: FinishPrompt uses these in its effects, so they must
  // stay the same function between renders.
  const onFinishSuccess = useCallback(() => { setFinished(true); setPhase('finisher') }, [])
  const onFinishFail = useCallback(() => setPhase((p) => (p === 'finish' ? 'ko' : p)), [])
  const onSplashDone = useCallback(() => setPhase('round'), [])

  function rematch() {
    // Reset any pose a finisher or K.O. left behind, then start a new round.
    animate('.sprite', { rotate: 0, x: 0, y: 0, opacity: 1, scale: 1, scaleX: 1, scaleY: 1, filter: 'none' }, { duration: 0 })
    setBattle(newBattle(left, right, control))
    setStep(-1)
    setFinished(false)
    setNewAchievements([])
    setPhase('round')
    setRound((r) => r + 1)
  }

  function skip() {
    setStep(events.length - 1)
  }

  function toggleMute() {
    setMuted(!muted)
    setMutedState(!muted)
  }

  const rageOf = (side) => hp[side] > 0 && hp[side] / fighters[side].maxHp < 0.3

  return (
    <Container fluid="lg" className="battle-page">
      {/* Health bars */}
      <div className="hp-row">
        <HealthBar side="left" name={left.name} hp={hp.left} maxHp={fighters.left.maxHp} rage={rageOf('left')} />
        <div className="round-badge arcade-label">R{round}</div>
        <HealthBar side="right" name={right.name} hp={hp.right} maxHp={fighters.right.maxHp} rage={rageOf('right')} />
      </div>

      {/* The arena */}
      <div className={`arena ${phase === 'finish' ? 'arena-dim' : ''}`} ref={scope} style={left.arena ? { '--arena-tint': left.arena } : undefined}>
        <div className="arena-floor" aria-hidden="true" />
        {['left', 'right'].map((side) => {
          const snack = fighters[side].snack
          return (
            <div key={side} className={`fighter fighter-${side} ${rageOf(side) ? 'in-rage' : ''}`}>
              <div className="fighter-body">
                <div className={`sprite ${snack.emoji ? 'sprite-char' : ''}`}>
                  {snack.image
                    ? <img src={snack.image} alt={snack.name} />
                    : <span className="sprite-emoji" role="img" aria-label={snack.name}>{snack.emoji ?? '🍪'}</span>}
                </div>
              </div>
              <div className={`nameplate nameplate-${side}`}>
                {side === player && <span className="you-tag">YOU</span>}
                {snack.name}
              </div>
              <StatusIcons fighter={fighters[side]} shieldUsed={shieldUsed(side)} />
            </div>
          )
        })}

        {/* VS splash before the first round */}
        <AnimatePresence>
          {phase === 'vs' && (
            <VsSplash left={fighters.left.snack} right={fighters.right.snack} title={title} onDone={onSplashDone} />
          )}
        </AnimatePresence>

        {/* Pre-fight quotes */}
        <AnimatePresence>
          {phase === 'round' && quotes && !announce && round === 1 && ['left', 'right'].map((side, i) => (
            <motion.div
              key={`quote-${side}`}
              className={`speech speech-${side}`}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.9 }}
            >
              “{quotes[side]}”
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Flying attack emoji + move name + damage number for this turn.
            key={step} makes React create new elements every turn,
            which restarts their animations. */}
        <AnimatePresence>
          {current && phase === 'fight' && (
            <motion.div
              key={`proj-${round}-${step}`}
              className="projectile"
              aria-hidden="true"
              initial={{ left: current.attacker === 'left' ? '22%' : '70%', opacity: 1, rotate: 0, scale: 0.6 }}
              animate={{ left: current.attacker === 'left' ? '70%' : '22%', rotate: 360, scale: 1.3, opacity: [1, 1, 0] }}
              transition={{ duration: 0.4, ease: 'easeIn' }}
            >
              {current.move.emoji}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {current && phase === 'fight' && (
            <motion.div
              key={`dmg-${round}-${step}`}
              className={`damage-pop ${current.crit ? 'crit' : ''} ${current.blocked ? 'blocked' : ''}`}
              style={{ left: current.defender === 'left' ? '20%' : '70%' }}
              initial={{ y: 0, opacity: 0, scale: 0.5 }}
              animate={{ y: -90, opacity: [0, 1, 1, 0], scale: current.crit ? 1.6 : 1.1 }}
              transition={{ duration: 1.1, delay: 0.35 }}
            >
              {current.blocked ? 'BLOCKED!' : `-${current.damage}`}
              {current.crit && !current.blocked && <small>CRITICAL!</small>}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {current && phase === 'fight' && (
            <motion.div
              key={`move-${round}-${step}`}
              className={`move-banner move-${current.move.type} from-${current.attacker}`}
              initial={{ opacity: 0, x: current.attacker === 'left' ? -60 : 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {current.move.name}{current.rage && ' 🔥'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Finishing move */}
        {phase === 'finish' && (
          <FinishPrompt winnerName={fighters[winner].snack.name} onSuccess={onFinishSuccess} onFail={onFinishFail} />
        )}
        {phase === 'finisher' && <FinisherFX finisher={finisher} side={loser} />}

        {/* Big centre text: ROUND 1 / FIGHT! / K.O. / finisher name */}
        <AnimatePresence>
          {(announce || phase === 'ko') && (
            <motion.div
              key={phase === 'ko' ? 'ko' : announce}
              className={`announce ${phase === 'ko' ? 'announce-ko' : ''}`}
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              role="status"
            >
              {phase === 'ko' ? 'K.O.' : announce}
            </motion.div>
          )}
          {phase === 'finisher' && (
            <motion.div
              key="snackality"
              className="announce announce-finisher"
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2.4, type: 'spring', stiffness: 200, damping: 12 }}
              role="status"
            >
              <span>{finisher.name}</span>
              <small>SNACKALITY</small>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Your moves (play mode) */}
      {control === 'play' && phase === 'fight' && (
        <MovePicker
          fighter={fighters[player]}
          enabled={playersTurn && inputReady}
          waiting={!playersTurn && !winner}
          onPick={doTurn}
        />
      )}

      {/* Controls */}
      <div className="d-flex flex-wrap justify-content-center gap-2 my-3">
        {phase === 'fight' && control === 'watch' && (
          <>
            <ButtonGroup size="sm" aria-label="Battle speed">
              <Button variant={speed === 1 ? 'warning' : 'outline-warning'} onClick={() => setSpeed(1)} aria-pressed={speed === 1}>1×</Button>
              <Button variant={speed === 2 ? 'warning' : 'outline-warning'} onClick={() => setSpeed(2)} aria-pressed={speed === 2}>2×</Button>
            </ButtonGroup>
            <Button size="sm" variant="outline-light" onClick={skip}>Skip to end ⏭</Button>
          </>
        )}
        <Button size="sm" variant="outline-light" onClick={toggleMute} aria-pressed={muted}>
          {muted ? '🔇 Sound off' : '🔊 Sound on'}
        </Button>
      </div>

      {/* Winner panel – the parent decides what goes in it */}
      <AnimatePresence>
        {phase === 'result' && (
          <motion.section
            className="result-panel text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            aria-live="polite"
          >
            <div className="arcade-label text-warning mb-2">{finished ? `${finisher.name} – SNACKALITY` : 'WINNER'}</div>
            <h2 className="arcade-title result-name">{fighters[winner].snack.name}</h2>
            <p className="mb-3">
              {finished
                ? <>{fighters[winner].snack.name} {finisher.text}!</>
                : <>Won in {events.length} turns with {hp[winner]} HP left.</>}
            </p>
            {newAchievements.map((a) => (
              <motion.div key={a.id} className="achievement-toast" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.4 }}>
                <span aria-hidden="true">{a.icon}</span> Achievement unlocked: <strong>{a.name}</strong>
              </motion.div>
            ))}
            {renderResult({ winner, finished, rematch })}
            <div className="mt-3">
              <ShareButton
                winner={fighters[winner].snack}
                loser={fighters[loser].snack}
                finisherName={finished ? finisher.name : null}
                turns={events.length}
                hpLeft={hp[winner]}
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <BattleLog events={events.slice(0, step + 1)} fighters={fighters} />
    </Container>
  )
}

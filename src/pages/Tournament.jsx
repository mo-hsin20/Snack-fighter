import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Button, Card } from 'react-bootstrap'
import { motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { CHARACTERS } from '../data/snackverse.js'
import { simulateBattle } from '../game/battleEngine.js'
import { recordTournamentWin } from '../game/stats.js'
import { getControl } from '../game/settings.js'
import { shuffle } from '../game/random.js'
import Arena from '../components/Arena.jsx'
import ControlToggle from '../components/ControlToggle.jsx'

const ROUND_NAMES = ['QUARTER-FINAL', 'SEMI-FINAL', 'FINAL']

// Who wins a match the player is not in? Let the engine decide.
function simulateMatch(match) {
  return simulateBattle(match.a, match.b).winner === 'left' ? match.a : match.b
}

// Pair up the winners of a round into the matches of the next round.
// The player's champion is always put on side "a" (the left side).
function nextRound(winners, champion) {
  const matches = []
  for (let i = 0; i < winners.length; i += 2) {
    let [a, b] = [winners[i], winners[i + 1]]
    if (b.barcode === champion.barcode) [a, b] = [b, a]
    matches.push({ a, b, winner: null })
  }
  return matches
}

// Screen: the Crisper Cup – an 8-fighter knockout tournament.
// You play your own matches; all other matches are simulated instantly.
// screen: 'setup' -> 'bracket' -> 'fight' -> 'bracket' … -> 'champion' | 'eliminated'
export default function Tournament({ fighters }) {
  const [screen, setScreen] = useState('setup')
  const [champion, setChampion] = useState(null)
  const [rounds, setRounds] = useState([])   // rounds[r] = list of matches
  const [roundIndex, setRoundIndex] = useState(0)
  const [cupWinner, setCupWinner] = useState(null)
  const [control, setControlState] = useState(getControl)

  // Champion options: the 8 Snackverse heroes, plus your current P1 snack.
  const options = fighters.left ? [fighters.left, ...CHARACTERS] : CHARACTERS

  function start(pick) {
    // 7 opponents: Snackverse heroes, not including the pick itself.
    const others = shuffle(CHARACTERS.filter((c) => c.barcode !== pick.barcode)).slice(0, 7)
    const entrants = [pick, ...others]
    const firstRound = []
    for (let i = 0; i < 8; i += 2) firstRound.push({ a: entrants[i], b: entrants[i + 1], winner: null })
    setChampion(pick)
    setRounds([firstRound])
    setRoundIndex(0)
    setCupWinner(null)
    setScreen('bracket')
  }

  const currentRound = rounds[roundIndex] ?? []
  const myMatch = currentRound.find((m) => m.a.barcode === champion?.barcode)

  // Called when the player's fight is over.
  function finishMatch(playerWon) {
    // 1. Fill in the winners of this round.
    const done = currentRound.map((m) =>
      m === myMatch ? { ...m, winner: playerWon ? m.a : m.b } : { ...m, winner: simulateMatch(m) })
    let allRounds = [...rounds.slice(0, roundIndex), done]

    if (!playerWon) {
      // 2a. Knocked out: simulate the rest of the cup to find the champion.
      let winners = done.map((m) => m.winner)
      while (winners.length > 1) {
        const round = nextRound(winners, winners[0]).map((m) => ({ ...m, winner: simulateMatch(m) }))
        allRounds.push(round)
        winners = round.map((m) => m.winner)
      }
      setRounds(allRounds)
      setCupWinner(winners[0])
      setScreen('eliminated')
      return
    }

    if (roundIndex === ROUND_NAMES.length - 1) {
      // 2b. Won the final!
      setRounds(allRounds)
      setCupWinner(champion)
      recordTournamentWin()
      setScreen('champion')
      return
    }

    // 2c. On to the next round.
    allRounds = [...allRounds, nextRound(done.map((m) => m.winner), champion)]
    setRounds(allRounds)
    setRoundIndex(roundIndex + 1)
    setScreen('bracket')
  }

  useEffect(() => {
    if (screen === 'champion') {
      confetti({ particleCount: 250, spread: 140, origin: { y: 0.4 }, disableForReducedMotion: true })
    }
  }, [screen])

  // ----- The fight itself -----
  if (screen === 'fight') {
    return (
      <Arena
        key={roundIndex}
        left={myMatch.a}
        right={myMatch.b}
        control={control}
        playerSide="left"
        mode="tournament"
        title={ROUND_NAMES[roundIndex]}
        renderResult={({ winner }) => (
          <Button className="fight-btn" onClick={() => finishMatch(winner === 'left')}>
            {winner === 'left' ? (roundIndex === 2 ? 'CLAIM THE CUP' : 'NEXT ROUND') : 'SEE THE RESULTS'}
          </Button>
        )}
      />
    )
  }

  return (
    <Container className="pb-5">
      <h1 className="arcade-title display-title text-center mb-2">THE CRISPER CUP</h1>
      <p className="text-center lead">Eight fighters. Three rounds. One trophy.</p>

      {/* ----- Choose your champion ----- */}
      {screen === 'setup' && (
        <>
          <h2 className="h5 text-center my-4">Choose your champion</h2>
          <Row xs={2} md={3} lg={5} className="g-3 justify-content-center">
            {options.map((f) => (
              <Col key={f.barcode}>
                <button type="button" className="champ-pick" onClick={() => start(f)}>
                  <span className="champ-portrait" aria-hidden="true">
                    {f.image ? <img src={f.thumb ?? f.image} alt="" /> : f.emoji}
                  </span>
                  <span className="champ-name">{f.name}</span>
                  {f === fighters.left && <span className="small text-info">Your P1</span>}
                </button>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-4"><ControlToggle id="cup-control" onChange={setControlState} /></div>
        </>
      )}

      {/* ----- Bracket ----- */}
      {screen !== 'setup' && (
        <>
          <div className="bracket" aria-label="Tournament bracket">
            {ROUND_NAMES.map((name, r) => (
              <section key={name} className="bracket-round">
                <h2 className="arcade-label">{name}</h2>
                {(rounds[r] ?? Array.from({ length: 4 >> r }, () => null)).map((m, i) => (
                  <div key={i} className={`bracket-match ${m && m.a.barcode === champion.barcode ? 'mine' : ''}`}>
                    {m ? [m.a, m.b].map((f) => (
                      <div key={f.barcode} className={`bracket-entry ${m.winner ? (m.winner === f ? 'won' : 'lost') : ''}`}>
                        <span aria-hidden="true">{f.emoji ?? '🍪'}</span> {f.name}
                        {m.winner === f && <span className="visually-hidden"> (winner)</span>}
                      </div>
                    )) : <div className="bracket-entry tbd">To be decided</div>}
                  </div>
                ))}
              </section>
            ))}
          </div>

          {screen === 'bracket' && (
            <div className="text-center mt-4">
              <p className="mb-2">{ROUND_NAMES[roundIndex]}: <strong>{myMatch.a.name}</strong> vs <strong>{myMatch.b.name}</strong></p>
              <Button className="fight-btn" size="lg" onClick={() => setScreen('fight')}>FIGHT!</Button>
            </div>
          )}

          {screen === 'champion' && (
            <motion.div className="text-center mt-4 cup-result" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="trophy" aria-hidden="true">🏆</div>
              <h2 className="arcade-title text-warning">{champion.name} WINS THE CUP!</h2>
              <Button className="fight-btn mt-3" onClick={() => setScreen('setup')}>NEW TOURNAMENT</Button>
            </motion.div>
          )}

          {screen === 'eliminated' && (
            <Card className="stats-panel text-center mt-4">
              <Card.Body>
                <h2 className="h4">Knocked out!</h2>
                <p>The Crisper Cup was won by <strong>{cupWinner.emoji ?? ''} {cupWinner.name}</strong>.</p>
                <Button className="fight-btn" onClick={() => setScreen('setup')}>TRY AGAIN</Button>
              </Card.Body>
            </Card>
          )}
        </>
      )}

      <div className="text-center mt-4"><Link to="/hall-of-fame">🏆 Hall of Fame</Link></div>
    </Container>
  )
}

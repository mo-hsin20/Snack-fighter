import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Badge, Modal, Button, ProgressBar } from 'react-bootstrap'
import { motion } from 'motion/react'
import { CHARACTERS, BOSS, SNACKVERSE_INTRO, TRUE_ENDING } from '../data/snackverse.js'
import { loadProgress } from '../game/progress.js'
import { sfx } from '../game/sfx.js'
import Typewriter from '../components/Typewriter.jsx'

// Screen 5: The Snackverse – story mode character select.
// Fighters from other realities, each with a story and an ending to unlock.
export default function Snackverse() {
  const [progress] = useState(loadProgress)
  const [reading, setReading] = useState(null) // character whose ending is open

  useEffect(() => { sfx.portal() }, [])

  const cleared = (id) => progress.cleared.includes(id)
  const clearedHeroes = CHARACTERS.filter((c) => cleared(c.id)).length
  const bossUnlocked = progress.cleared.length > 0
  const trueEnding = clearedHeroes === CHARACTERS.length
  const roster = bossUnlocked ? [...CHARACTERS, BOSS] : CHARACTERS
  const totalEndings = CHARACTERS.length + 2 // 8 heroes + boss + true ending
  const unlocked = progress.cleared.length + (trueEnding ? 1 : 0)

  return (
    <div className="snackverse">
      {/* Portal "warp" when entering */}
      <motion.div
        className="portal-warp"
        aria-hidden="true"
        initial={{ scale: 0.2, opacity: 1, rotate: 0 }}
        animate={{ scale: 6, opacity: 0, rotate: 270 }}
        transition={{ duration: 1.3, ease: 'easeIn' }}
      />

      <Container className="py-4 position-relative">
        <header className="text-center mb-4">
          <h1 className="arcade-title snackverse-title">THE SNACKVERSE</h1>
          <Typewriter text={SNACKVERSE_INTRO} className="snackverse-intro mx-auto" />
        </header>

        <section className="mb-4" aria-label="Your progress">
          <div className="d-flex justify-content-between small mb-1">
            <span>Endings unlocked</span>
            <span>{unlocked} / {totalEndings}</span>
          </div>
          <ProgressBar now={(unlocked / totalEndings) * 100} variant="info" className="snackverse-progress" />
          {!bossUnlocked && <p className="small text-body-secondary mt-2 mb-0">Clear any story to unlock a secret fighter…</p>}
        </section>

        <Row xs={1} sm={2} lg={3} className="g-3">
          {roster.map((c, i) => (
            <Col key={c.id}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.07 }} className="h-100">
                <Card className={`char-card h-100 ${c.boss ? 'char-boss' : ''}`} style={{ '--char-color': c.color }}>
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex gap-3 align-items-center mb-2">
                      <div className="char-emoji" aria-hidden="true">{c.emoji}</div>
                      <div>
                        <h2 className="h5 mb-0">{c.name}</h2>
                        <div className="small char-title">{c.title}</div>
                      </div>
                    </div>
                    <div className="small mb-2">🌐 {c.reality}</div>
                    <p className="small text-body-secondary flex-grow-1">“{c.taunt}”</p>
                    <div className="d-flex gap-2 align-items-center">
                      <Button as={Link} to={`/snackverse/${c.id}`} size="sm" className="fight-btn flex-grow-1">
                        {cleared(c.id) ? 'PLAY AGAIN' : 'PLAY STORY'}
                      </Button>
                      {cleared(c.id) && (
                        <Button size="sm" variant="outline-light" onClick={() => setReading(c)}>Ending</Button>
                      )}
                    </div>
                    {cleared(c.id) && <Badge bg="success" className="cleared-badge">✓ CLEARED</Badge>}
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        <section className={`true-ending mt-4 ${trueEnding ? 'is-open' : ''}`}>
          <h2 className="arcade-label mb-2">{trueEnding ? '🔓 THE TRUTH ABOUT THE FRIDGE LIGHT' : '🔒 TRUE ENDING'}</h2>
          {trueEnding
            ? <Typewriter text={TRUE_ENDING} />
            : <p className="mb-0 small">Clear the story of all {CHARACTERS.length} heroes to learn what really happens when the door closes. ({clearedHeroes}/{CHARACTERS.length})</p>}
        </section>

        <div className="text-center mt-4">
          <Link to="/select">← Back to the real world</Link>
        </div>
      </Container>

      <Modal show={Boolean(reading)} onHide={() => setReading(null)} centered contentClassName="scanner-modal">
        {reading && (
          <>
            <Modal.Header closeButton closeVariant="white">
              <Modal.Title className="h5">{reading.emoji} {reading.name} – Ending</Modal.Title>
            </Modal.Header>
            <Modal.Body><p className="mb-0">{reading.epilogue}</p></Modal.Body>
          </>
        )}
      </Modal>
    </div>
  )
}

import { useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { loadStats, resetStats, ACHIEVEMENTS } from '../game/stats.js'

// Screen: Hall of Fame – the player's record, fighter rankings and
// achievements. Everything comes from localStorage (game/stats.js).
export default function HallOfFame() {
  const [stats, setStats] = useState(loadStats)
  const [confirmReset, setConfirmReset] = useState(false)

  // Turn the fighters object into a ranked list: most wins first.
  const ranking = Object.entries(stats.fighters)
    .map(([id, f]) => ({ id, ...f, total: f.wins + f.losses }))
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses)
    .slice(0, 10)

  const playerFights = stats.playerWins + stats.playerLosses
  const winRate = playerFights ? Math.round((stats.playerWins / playerFights) * 100) : 0

  const tiles = [
    { label: 'Fights', value: stats.fights },
    { label: 'Your win rate', value: playerFights ? `${winRate}%` : '–' },
    { label: 'Best streak', value: stats.bestStreak },
    { label: 'Snackalities', value: stats.snackalities },
    { label: 'Tournaments won', value: stats.tournamentsWon },
    { label: 'Daily wins', value: stats.dailyWins.length },
  ]

  function reset() {
    resetStats()
    setStats(loadStats())
    setConfirmReset(false)
  }

  return (
    <Container className="pb-5">
      <h1 className="arcade-title display-title text-center mb-4">HALL OF FAME</h1>

      <Row xs={2} md={3} lg={6} className="g-3 mb-4">
        {tiles.map((t) => (
          <Col key={t.label}>
            <div className="stat-box hof-tile">
              <span className="stat-value">{t.value}</span>
              <span className="stat-label">{t.label}</span>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="stats-panel h-100">
            <Card.Body>
              <h2 className="arcade-label mb-3">TOP FIGHTERS</h2>
              {ranking.length === 0 ? (
                <p className="text-body-secondary mb-0">No fights yet. <Link to="/select">Start one!</Link></p>
              ) : (
                <Table variant="dark" size="sm" className="mb-0 align-middle hof-table">
                  <thead>
                    <tr><th scope="col">#</th><th scope="col">Fighter</th><th scope="col">W</th><th scope="col">L</th></tr>
                  </thead>
                  <tbody>
                    {ranking.map((f, i) => (
                      <tr key={f.id}>
                        <td>{i === 0 ? '👑' : i + 1}</td>
                        <td>
                          <span className="hof-avatar" aria-hidden="true">
                            {f.image ? <img src={f.image} alt="" /> : (f.emoji ?? '🍪')}
                          </span>
                          {f.name}
                        </td>
                        <td>{f.wins}</td>
                        <td>{f.losses}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="stats-panel h-100">
            <Card.Body>
              <h2 className="arcade-label mb-3">
                ACHIEVEMENTS {stats.achievements.length}/{ACHIEVEMENTS.length}
              </h2>
              <ul className="list-unstyled mb-0 achievement-list">
                {ACHIEVEMENTS.map((a) => {
                  const unlocked = stats.achievements.includes(a.id)
                  return (
                    <li key={a.id} className={unlocked ? 'unlocked' : 'locked'}>
                      <span className="ach-icon" aria-hidden="true">{unlocked ? a.icon : '🔒'}</span>
                      <span>
                        <strong>{a.name}</strong>
                        <span className="visually-hidden">{unlocked ? ' (unlocked)' : ' (locked)'}</span>
                        <br />
                        <small>{a.text}</small>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="text-center mt-4">
        <Button variant="outline-danger" size="sm" onClick={() => setConfirmReset(true)}>Reset all stats</Button>
      </div>

      <Modal show={confirmReset} onHide={() => setConfirmReset(false)} centered contentClassName="scanner-modal">
        <Modal.Header closeButton closeVariant="white"><Modal.Title className="h5">Reset the Hall of Fame?</Modal.Title></Modal.Header>
        <Modal.Body>All fights, streaks and achievements on this device will be deleted. Story endings are kept.</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-light" onClick={() => setConfirmReset(false)}>Cancel</Button>
          <Button variant="danger" onClick={reset}>Reset</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

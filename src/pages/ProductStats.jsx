import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Container, Spinner, Alert, Row, Col, Card, Button } from 'react-bootstrap'
import { getProduct } from '../api/openFoodFacts.js'
import { buildFighter } from '../game/battleEngine.js'
import FighterProfile from '../components/FighterProfile.jsx'
import NutrientChart from '../components/NutrientChart.jsx'
import MoveList from '../components/MoveList.jsx'
import WinChance from '../components/WinChance.jsx'

// Screen 4: a snack's "fighter profile".
//   /product/123            -> one snack
//   /product/123?vs=456     -> compare mode: two snacks side by side
// Everything is in the URL, so a profile or comparison can be shared as a link.
export default function ProductStats({ fighters, setFighters }) {
  const { barcode } = useParams()
  const [searchParams] = useSearchParams()
  const vsBarcode = searchParams.get('vs')
  const navigate = useNavigate()

  const [snacks, setSnacks] = useState(null) // [main] or [main, opponent]
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setSnacks(null)
    setError('')

    async function load() {
      try {
        // Promise.all runs both requests at the same time instead of one after the other.
        const codes = vsBarcode ? [barcode, vsBarcode] : [barcode]
        const loaded = await Promise.all(codes.map((code) => getProduct(code, controller.signal)))
        setSnacks(loaded)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      }
    }
    load()

    // Cleanup: cancel the requests if the URL changes or we leave the page.
    return () => controller.abort()
  }, [barcode, vsBarcode])

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
        <Link to="/select">← Back to fighter selection</Link>
      </Container>
    )
  }

  if (!snacks) {
    return (
      <div className="text-center my-5" role="status">
        <Spinner animation="border" />
        <div className="mt-2">Loading fighter profile…</div>
      </div>
    )
  }

  const [main, opponent] = snacks
  const isCompare = Boolean(opponent)

  function sendTo(side, snack) {
    setFighters((prev) => ({ ...prev, [side]: snack }))
    navigate('/select')
  }

  function fightThese() {
    setFighters({ left: main, right: opponent })
    navigate('/battle')
  }

  // In single mode, offer to compare with a fighter that is already chosen.
  const compareCandidate = [fighters.left, fighters.right].find((f) => f && f.barcode !== main.barcode)

  return (
    <Container className="pb-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <Link to="/select">← Back to fighter selection</Link>
        {isCompare ? (
          <Button className="fight-btn btn-sm" onClick={fightThese}>FIGHT!</Button>
        ) : (
          <div className="d-flex gap-2">
            <Button size="sm" variant="outline-danger" onClick={() => sendTo('left', main)}>Choose as P1</Button>
            <Button size="sm" variant="outline-primary" onClick={() => sendTo('right', main)}>Choose as P2</Button>
          </div>
        )}
      </div>

      <h1 className="arcade-title display-title text-center mb-4">
        {isCompare ? 'Tale of the tape' : 'Fighter profile'}
      </h1>

      <Row className="g-4 mb-4">
        <Col md={isCompare ? 6 : 12} lg={isCompare ? 6 : { span: 8, offset: 2 }}>
          <FighterProfile fighter={buildFighter(main)} color="red" />
        </Col>
        {isCompare && (
          <Col md={6}>
            <FighterProfile fighter={buildFighter(opponent)} color="blue" />
          </Col>
        )}
      </Row>

      {isCompare && <WinChance left={main} right={opponent} />}

      <Card className="stats-panel mb-4">
        <Card.Body>
          <h2 className="h5">Nutrients per 100 g, as % of a day’s reference amount</h2>
          <p className="small text-body-secondary">
            Past the dashed line, 100 g contains more than a whole day’s worth.
          </p>
          <NutrientChart
            entries={isCompare ? [{ snack: main, color: 'red' }, { snack: opponent, color: 'blue' }] : [{ snack: main, color: 'red' }]}
          />
        </Card.Body>
      </Card>

      <Row className="g-4">
        {snacks.map((snack, i) => (
          <Col md={isCompare ? 6 : 12} key={snack.barcode}>
            <Card className="stats-panel h-100">
              <Card.Body>
                <h2 className="arcade-label mb-3">{isCompare ? `${i === 0 ? 'P1' : 'P2'} MOVE LIST` : 'MOVE LIST'}</h2>
                <MoveList fighter={buildFighter(snack)} />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {!isCompare && compareCandidate && (
        <div className="text-center mt-4">
          <Button as={Link} to={`/product/${main.barcode}?vs=${compareCandidate.barcode}`} variant="outline-warning">
            Compare with {compareCandidate.name}
          </Button>
        </div>
      )}
    </Container>
  )
}

import { useState, useCallback, lazy, Suspense } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Row, Col, Form, Button, Alert, InputGroup, ButtonGroup, ToggleButton, Spinner } from 'react-bootstrap'
import useSnackSearch from '../hooks/useSnackSearch.js'
import SnackCard from '../components/SnackCard.jsx'
import SkeletonCard from '../components/SkeletonCard.jsx'
import FighterSlot from '../components/FighterSlot.jsx'
import ControlToggle from '../components/ControlToggle.jsx'

// Quick-pick buttons. "category" is an Open Food Facts category tag.
const CATEGORIES = [
  { category: 'snacks', label: '🔥 Popular' },
  { category: 'salty-snacks', label: '🥨 Salty' },
  { category: 'chocolates', label: '🍫 Chocolate' },
  { category: 'candies', label: '🍬 Candy' },
  { category: 'biscuits', label: '🍪 Cookies' },
  { category: 'energy-drinks', label: '⚡ Energy drinks' },
  { category: 'nuts', label: '🥜 Nuts' },
  { category: 'fruits', label: '🍎 Fruit' },
]

// The scanner library is fairly large, so it is only downloaded when
// someone actually opens the barcode pop-up.
const BarcodeScanner = lazy(() => import('../components/BarcodeScanner.jsx'))

// One-tap "classic fighters". Looked up by barcode, which works even
// when Open Food Facts' search is overloaded.
const CLASSICS = [
  { code: '5053990127726', label: 'Pringles' },
  { code: '4001686301326', label: 'Haribo Goldbears' },
  { code: '3017620422003', label: 'Nutella' },
  { code: '5449000000996', label: 'Coca-Cola' },
  { code: '6416453074064', label: 'Fazer Domino' },
  { code: '6416453061972', label: 'Fazer Lakritsi' },
  { code: '6416453019195', label: 'Karl Fazer Caramel & Sea Salt' },
]

// Screen 2: search for snacks and choose a fighter for each corner.
export default function PickFighters({ fighters, setFighters }) {
  const [query, setQuery] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const navigate = useNavigate()
  const { request, results, status, error, hasMore, country, search, setCountry, loadMore, retry } =
    useSnackSearch({ type: 'category', ...CATEGORIES[0] })

  // useCallback keeps the same function between renders, so the
  // scanner's effect doesn't restart the camera on every render.
  const findBarcode = useCallback((code) => search({ type: 'barcode', code, label: `Barcode ${code}` }), [search])
  const closeScanner = useCallback(() => setShowScanner(false), [])

  function handleSubmit(event) {
    event.preventDefault() // stop the form from reloading the page
    const term = query.trim()
    if (term) search({ type: 'text', term })
  }

  function selectFighter(side, snack) {
    // Copy the old object and change only one side.
    setFighters((prev) => ({ ...prev, [side]: snack }))
  }

  function sideOf(snack) {
    if (fighters.left?.barcode === snack.barcode) return 'left'
    if (fighters.right?.barcode === snack.barcode) return 'right'
    return null
  }

  const ready = fighters.left && fighters.right
  const heading = request.type === 'text' ? `Results for “${request.term}”` : request.label

  return (
    <Container>
      <header className="text-center mb-4">
        <h1 className="arcade-title display-title">Choose your fighters</h1>
        <p className="lead mb-0">Two snacks enter. Real nutrition data decides who leaves.</p>
      </header>

      {/* The two corners + FIGHT button */}
      <section aria-label="Selected fighters" className="arena-preview mb-4">
        <FighterSlot player="P1" color="red" snack={fighters.left} onClear={() => selectFighter('left', null)} />
        <div className="vs-badge" aria-hidden="true">VS</div>
        <FighterSlot player="P2" color="blue" snack={fighters.right} onClear={() => selectFighter('right', null)} />
      </section>

      <div className="text-center mb-5">
        <div className="mb-3"><ControlToggle id="versus-control" /></div>
        <Button size="lg" className="fight-btn" disabled={!ready} onClick={() => navigate('/battle')}>
          FIGHT!
        </Button>
        {!ready && <div className="small text-body-secondary mt-2">Pick a snack for both P1 and P2</div>}
        <div className="mt-4">
          <Link to="/snackverse" className="portal-link">
            <span className="portal-swirl" aria-hidden="true">🌀</span> Enter the Snackverse – story mode
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <Form onSubmit={handleSubmit} className="mb-3" role="search">
        <Form.Label htmlFor="snack-search" className="visually-hidden">Search snacks</Form.Label>
        <InputGroup size="lg">
          <Form.Control
            id="snack-search"
            type="search"
            placeholder="Search any snack: Pringles, Fazer, Haribo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" variant="warning">Search</Button>
          <Button variant="outline-warning" onClick={() => setShowScanner(true)} title="Find by barcode">
            <span aria-hidden="true">📷</span><span className="d-none d-md-inline"> Barcode</span>
            <span className="visually-hidden">Find by barcode</span>
          </Button>
        </InputGroup>
      </Form>

      {showScanner && (
        <Suspense fallback={null}>
          <BarcodeScanner show={showScanner} onHide={closeScanner} onFound={findBarcode} />
        </Suspense>
      )}

      {/* Classic fighters: one tap = one barcode lookup */}
      <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
        <span className="small text-body-secondary me-1">Classic fighters:</span>
        {CLASSICS.map((c) => (
          <Button
            key={c.code}
            size="sm"
            variant={request.code === c.code ? 'warning' : 'outline-secondary'}
            className="rounded-pill"
            onClick={() => search({ type: 'barcode', code: c.code, label: c.label })}
          >
            {c.label}
          </Button>
        ))}
      </div>

      {/* Quick picks + country filter */}
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-4">
        <div className="d-flex flex-wrap gap-2" role="group" aria-label="Snack categories">
          {CATEGORIES.map((c) => (
            <Button
              key={c.category}
              size="sm"
              variant={request.category === c.category ? 'warning' : 'outline-light'}
              className="rounded-pill"
              onClick={() => search({ type: 'category', ...c })}
            >
              {c.label}
            </Button>
          ))}
        </div>
        <ButtonGroup size="sm" aria-label="Where the snacks are sold">
          {[['', '🌍 World'], ['finland', '🇫🇮 Finland']].map(([value, label]) => (
            <ToggleButton
              key={value || 'world'}
              id={`country-${value || 'world'}`}
              type="radio"
              name="country"
              variant="outline-warning"
              value={value}
              checked={country === value}
              onChange={() => setCountry(value)}
            >
              {label}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </div>

      <h2 className="h5 mb-3">{heading}</h2>

      {/* Feedback for each API state */}
      {status === 'error' && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center gap-2">
          <span>{error}</span>
          <div className="d-flex gap-2 flex-shrink-0">
            <Button variant="outline-danger" size="sm" onClick={retry}>Retry</Button>
            <Button variant="outline-light" size="sm" onClick={() => setShowScanner(true)}>Use barcode</Button>
          </div>
        </Alert>
      )}

      {status === 'success' && results.length === 0 && (
        <Alert variant="secondary">
          No battle-ready snacks found. Try a brand name, a simpler word, or switch to 🌍 World.
        </Alert>
      )}

      <Row xs={2} md={3} lg={4} className="g-3" aria-busy={status === 'loading'}>
        {status === 'loading'
          ? Array.from({ length: 8 }, (_, i) => <Col key={i}><SkeletonCard /></Col>)
          : results.map((snack) => (
              <Col key={snack.barcode}>
                <SnackCard snack={snack} onSelect={selectFighter} selectedSide={sideOf(snack)} />
              </Col>
            ))}
      </Row>

      {hasMore && status !== 'loading' && status !== 'error' && (
        <div className="text-center my-4">
          <Button variant="outline-warning" onClick={loadMore} disabled={status === 'loadingMore'}>
            {status === 'loadingMore' ? <><Spinner size="sm" /> Loading…</> : 'Load more snacks'}
          </Button>
        </div>
      )}
    </Container>
  )
}

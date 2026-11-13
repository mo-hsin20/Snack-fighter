import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Alert, Button } from 'react-bootstrap'
import Arena from '../components/Arena.jsx'
import { getControl } from '../game/settings.js'

// Screen 3: Versus mode – the two snacks picked on the selection screen fight.
// All the battle logic and animation lives in <Arena>; this page only
// decides which buttons appear when the fight is over.
export default function Battle({ fighters }) {
  const navigate = useNavigate()
  const [control] = useState(getControl) // read the saved setting once
  const { left, right } = fighters

  if (!left || !right) {
    return (
      <Container>
        <Alert variant="warning">
          No fighters chosen yet. <Link to="/select">Pick two snacks first.</Link>
        </Alert>
      </Container>
    )
  }

  return (
    <Arena
      left={left}
      right={right}
      control={control}
      title="VERSUS"
      mode="versus"
      renderResult={({ rematch }) => (
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <Button className="fight-btn" onClick={rematch}>REMATCH</Button>
          <Button variant="outline-light" onClick={() => navigate('/select')}>New fighters</Button>
          <Button as={Link} to={`/product/${left.barcode}?vs=${right.barcode}`} variant="outline-warning">
            Compare stats
          </Button>
        </div>
      )}
    />
  )
}

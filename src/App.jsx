import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { Spinner } from 'react-bootstrap'
import AppNavbar from './components/AppNavbar.jsx'
import Intro from './pages/Intro.jsx'
import PickFighters from './pages/PickFighters.jsx'
import Battle from './pages/Battle.jsx'
import NotFound from './pages/NotFound.jsx'
import Snackverse from './pages/Snackverse.jsx'
import Story from './pages/Story.jsx'
import Tournament from './pages/Tournament.jsx'
import Daily from './pages/Daily.jsx'
import HallOfFame from './pages/HallOfFame.jsx'
import { getSavedFighters, saveFighters } from './game/settings.js'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// The stats screen uses the big chart library (Recharts). lazy() loads it
// only when someone opens that screen, so the first page loads faster.
const ProductStats = lazy(() => import('./pages/ProductStats.jsx'))

export default function App() {
  // The two chosen snacks live here in App, because both the
  // PickFighters screen and the Battle screen need them.
  // (This is called "lifting state up".)
  // They are also saved in localStorage, so a page refresh doesn't lose them.
  const [fighters, setFighters] = useState(getSavedFighters)
  useEffect(() => { saveFighters(fighters) }, [fighters])

  const { pathname } = useLocation()
  const isIntro = pathname === '/'
  const mainRef = useRef(null)

  // Start every new screen at the top of the page.
  // Braces matter here: an effect may only return a cleanup function, and
  // in newer browsers scrollTo() returns a Promise, which would crash React.
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  // "Skip to content" for keyboard and screen-reader users. A normal
  // href="#main" would change the route (we use HashRouter), so we move
  // the focus with JavaScript instead.
  function skipToContent(e) {
    e.preventDefault()
    mainRef.current?.focus()
  }

  return (
    // reducedMotion="user": if the user has asked their OS for less
    // motion, the animation library tones animations down automatically.
    <MotionConfig reducedMotion="user">
      <a href="#" className="skip-link" onClick={skipToContent}>Skip to content</a>
      {!isIntro && <AppNavbar />}
      <main ref={mainRef} tabIndex={-1} className={isIntro ? '' : 'py-4'}>
        {/* Suspense shows the spinner while a lazy screen is downloading */}
        <ErrorBoundary key={pathname}>
        <Suspense fallback={<div className="text-center my-5"><Spinner animation="border" role="status" /></div>}>
          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/select" element={<PickFighters fighters={fighters} setFighters={setFighters} />} />
            <Route path="/battle" element={<Battle fighters={fighters} />} />
            <Route path="/product/:barcode" element={<ProductStats fighters={fighters} setFighters={setFighters} />} />
            <Route path="/snackverse" element={<Snackverse />} />
            <Route path="/snackverse/:id" element={<Story />} />
            <Route path="/tournament" element={<Tournament fighters={fighters} />} />
            <Route path="/daily" element={<Daily />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
    </MotionConfig>
  )
}

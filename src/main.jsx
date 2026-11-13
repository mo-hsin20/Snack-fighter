import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'

// HashRouter puts the route after a # (e.g. /#/battle).
// GitHub Pages only serves static files, so normal URLs like /battle
// would give a 404 on refresh. With the hash, the server always
// serves index.html and React Router handles the rest.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)

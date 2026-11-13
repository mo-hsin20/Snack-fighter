import { useState, useEffect, useRef, useCallback } from 'react'
import { searchProducts, getPopularInCategory, getProduct } from '../api/openFoodFacts.js'

// Custom hook that holds all the search logic (state, loading, errors,
// paging). The PickFighters page only has to render what this returns,
// which keeps the page component short and easy to read.
//
// A "request" is either:
//   { type: 'text', term: 'pringles' }        – free-text search
//   { type: 'category', category: 'chocolates', label: 'Chocolate' }
//   { type: 'barcode', code: '6416453074064', label: 'Domino' }
export default function useSnackSearch(initialRequest) {
  const [request, setRequest] = useState(initialRequest)
  const [country, setCountry] = useState('')        // '' = whole world
  const [results, setResults] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [status, setStatus] = useState('idle')      // 'idle' | 'loading' | 'loadingMore' | 'success' | 'error'
  const [error, setError] = useState('')
  const controllerRef = useRef(null)

  const load = useCallback(async (req, pageToLoad, append) => {
    // Cancel an older request that is still running, so its results
    // can't arrive late and overwrite the newer ones.
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setStatus(append ? 'loadingMore' : 'loading')
    setError('')
    try {
      const options = { page: pageToLoad, country, signal: controller.signal }
      let result
      if (req.type === 'text') result = await searchProducts(req.term, options)
      else if (req.type === 'category') result = await getPopularInCategory(req.category, options)
      else result = { products: [await getProduct(req.code, controller.signal)], hasMore: false }

      setResults((prev) => {
        if (!append) return result.products
        // When loading more, skip products we already show.
        const seen = new Set(prev.map((p) => p.barcode))
        return [...prev, ...result.products.filter((p) => !seen.has(p.barcode))]
      })
      setHasMore(result.hasMore)
      setPage(pageToLoad)
      setStatus('success')
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
      setStatus('error')
    }
  }, [country])

  // Run a fresh search every time the request or the country changes.
  useEffect(() => {
    if (request) load(request, 1, false)
  }, [request, load])

  // Cancel any running request when the component using the hook unmounts.
  useEffect(() => () => controllerRef.current?.abort(), [])

  return {
    request, results, status, error, hasMore, country,
    search: setRequest,
    setCountry,
    loadMore: () => load(request, page + 1, true),
    retry: () => load(request, 1, false),
  }
}

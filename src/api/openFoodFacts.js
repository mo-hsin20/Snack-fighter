// All communication with the Open Food Facts API lives in this file.
// Components never call fetch() directly – they use these functions.
// Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/

const BASE_URL = 'https://world.openfoodfacts.org'
const PAGE_SIZE = 24

// Only ask for the fields we actually use. A full product can be
// over 100 KB, so this makes the requests much faster.
const FIELDS = [
  'code',
  'product_name',
  'brands',
  'image_front_small_url',
  'image_front_url',
  'nutriscore_grade',
  'nova_group',
  'ecoscore_grade',
  'additives_n',
  'nutriments',
].join(',')

// Simple in-memory cache: if the same URL is requested again
// (e.g. going back and forth between screens), we reuse the answer
// instead of calling the API again. Open Food Facts limits how many
// searches one user can make per minute, so this really helps.
const cache = new Map()

// Turn the raw API product into a small, predictable object.
// The database is crowdsourced, so any field can be missing –
// we replace missing values with safe defaults here, once,
// instead of checking for them everywhere in the UI.
function normalizeProduct(raw) {
  const n = raw.nutriments || {}
  return {
    barcode: raw.code,
    name: raw.product_name?.trim() || 'Unknown snack',
    brand: raw.brands ? raw.brands.split(',')[0].trim() : '',
    image: raw.image_front_url || raw.image_front_small_url || null,
    thumb: raw.image_front_small_url || raw.image_front_url || null,
    nutriScore: validGrade(raw.nutriscore_grade),
    ecoScore: validGrade(raw.ecoscore_grade),
    nova: raw.nova_group ?? null, // 1–4, or null if unknown
    additives: raw.additives_n ?? 0,
    per100g: {
      kcal: n['energy-kcal_100g'] ?? null,
      sugar: n.sugars_100g ?? null,
      salt: n.salt_100g ?? null,
      fat: n.fat_100g ?? null,
      saturatedFat: n['saturated-fat_100g'] ?? null,
      protein: n.proteins_100g ?? null,
      fiber: n.fiber_100g ?? null,
    },
  }
}

// Nutri-Score / Eco-Score come back as 'a'–'e', or as words like
// 'unknown' / 'not-applicable'. We keep only real grades.
function validGrade(grade) {
  return ['a', 'b', 'c', 'd', 'e'].includes(grade) ? grade : null
}

// A snack is "battle ready" if it has a name, a picture and at least
// some nutrition numbers. Entries without these make boring fighters,
// so we hide them from the results.
function isBattleReady(p) {
  const values = Object.values(p.per100g).filter((v) => v !== null)
  return p.name !== 'Unknown snack' && p.thumb && values.length >= 3
}

// Wait `ms` milliseconds – but stop waiting at once if the request is cancelled.
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}

// An Error that also remembers the HTTP status (e.g. 404 or 503).
class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// Shared helper: fetch a URL and turn every kind of failure into an
// Error with a message we can show to the user.
//
// Why retries? Open Food Facts' search server is often overloaded and
// answers "503 Service Unavailable" to roughly half of the requests.
// That error page has no CORS header, so the browser reports it as a
// network failure. Simply trying again a moment later usually works,
// so we try up to `attempts` times, waiting a bit longer each time.
async function getJson(url, { signal, attempts = 1 } = {}) {
  if (cache.has(url)) return cache.get(url)

  let lastError
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (attempt > 1) await wait(700 * (attempt - 1), signal) // 0.7 s, then 1.4 s
    try {
      const response = await fetch(url, { signal })
      if (response.status === 429) {
        // Rate limit: retrying immediately would only make it worse.
        throw new ApiError('Too many requests in a short time. Wait a minute and try again.', 429)
      }
      if (response.status === 404) {
        throw new ApiError('Not found.', 404)
      }
      if (!response.ok) {
        lastError = new ApiError(`Open Food Facts is busy right now (error ${response.status}).`, response.status)
        continue // 5xx errors are worth retrying
      }
      const data = await response.json()
      cache.set(url, data) // only successful answers are cached
      return data
    } catch (err) {
      if (err.name === 'AbortError' || err instanceof ApiError) throw err
      // TypeError = the request failed before we got an answer
      // (no internet, or a 503 page without CORS headers).
      lastError = err
    }
  }

  if (!navigator.onLine) {
    throw new ApiError('You seem to be offline. Check your internet connection.', 0)
  }
  throw new ApiError(
    'Open Food Facts search is overloaded right now (a known problem on their side). ' +
    'Try again in a moment, or find your snack by barcode – that works even when search is down.',
    lastError?.status ?? 0
  )
}

// Turn the API's search answer into { products, hasMore }.
function toResultPage(data, page) {
  const all = (data.products || []).map(normalizeProduct)
  // Remove duplicates (the database sometimes lists a product twice).
  const unique = [...new Map(all.map((p) => [p.barcode, p])).values()]
  return {
    products: unique.filter(isBattleReady),
    hasMore: page * PAGE_SIZE < (data.count || 0),
  }
}

// Both searches below use the search.pl endpoint, because it is the only
// Open Food Facts search that browsers are allowed to call (CORS).
// - sort_by=unique_scans_n puts the most scanned (= most popular)
//   products first, so famous snacks appear at the top.
// - Tag filters (tagtype_N / tag_contains_N / tag_N) limit the results
//   to a category and/or a country.
function buildSearchUrl({ terms = '', category = '', country = '', page }) {
  const params = new URLSearchParams({
    search_terms: terms,
    search_simple: '1',
    action: 'process',
    json: '1',
    sort_by: 'unique_scans_n',
    page: String(page),
    page_size: String(PAGE_SIZE),
    fields: FIELDS,
  })
  const filters = []
  if (category) filters.push(['categories', `en:${category}`])
  if (country) filters.push(['countries', `en:${country}`])
  filters.forEach(([type, value], i) => {
    params.set(`tagtype_${i}`, type)
    params.set(`tag_contains_${i}`, 'contains')
    params.set(`tag_${i}`, value)
  })
  return `${BASE_URL}/cgi/search.pl?${params}`
}

// Search snacks by name, e.g. "fazer chocolate".
export async function searchProducts(query, { page = 1, country = '', signal } = {}) {
  const data = await getJson(buildSearchUrl({ terms: query, country, page }), { signal, attempts: 3 })
  return toResultPage(data, page)
}

// Most popular products in a category, e.g. 'chocolates'.
export async function getPopularInCategory(category, { page = 1, country = '', signal } = {}) {
  const data = await getJson(buildSearchUrl({ category, country, page }), { signal, attempts: 3 })
  return toResultPage(data, page)
}

// Look up a single product by its barcode. This endpoint is much more
// reliable than search, so it powers the scanner and "classic fighters".
export async function getProduct(barcode, signal) {
  const code = String(barcode).trim()
  if (!/^\d{6,14}$/.test(code)) {
    throw new ApiError('A barcode should be 6–14 digits.', 400)
  }
  try {
    const data = await getJson(`${BASE_URL}/api/v2/product/${code}.json?fields=${FIELDS}`, { signal, attempts: 2 })
    if (data.status !== 1 || !data.product) throw new ApiError('Not found.', 404)
    return normalizeProduct(data.product)
  } catch (err) {
    if (err.status === 404) {
      throw new ApiError(`No snack found with barcode ${code}. It might not be in the database yet.`, 404)
    }
    throw err
  }
}

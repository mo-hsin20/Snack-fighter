// Approximate daily reference amounts for an adult, in grams.
// Shared by the battle engine (for the "did you know" facts) and the
// stats screen (for the charts), so both always use the same numbers.
// Sources: WHO guidance for sugar and salt, EU reference intakes for the rest.
export const DAILY_REFERENCE = {
  sugar: 50,
  salt: 5,
  fat: 70,
  saturatedFat: 20,
  protein: 50,
  fiber: 30,
}

// Labels and colours for each nutrient, used by charts and lists.
// "kind" says whether a lot of it is bad (limit) or good (boost).
export const NUTRIENTS = [
  { key: 'sugar', label: 'Sugar', emoji: '🍬', kind: 'limit' },
  { key: 'salt', label: 'Salt', emoji: '🧂', kind: 'limit' },
  { key: 'fat', label: 'Fat', emoji: '🧈', kind: 'limit' },
  { key: 'saturatedFat', label: 'Sat. fat', emoji: '🥓', kind: 'limit' },
  { key: 'protein', label: 'Protein', emoji: '💪', kind: 'boost' },
  { key: 'fiber', label: 'Fiber', emoji: '🌾', kind: 'boost' },
]

// How many % of the daily reference 100 g of the snack gives.
export function percentOfDaily(key, grams) {
  if (grams === null || grams === undefined) return null
  return Math.round((grams / DAILY_REFERENCE[key]) * 100)
}

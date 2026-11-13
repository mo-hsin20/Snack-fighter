// The game rules. This file has no React in it – it takes two snacks,
// plays the whole fight, and returns a list of "events" (one per turn).
// The Battle screen then replays those events with animations.
// Keeping rules and animations apart makes both easier to change.

import { DAILY_REFERENCE as DAILY_LIMIT } from './nutrition.js'

// Nutri-Score decides the base stats: healthier = more HP and better defense.
const GRADE_STATS = {
  a: { hp: 115, defense: 0.18 },
  b: { hp: 110, defense: 0.14 },
  c: { hp: 105, defense: 0.1 },
  d: { hp: 95, defense: 0.05 },
  e: { hp: 90, defense: 0 },
}
const UNKNOWN_GRADE = { hp: 100, defense: 0.1 }

const POISON_DAMAGE = 2        // per turn, for snacks with many additives
const POISON_ADDITIVES = 5     // this many additives or more = poisoned
const ULTRA_PROCESSED_EXTRA = 0.1 // NOVA 4 snacks take 10 % more damage
const CRIT_CHANCE = 0.15
const RAGE_THRESHOLD = 0.3     // below 30 % HP a fighter goes into RAGE…
const RAGE_BONUS = 0.35        // …and hits 35 % harder (comeback chance!)
const MAX_TURNS = 40

const round1 = (x) => Math.round(x * 10) / 10

// Build the list of attacks a snack can use, based on its nutrients.
// "Junk" attacks (sugar, salt, fat) hit hard but also hurt the attacker.
// "Healthy" attacks (protein, fiber) cost nothing.
// A snack only learns an attack if it has a meaningful amount of that
// nutrient (see MIN_AMOUNT) – a carrot shouldn't get "Salt Storm".
const MIN_AMOUNT = { sugar: 5, salt: 0.3, fat: 3, protein: 1, fiber: 1 } // grams per 100 g

function buildMoves(per100g) {
  const { sugar, salt, fat, protein, fiber } = per100g
  const moves = []

  if (sugar >= MIN_AMOUNT.sugar) moves.push({
    name: 'Sugar Rush', emoji: '🍬', type: 'sugar',
    power: 10 + Math.min(sugar, 60) * 0.5,
    selfCost: sugar * 0.08,
    fact: `${round1(sugar)} g sugar per 100 g = ${Math.round((sugar / DAILY_LIMIT.sugar) * 100)} % of a day's limit`,
  })
  if (salt >= MIN_AMOUNT.salt) moves.push({
    name: 'Salt Storm', emoji: '🧂', type: 'salt',
    power: 10 + Math.min(salt, 4) * 7,
    selfCost: salt * 1.2,
    fact: `${round1(salt)} g salt per 100 g = ${Math.round((salt / DAILY_LIMIT.salt) * 100)} % of a day's limit`,
  })
  if (fat >= MIN_AMOUNT.fat) moves.push({
    name: 'Fat Slam', emoji: '🧈', type: 'fat',
    power: 10 + Math.min(fat, 50) * 0.5,
    selfCost: fat * 0.06,
    fact: `${round1(fat)} g fat per 100 g = ${Math.round((fat / DAILY_LIMIT.fat) * 100)} % of a day's reference intake`,
  })
  if (protein >= MIN_AMOUNT.protein) moves.push({
    name: 'Protein Punch', emoji: '💪', type: 'protein',
    power: 11 + Math.min(protein, 40) * 0.7,
    selfCost: 0,
    fact: `${round1(protein)} g protein per 100 g – a clean hit, no self-damage`,
  })
  if (fiber >= MIN_AMOUNT.fiber) moves.push({
    name: 'Fiber Kick', emoji: '🌾', type: 'fiber',
    power: 11 + Math.min(fiber, 15) * 1.6,
    selfCost: 0,
    fact: `${round1(fiber)} g fiber per 100 g – a clean hit, no self-damage`,
  })

  // Every fighter has a weak basic attack, so it can always do something.
  moves.push({ name: 'Crumb Jab', emoji: '🍪', type: 'basic', power: 10, selfCost: 0, fact: 'A basic attack' })
  return moves
}

// Turn a snack (from the API) into a fighter with game stats.
export function buildFighter(snack) {
  const base = GRADE_STATS[snack.nutriScore] || UNKNOWN_GRADE
  return {
    snack,
    maxHp: base.hp + (snack.hpBonus ?? 0), // bosses in story mode get extra HP
    defense: base.defense,
    poisoned: snack.additives >= POISON_ADDITIVES,
    ultraProcessed: snack.nova === 4,
    greenShield: snack.ecoScore === 'a' || snack.ecoScore === 'b',
    moves: buildMoves(snack.per100g),
  }
}

// Pick a move at random, but stronger moves are picked more often.
// Exported because the computer opponent uses it in player-controlled fights.
export function chooseMove(moves, random = Math.random) {
  const total = moves.reduce((sum, m) => sum + m.power, 0)
  let roll = random() * total
  for (const move of moves) {
    roll -= move.power
    if (roll <= 0) return move
  }
  return moves[moves.length - 1]
}

// A battle is a small "state" object. Each turn takes the old state and
// returns a NEW one (it never changes the old object). That makes it safe
// to keep in React state, and the same code works for both:
//   - automatic fights (simulateBattle plays every turn at once), and
//   - player-controlled fights (the Arena calls playTurn once per click).
export function startBattle(leftSnack, rightSnack, random = Math.random) {
  const fighters = { left: buildFighter(leftSnack), right: buildFighter(rightSnack) }
  return {
    fighters,
    hp: { left: fighters.left.maxHp, right: fighters.right.maxHp },
    shieldUsed: { left: false, right: false },
    attacker: random() < 0.5 ? 'left' : 'right', // who moves next
    turn: 0,
    over: false,
    winner: null,
  }
}

// Play ONE turn. If `move` is not given, the attacker picks one itself.
// Returns { state, event }.
export function playTurn(state, move = null, random = Math.random) {
  const attacker = state.attacker
  const defender = attacker === 'left' ? 'right' : 'left'
  const atk = state.fighters[attacker]
  const def = state.fighters[defender]
  const hp = { ...state.hp }
  const shieldUsed = { ...state.shieldUsed }
  const turn = state.turn + 1
  const chosen = move ?? chooseMove(atk.moves, random)

  const crit = random() < CRIT_CHANCE
  const rage = hp[attacker] / atk.maxHp < RAGE_THRESHOLD
  let damage = chosen.power * (0.7 + random() * 0.6) // ±30 % variation
  if (crit) damage *= 1.8
  if (rage) damage *= 1 + RAGE_BONUS

  let blocked = false
  if (def.greenShield && !shieldUsed[defender]) {
    blocked = true            // Eco-Score shield blocks the first hit
    shieldUsed[defender] = true
    damage = 0
  } else {
    damage *= 1 - def.defense
    if (def.ultraProcessed) damage *= 1 + ULTRA_PROCESSED_EXTRA
  }
  damage = Math.round(damage)
  const selfDamage = Math.round(chosen.selfCost)
  const poison = atk.poisoned ? POISON_DAMAGE : 0

  hp[defender] = Math.max(0, hp[defender] - damage)
  // A knocked-out defender ends the fight before self-damage counts.
  const defenderStanding = hp[defender] > 0
  if (defenderStanding) hp[attacker] = Math.max(0, hp[attacker] - selfDamage - poison)

  const event = {
    turn, attacker, defender, move: chosen, damage, crit, blocked, rage,
    selfDamage: defenderStanding ? selfDamage : 0,
    poison: defenderStanding ? poison : 0,
    hp: { ...hp },
  }

  // Is the fight over? Someone at 0 HP, or the turn limit reached.
  let winner = null
  if (hp.right === 0) winner = 'left'
  else if (hp.left === 0) winner = 'right'
  else if (turn >= MAX_TURNS) {
    // Very rare: both survive. The larger share of health left wins.
    const share = (side) => hp[side] / state.fighters[side].maxHp
    winner = share('left') >= share('right') ? 'left' : 'right'
  }

  return {
    state: { ...state, hp, shieldUsed, turn, attacker: defender, over: winner !== null, winner },
    event,
  }
}

// Play a whole battle at once. `random` is a parameter (default Math.random)
// so the result can be made repeatable for testing.
export function simulateBattle(leftSnack, rightSnack, random = Math.random) {
  let state = startBattle(leftSnack, rightSnack, random)
  const events = []
  while (!state.over) {
    const result = playTurn(state, null, random)
    state = result.state
    events.push(result.event)
  }
  return { fighters: state.fighters, events, winner: state.winner }
}

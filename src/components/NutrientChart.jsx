import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ReferenceLine, ResponsiveContainer, CartesianGrid } from 'recharts'
import { NUTRIENTS, percentOfDaily } from '../game/nutrition.js'

const COLORS = { red: '#ff3b5c', blue: '#3b9bff' }

// Horizontal bar chart: how much of a day's reference amount
// 100 g of each snack contains. Works for one snack or two (compare mode).
// `entries` = [{ snack, color: 'red' | 'blue' }]
export default function NutrientChart({ entries }) {
  // Recharts wants one object per row, with one key per bar:
  // { label: 'Sugar', s0: 24, s1: 110, g0: 12, g1: 55 }
  const data = NUTRIENTS.map((n) => {
    const row = { label: `${n.emoji} ${n.label}` }
    entries.forEach(({ snack }, i) => {
      row[`s${i}`] = percentOfDaily(n.key, snack.per100g[n.key]) ?? 0
      row[`g${i}`] = snack.per100g[n.key]
    })
    return row
  })

  return (
    <>
      <div style={{ width: '100%', height: 340 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 22, left: 10, right: 20 }} accessibilityLayer>
            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,.1)" />
            <XAxis type="number" unit="%" stroke="#bbb" domain={[0, (max) => Math.max(100, Math.ceil(max / 25) * 25)]} />
            <YAxis type="category" dataKey="label" width={95} stroke="#bbb" />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,.05)' }}
              contentStyle={{ background: '#1e1033', border: '1px solid #555' }}
              formatter={(value, name, item) => {
                const i = item.dataKey.slice(1) // 's0' -> '0'
                const grams = item.payload[`g${i}`]
                return [`${value}% of daily (${grams ?? '?'} g)`, name]
              }}
            />
            {entries.length > 1 && <Legend />}
            <ReferenceLine x={100} stroke="#ffd23f" strokeDasharray="4 4" label={{ value: '1 day', fill: '#ffd23f', position: 'top' }} />
            {entries.map(({ snack, color }, i) => (
              <Bar key={snack.barcode} dataKey={`s${i}`} name={snack.name} fill={COLORS[color]} radius={[0, 4, 4, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* The same numbers as a table, for screen readers and exact values */}
      <details className="mt-2">
        <summary>Show as table</summary>
        <table className="table table-sm table-dark mt-2 mb-0">
          <thead>
            <tr>
              <th scope="col">Per 100 g</th>
              {entries.map(({ snack }) => <th key={snack.barcode} scope="col">{snack.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {NUTRIENTS.map((n, row) => (
              <tr key={n.key}>
                <th scope="row">{n.label}</th>
                {entries.map(({ snack }, i) => (
                  <td key={snack.barcode}>
                    {snack.per100g[n.key] ?? '?'} g ({data[row][`s${i}`]} %)
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  )
}

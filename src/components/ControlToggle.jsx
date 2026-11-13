import { useState } from 'react'
import { ButtonGroup, ToggleButton } from 'react-bootstrap'
import { getControl, setControl } from '../game/settings.js'

// Choose between picking your own moves and watching the fight.
// The choice is remembered for next time.
export default function ControlToggle({ id = 'control', onChange }) {
  const [value, setValue] = useState(getControl)

  function change(next) {
    setValue(next)
    setControl(next)
    onChange?.(next)
  }

  return (
    <ButtonGroup size="sm" aria-label="How do you want to fight?">
      {[['play', '🎮 I choose the moves'], ['watch', '📺 Just watch']].map(([v, label]) => (
        <ToggleButton
          key={v}
          id={`${id}-${v}`}
          type="radio"
          name={id}
          value={v}
          variant="outline-info"
          checked={value === v}
          onChange={() => change(v)}
        >
          {label}
        </ToggleButton>
      ))}
    </ButtonGroup>
  )
}

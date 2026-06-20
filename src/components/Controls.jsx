const PERIOD_OPTIONS = [
  { value: 'day',   label: '24ч' },
  { value: 'week',  label: '7д'  },
  { value: 'month', label: '30д' },
]

const FILTER_OPTIONS = [
  { value: 'all',         label: 'все'      },
  { value: '2.5',         label: '2.5+'     },
  { value: '4.5',         label: '4.5+'     },
  { value: 'significant', label: 'значимые' },
]

const MAP_MODE_OPTIONS = [
  { value: 'globe', label: 'Глобус' },
  { value: 'flat',  label: 'Карта'  },
]

function SegGroup({ options, value, onChange, label, displayLabel }) {
  return (
    <div className="ctrl-group">
      <span className="ctrl-group-label mono" aria-hidden="true">{displayLabel}</span>
      <div className="seg-group" role="group" aria-label={label}>
        {options.map(opt => (
          <button
            key={opt.value}
            className={`seg-btn mono${value === opt.value ? ' seg-btn--active' : ''}`}
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Controls({ filter, period, onFilterChange, onPeriodChange, mapMode, onMapModeChange }) {
  return (
    <div className="controls">
      <SegGroup
        options={MAP_MODE_OPTIONS}
        value={mapMode}
        onChange={onMapModeChange}
        label="Режим отображения"
        displayLabel="РЕЖИМ"
      />
      <SegGroup
        options={PERIOD_OPTIONS}
        value={period}
        onChange={onPeriodChange}
        label="Временной период"
        displayLabel="ПЕРИОД"
      />
      <SegGroup
        options={FILTER_OPTIONS}
        value={filter}
        onChange={onFilterChange}
        label="Минимальная магнитуда"
        displayLabel="МАГНИТУДА"
      />
    </div>
  )
}

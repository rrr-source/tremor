const PERIOD_OPTIONS = [
  { value: 'day',   label: '24ч' },
  { value: 'week',  label: '7д'  },
  { value: 'month', label: '30д' },
]

const FILTER_OPTIONS = [
  { value: 'all',         label: 'все'     },
  { value: '2.5',         label: '2.5+'    },
  { value: '4.5',         label: '4.5+'    },
  { value: 'significant', label: 'значимые' },
]

function SegGroup({ options, value, onChange, label }) {
  return (
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
  )
}

export function Controls({ filter, period, onFilterChange, onPeriodChange }) {
  return (
    <div className="controls">
      <SegGroup
        options={PERIOD_OPTIONS}
        value={period}
        onChange={onPeriodChange}
        label="Временной период"
      />
      <SegGroup
        options={FILTER_OPTIONS}
        value={filter}
        onChange={onFilterChange}
        label="Минимальная магнитуда"
      />
    </div>
  )
}

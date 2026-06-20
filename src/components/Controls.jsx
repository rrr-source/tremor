import { useTranslation } from '../i18n/context.jsx'

function SegGroup({ options, value, onChange, label, displayLabel, groupId }) {
  return (
    <div className={`ctrl-group${groupId ? ` ctrl-group--${groupId}` : ''}`}>
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
  const { t } = useTranslation()

  const mapModeOptions = [
    { value: 'globe', label: t('controls.globe') },
    { value: 'flat',  label: t('controls.map')   },
  ]

  const periodOptions = [
    { value: 'day',   label: t('controls.period_day')   },
    { value: 'week',  label: t('controls.period_week')  },
    { value: 'month', label: t('controls.period_month') },
  ]

  const filterOptions = [
    { value: 'all',         label: t('controls.filter_all')         },
    { value: '2.5',         label: '2.5+'                           },
    { value: '4.5',         label: '4.5+'                           },
    { value: 'significant', label: t('controls.filter_significant') },
  ]

  return (
    <div className="controls">
      <SegGroup
        options={mapModeOptions}
        value={mapMode}
        onChange={onMapModeChange}
        label={t('controls.mode_aria')}
        displayLabel={t('controls.mode_label')}
        groupId="mode"
      />
      <SegGroup
        options={periodOptions}
        value={period}
        onChange={onPeriodChange}
        label={t('controls.period_aria')}
        displayLabel={t('controls.period_label')}
        groupId="period"
      />
      <SegGroup
        options={filterOptions}
        value={filter}
        onChange={onFilterChange}
        label={t('controls.magnitude_aria')}
        displayLabel={t('controls.magnitude_label')}
        groupId="mag"
      />
    </div>
  )
}

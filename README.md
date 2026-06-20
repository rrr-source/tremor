# Tremor

A live world map of earthquakes — built around **human impact**, not just geology.

A magnitude 7.0 in the open ocean is a footnote. A 5.0 under a sleeping city is a disaster.
Tremor surfaces what most quake maps ignore: how deep it was, how many people actually
*felt* it, whether a tsunami was flagged, and how much energy that magnitude really
represents (because the scale is logarithmic and almost nobody reads it correctly).

Built on the public USGS real-time feeds. No API key, no tiles, no tracking.

![status](https://img.shields.io/badge/status-in%20development-orange)
![data](https://img.shields.io/badge/data-USGS%20live-blue)

---

## What it does

- **Live map.** Every quake in the selected window, plotted on an elegant dark world map.
  Marker size encodes magnitude, color encodes intensity. The newest events pulse.
  Switch between a flat Natural Earth projection and a draggable orthographic globe.
- **Read the event.** Click any quake for an instrument-style readout: place, local time and
  "how long ago", depth, magnitude, **felt reports** (USGS "Did You Feel It"), tsunami flag,
  and PAGER alert level.
- **Understand the number.** An energy bar translates magnitude into something physical —
  tons of TNT — and shows why +1 magnitude is ~32× more energy, not "a bit more".
- **Nearest to you.** One tap uses your location to find the closest recent quake and the
  distance to it.
- **Biggest right now.** A ranked list of the strongest events in view, synced with the map.
- **EN / RU interface.** Full English and Russian translations. Defaults to English; auto-detects
  Russian browsers. Toggle persists in the URL so shared links open in the right language.
- **Shareable links.** The Share button copies a URL that encodes the current filter, time
  window, map mode, language, and selected event — anyone opening it sees exactly the same view.

## Stack

| Concern        | Choice                                                        |
| -------------- | ------------------------------------------------------------ |
| Build / dev    | Vite + React 18 (JSX)                                         |
| Map            | `d3-geo` (Natural Earth + orthographic projections), SVG     |
| Geometry       | Natural Earth 110m land, pre-converted to GeoJSON & embedded |
| Styling        | Plain CSS with custom-property design tokens                 |
| Data           | USGS GeoJSON summary feeds (no key, CORS-enabled)            |

No map-tile provider and no API keys: the map draws itself from a 75 KB embedded GeoJSON,
so the whole thing runs offline except for the live quake feed.

## Getting started

Requires **Node 18+**.

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # production build to /dist
npm run preview  # serve the production build locally
```

## Project structure

```
src/
  main.jsx
  App.jsx
  data/
    land-110m.geo.json     # embedded world land geometry
  i18n/
    en.js                  # English strings (primary)
    ru.js                  # Russian strings
    context.jsx            # LangProvider, useTranslation, makeT/makePlural helpers
  lib/
    usgs.js                # feed URLs, fetch, normalize to a clean quake shape
    magnitude.js           # energy formula, TNT equivalent, color/radius scale
    geo.js                 # projection helpers, haversine distance
    urlState.js            # encode/decode app state in the URL query string
  hooks/
    useQuakes.js           # fetch + 60 s polling
    useGeolocation.js
    useRelativeTime.js
  components/
    Controls.jsx           # time window + magnitude filter + map-mode toggle
    LangToggle.jsx         # EN / RU language switcher
    ShareButton.jsx        # copy current URL to clipboard
    WorldMap.jsx           # d3-geo SVG map + quake markers + globe drag
    QuakeDetail.jsx        # selected-event instrument readout
    QuakeList.jsx          # "strongest now" ranked list
    EnergyBar.jsx          # magnitude → energy / TNT visual
    NearMeButton.jsx       # geolocation → nearest quake
    Legend.jsx
  styles/
    tokens.css             # colors, type, spacing (single source of truth)
    global.css
```

## Data

All seismic data comes from the **U.S. Geological Survey** real-time feeds
(`earthquake.usgs.gov/.../summary/*.geojson`). USGS data is in the public domain.
Land geometry is from **Natural Earth** (public domain) via the `world-atlas` package.

This product uses USGS data but is not endorsed by or affiliated with the USGS.

## Roadmap

**v1 — shipped**

- [x] Live map — USGS feed, 60 s polling, filter by magnitude and time window
- [x] Event detail — place, depth, local time, felt reports, tsunami flag, PAGER alert
- [x] Energy readout — joules → TNT, animated bar, Hiroshima reference
- [x] Nearest to me — one-tap geolocation, haversine distance, coordinates never stored
- [x] Biggest now — ranked list synced with the map, two-way selection
- [x] Globe mode — orthographic projection, drag to rotate, back-face culling
- [x] Shareable URL — filter, time window, map mode, selected event, and language all encoded in the query string
- [x] EN / RU i18n — English default, Russian auto-detected from browser, toggle persists in `?lang=`

**Known / planned**

- Mobile layout needs real-device testing before deploy (responsive CSS exists, untested on hardware)
- Sticky detail panel via `position: sticky` (currently the whole rail scrolls as one column)

**Later**

- Time scrubber — replay the last 24 h
- Population overlay to estimate human exposure

## License

Code: MIT. Data: USGS (public domain) and Natural Earth (public domain).

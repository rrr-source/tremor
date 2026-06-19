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
- **Read the event.** Click any quake for an instrument-style readout: place, local time and
  "how long ago", depth, magnitude, **felt reports** (USGS "Did You Feel It"), tsunami flag,
  and PAGER alert level.
- **Understand the number.** An energy bar translates magnitude into something physical —
  tons of TNT — and shows why +1 magnitude is ~32× more energy, not "a bit more".
- **Nearest to you.** One tap uses your location to find the closest recent quake and the
  distance to it.
- **Biggest right now.** A ranked list of the strongest events in view, synced with the map.

## Stack

| Concern        | Choice                                                        |
| -------------- | ------------------------------------------------------------ |
| Build / dev    | Vite + React 18 (JSX)                                         |
| Map            | `d3-geo` (Natural Earth projection), hand-rendered SVG       |
| Geometry       | Natural Earth 110m land, pre-converted to GeoJSON & embedded |
| Color / scale  | `d3-scale`                                                   |
| Pan / zoom     | `d3-zoom`                                                    |
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

Drop the provided `land-110m.geo.json` into `src/data/` before running (see PROMPTS.md, step 0).

## Project structure

```
src/
  main.jsx
  App.jsx
  data/
    land-110m.geo.json     # embedded world land geometry (provided)
  lib/
    usgs.js                # feed URLs, fetch, normalize to a clean quake shape
    magnitude.js           # energy formula, TNT equivalent, color scale, formatting
    geo.js                 # projection helpers, haversine distance
  hooks/
    useQuakes.js           # fetch + 60s polling + filter state
    useGeolocation.js
  components/
    Header.jsx             # title + live status + last-updated
    Controls.jsx           # time window + magnitude filter
    WorldMap.jsx           # d3-geo SVG map + quake markers + zoom
    QuakeDetail.jsx        # selected-event instrument readout
    QuakeList.jsx          # "biggest now"
    EnergyBar.jsx          # magnitude -> energy / TNT visual
    NearMeButton.jsx       # geolocation -> nearest quake
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

- [ ] v1: live map, detail readout, energy, near-me, biggest-now
- [ ] Globe mode (orthographic, drag to rotate)
- [ ] Time scrubber — replay the last 24h
- [ ] Population overlay to estimate human exposure
- [ ] Shareable deep-link per event

## License

Code: MIT. Data: USGS (public domain) and Natural Earth (public domain).

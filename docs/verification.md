# Verification record

Checked locally on 18 September 2026 after the sealed body/glazing and muted tread texture update.

## Passed

- Clean `npm ci` without force or legacy-peer-deps flags; some upstream Atlaskit peer ranges still target older React. Installation completes. `npm audit` reported zero known vulnerabilities at verification time.
- `npm run check`: ESLint, TypeScript, Vite production build, and **149 Vitest tests** passed.
- **9 Chromium browser tests passed against the built production site** using `TEST_PRODUCTION=1 npm run test:e2e` after `npm run build`.
- Browser coverage: visual selectors, five camera views, ADS toggle mouse/keyboard interaction, expanded view, local persistence, reset, exported JSON, versioned shared links and edits, corrupt state, blocked storage, phone-width overflow, clipboard refusal, WebGL context-loss fallback, and distinct rendered tread textures through size changes and stowing.
- Geometry raycast tests cover the former hood/wing gaps and glazing corners. Texture tests cover deterministic muted color data, color-space settings, physical repeat scale, and independent resource cleanup.
- Palette tests compare six product finishes and eighteen scene colors against the installed public ADS palette. Additional checks guard the neutral default, unchanged ramp accents, restrained clearcoat, and neutral fixed materials. Geometry tests cover finite normals, side contour, cabin taper, and crowned panels. Migration tests cover legacy unversioned/v1 stairs and ramp builds, strict version-two validation, and all 243 current configurations.
- Desktop and cargo-detail screenshots confirm the neutral body/trim presentation. Browser startup and cargo view checks returned no runtime errors.
- Browser inspection confirmed official light/typography/spacing/shape theme attributes and primary-button computed background `rgb(24, 104, 219)`, matching ADS `#1868DB`.
- Normal desktop browsing showed no console errors; the normal-flow test asserts no runtime page errors.
- Original `titan-app` Git working tree remained clean.

## Evidence

- [Desktop screenshot](images/configurator-desktop.png)
- [Mobile screenshot](images/configurator-mobile.png)
- [Sealed side view](images/sealed-side.png)
- [Sealed front view](images/sealed-front.png)
- [Muted cork surface](images/surface-cork.png)
- [Charcoal cushioned surface](images/surface-cushioned.png)
- [Retractable stowed view](images/retractable-stowed.png)
- Playwright's ignored `playwright-report/` contains its most recent report. Failed runs keep traces/screenshots during iteration.

## Caveats

- Vite warns about the greater-than-500-kB main UI and optional 3D chunks. Builds succeed; bundle/performance optimization remains future work.
- `@atlaskit/modal-dialog@16.6.6` failed browser startup in this React 19 setup. It is not shipped. A native modal with ADS tokens and real ADS controls is used instead; see [design-system details](design-system.md).
- ADS CommonJS icon leaf modules require a small default-export normalization adapter under Vite 8. Production and development browser checks verified retained icons.
- Chromium was tested; broader browser, assistive-technology, and low-power-device testing remain future work.
- Software verification does not establish mechanical feasibility, animal safety, sustainable sourcing, or supplier approval.
- Local checks above are separate from hosted GitHub Actions results. Private repository: [org-beaconstone/aerth-companion-configurator](https://github.com/org-beaconstone/aerth-companion-configurator). Hosted workflow status is available in the repository's Actions tab. Website hosting has not been deployed.

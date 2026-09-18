# Architecture and editing guide

React 19.2, TypeScript, Vite, Atlaskit, and a lazy-loaded React Three Fiber / Three.js studio. No backend or credentials.

## Product and state

Companion is **one integrated retractable pet ramp**. The UI has four categories: Size, Surface, Color, Materials. Vehicle paint is a studio control. `Configuration.type` is fixed to `retractable` for export compatibility, not a selectable design.

There are 243 concept configurations: 3 sizes × 3 surfaces × 3 ramp colors × 3 vehicle paints × 3 material directions. All combinations are allowed for exploration, not asserted as physically feasible.

`App` owns the configuration and transient category, camera, stow, expanded-view, and dialog state. Every build can stow/deploy. Prices retain the existing catalog rules, including the retractable construction in every build: default $880, range $780-$1,180 USD. All prices are illustrative and accessory-only.

## Source map

- `src/App.tsx`: four-category flow and build state.
- `src/components/BuildDialog.tsx`: native dialog with ADS controls; documented React 19 exception.
- `src/domain/configuration.ts`: catalogs, validation, price, export, and read-boundary migration.
- `src/design/palette.ts`: ADS product colors, neutral fixed materials, and physical finish settings.
- `src/components/VehicleViewer.tsx`: studio lights, filmic tone mapping, camera controls, fallback.
- `src/components/vehicle/Vehicle.tsx`: sculpted SUV, raised liftgate, real open cargo aperture.
- `src/components/vehicle/geometry.ts`: shared hood/cowl/roof/side boundaries, wheel-arch cutouts, solid cabin backing, mostly rectangular glazing, and trim paths.
- `src/components/vehicle/tread-textures.ts`: deterministic fine rubber grain and irregular cork granules, with physically scaled color and bump maps.
- `src/design/surfaces.ts`: muted material colors and matte surface properties, shared with swatches and fallback rendering.
- `src/components/vehicle/StudioEnvironment.tsx`: local PMREM softbox environment, no remote HDRI.
- `src/components/vehicle/Ramp.tsx`: one telescoping ramp, neutral tread textures, underfloor preview.

## Rendering

The generic SUV uses generated surface meshes rather than a stack of rectangular body panels: gently convex doors, rounded shoulders, tapered cabin, crowned bonnet and roof, rounded bumper ends, wheel wells, and curved tire profiles. Clearcoat paint and smoother glass respond to local softbox reflections. Neutral fixed materials keep the ramp accents visually distinct.

The environment is baked once per canvas setup with Three's PMREM generator. Its source geometry/materials are released after baking and its render target is disposed on cleanup. It is not a visible background. A directional key light supplies daylight-like form and soft ground shadows; neutral fill prevents a green color cast. ACES filmic tone mapping rolls off highlights.

`Vehicle` is memoized across accessory-only changes. The canvas renders on demand while idle, and requests frames for camera damping, drag/zoom, or stow transitions. Small trim components use lower rounded-box subdivisions than larger body parts. DPR is capped at 1.5. These choices reduce unnecessary GPU work; this is not a formal performance benchmark.

The open liftgate and cargo floor remain visible. Ramp dimensions read directly from `SIZES`, converted from centimeters to scene meters. Stow is an illustrative telescoping transition, not validated engineering or a crash-tested retention mechanism. WebGL context loss shows a clearly labeled simplified rear SVG, not live 3D.

This remains an original procedural concept model. It is more detailed than the first version but is not manufacturer CAD, photogrammetry, or a licensed photorealistic asset.

## Persistence and migration

- Storage key: `aerth_configuration`.
- New storage and URL payloads: `{ version: 2, configuration: { ... } }`.
- v2 strictly requires `type: 'retractable'`.
- Legacy unversioned/v1 configurations accept known historical `ramp` or `steps` IDs and migrate them to `retractable`, preserving every other valid selection.
- Unknown versions, missing/invalid selections, and unknown type IDs are rejected.
- A shared `?build=` payload wins on initial load. Editing removes the snapshot parameter so subsequent reloads use the edited stored build.
- Blocked localStorage falls back to session-only changes. Clipboard refusal opens a selectable URL. JSON export is a build summary, not an order, quote, safety approval, or CAD file.

## Editing and verification

Keep the cargo floor/ramp interface aligned when changing vehicle geometry. Ramp length must exceed the sill height. Do not add retired designs back as options. Preserve material caveats and ADS provenance. See [design system](design-system.md).

```bash
npm run check
npm run test:e2e
TEST_PRODUCTION=1 npm run test:e2e   # after npm run build
```

Tests cover the fixed product, legacy migration, all 243 configurations, color provenance, geometric surface properties, stow controls, view changes, persistence/sharing/download, storage and WebGL failures, and mobile overflow. GitHub Actions runs `npm run check` and the production browser suite, and retains build/report artifacts. The optional Bitbucket pipeline runs `npm run check`. Neither deploys the website.

The UI and 3D bundles exceed Vite's 500-kB advisory threshold. Builds pass; broader device profiling and bundling work remain appropriate before production. Browser/accessibility checks do not establish certification. No analytics, secrets, customer data, or external font/HDRI requests are introduced.

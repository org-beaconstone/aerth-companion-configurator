# AERTH implementation constraints

- Use official Atlassian Design System (Atlaskit) components wherever they fit the interaction. Preserve the automotive split-screen layout and original unbranded SUV.
- Use semantic ADS tokens for interface colors, typography, focus states, spacing, and shape. Do not override Atlaskit component internals with global CSS.
- Fixed 3D product finishes are defined in `src/design/palette.ts`, not scattered through interface code. Verify palette names and values against the installed `@atlaskit/tokens/palette` artifact. Include provenance in the Color panel and exported build.
- Offer only the integrated retractable pet ramp. Preserve size, surface, color, material and paint selections when migrating older ramp/steps builds.
- Keep the vehicle visually secondary to the ramp: neutral trim and cargo bed, Chalk default, and ramp accents carry the color. Sculpted panels, restrained clearcoat reflections, realistic glass and soft directional shadows should give the SUV believable shape without vivid trim colors or mirror-like paint. Preserve saved paint selections instead of resetting a user's build.
- Keep cabin glazing mostly rectangular with only small corner radii and opaque backing; shared hood/cowl/roof/side boundaries must not reveal daylight. Keep the rear cargo opening intentional.
- Keep ribbed tread as the established reference. Cushioned is matte charcoal with fine grain; cork is muted brown with irregular granules, not bright beige or a polka-dot pattern. Shared material inputs live in `src/design/surfaces.ts`.
- Keep texture/geometry/material illustration colors distinct from semantic UI status colors. Product finishes are conceptual, not manufactured paint specifications.
- Document intentional custom components and package incompatibilities in `docs/design-system.md`. Native dialog is an intentional React 19 compatibility exception.
- Test changes with `npm run check` and `npm run test:e2e`; use `TEST_PRODUCTION=1 npm run test:e2e` after building to verify production interop too.
- Do not modify the sibling `titan-app`. Do not create/push a remote without the confirmed workspace/project destination.

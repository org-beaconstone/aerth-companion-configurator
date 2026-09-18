# Atlassian Design System input

Use ADS wherever the product interaction can use a standard control. Keep the automotive split-screen layout, original SUV, open tailgate, live ramp visualization, and configurable product cards. This is a fictional AERTH experience built with ADS, not an official Atlassian product or an ADS certification.

## Official components

- `@atlaskit/button/default/button`: primary, secondary, and subtle actions.
- `@atlaskit/button/icon/button` and `@atlaskit/icon/core/*`: expand, camera arrows, next/back, reset, download, share, and close controls.
- `@atlaskit/toggle`: retractable stow/deploy input.
- `@atlaskit/lozenge`: concept-studio status.
- `@atlaskit/textfield`: selectable share-link field.
- `@atlaskit/section-message`: material-validation warning.
- `@atlaskit/css-reset`, `@atlaskit/tokens/set-global-theme`: official reset and light color, spacing, shape, typography themes, loaded from installed packages.

`main.tsx` initializes the light theme before rendering. The fixed light theme keeps rehearsal appearance independent of OS settings. The typography token supplies a local system-font fallback; no Google Fonts request remains. This does not bundle the Atlassian Sans font files.

## Semantic UI tokens

Custom layout styling uses `--ds-text`, `--ds-text-subtle`, `--ds-text-subtlest`, `--ds-surface`, `--ds-background-selected`, `--ds-border-selected`, `--ds-background-brand-bold`, and focus, spacing, radius, and typography tokens.

Use semantic tokens for interface meaning. Do not use product finish colors for error, warning, or primary-action semantics. Product-owned CSS must not override Atlaskit component internals. `src/design/ads-layout.css` provides layout wrappers and the native dialog's token-based surface.

## Fixed product finishes

`src/design/palette.ts` is the editable input for vehicle and ramp colors. It contains literal sRGB values because Three.js material colors cannot consume CSS variables. Palette names and values are checked against the public `@atlaskit/tokens/palette` export in the installed **18.2.0** package.

| Product choice   | ADS palette | Hex       |
| ---------------- | ----------- | --------- |
| Canyon red       | Red700      | `#C9372C` |
| Ocean blue       | Blue700     | `#1868DB` |
| Solar yellow     | Yellow300   | `#EED12B` |
| Sage vehicle     | Green800    | `#216E4E` |
| Chalk vehicle    | Neutral300  | `#DDDEE1` |
| Graphite vehicle | Neutral800  | `#505258` |

The yellow swatch uses dark foreground instead of white for contrast. These are visual concept finishes, not manufactured paint or material specifications. Existing color IDs stay stable for saved configurations. The Color panel displays the chosen palette name and hex; exported JSON includes `designSystem` and `finishes` metadata.

Run `npm test` after editing the palette. On a token-package update, review palette names and source version rather than silently accepting changed colors.

## Accessory-first vehicle presentation

The car is a supporting context, not the visual hero. New builds and Reset use Chalk in ADS Neutral300 with restrained clearcoat (`#DDDEE1`). Existing saved paint selections and shared builds are preserved; select Chalk to switch an existing build without resetting its accessory choices.

`SCENE_PALETTE` and `VEHICLE_FINISH` in `src/design/palette.ts` define neutral gray trim, seats, cargo floor, mat, wheels, hardware, grip surfaces, and soft studio light colors. Trim and interior share Neutral600; the cargo mat and detail hardware use nearby Neutral500. Tires and glazing remain darker enough to read as a car. The body uses a restrained automotive clearcoat to reveal curvature. Glass is smoother, hardware has modest metallic reflections, and trim/interior remain low-sheen. Directional shadows and a locally generated softbox environment provide depth without colored lighting. Taillights retain a subdued functional red and cork keeps its material texture.

The lighting and studio backdrop no longer cast green onto the model. Ramp accent finishes are unchanged. The simplified fallback preview follows the same neutral palette. Preserve this visual hierarchy when changing the scene.

## Deliberate custom pieces

- Vehicle and ramp geometry, lighting, physically suggestive textures, and original brand mark.
- Accessory cards, paint/color swatches, category navigation, and camera preset selectors, styled with ADS tokens.
- Native HTML dialog with ADS buttons/textfield/section message inside. `@atlaskit/modal-dialog@16.6.6` failed browser startup under React 19.2 due to a transitive older React renderer (`ReactCurrentDispatcher` error). It was removed instead of patching dependency internals or forcing React versions. The native modal supplies browser focus trapping and Escape handling.

This is not a complete conversion to every ADS component. Where the interaction is automotive-specific or a current package is incompatible, the custom component uses the shared design system and its exception is documented here.

## Local integration details

`src/design/platform.ts` sets the public ADS boolean feature-flag resolver to local defaults. No Atlassian feature-gate service or credentials are used. `src/design/icons.ts` normalizes the extra CommonJS default wrapper seen in Vite 8 development; the unchanged official icon component is rendered. Vite deduplicates React and React DOM. Some upstream ADS transitive dependencies declare older React peer ranges, so npm may warn; clean install and production browser tests are required before accepting upgrades.

## Reference

- https://atlassian.design/components
- https://atlassian.design/foundations/color
- https://atlassian.design/tokens/design-tokens

Installed package artifacts, not recollected older palette names, are the source for the values above.

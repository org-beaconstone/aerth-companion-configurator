# Keynote rehearsal runbook

## Before the session

1. Run `npm ci` once, then `npm run dev`. Open http://127.0.0.1:5174/ in a WebGL-capable desktop browser.
2. Prefer a 1440 × 960 or larger window. Reset the build and use the rear three-quarter view.
3. Wait for the original SUV to render. Check that the tailgate is raised and the medium blue ramp reaches the ground.
4. Keep the browser zoom at 100%. Test stow/deploy once, then reset again.
5. Preload the app. It has no runtime data API or remote font request; ADS typography has a local system fallback.

## Suggested 45-60 second walkthrough

- **Frame the change:** “One SUV, with a new way to welcome the companions who come along.” Point to the open tailgate and ramp.
- **Size:** choose Large. The width and extended length change on the vehicle, not just in the card.
- **Integrated product:** there is no Design choice. Toggle **Stow retractable ramp** on. The camera moves to cargo detail and the ramp withdraws beneath the modeled floor. Toggle it off to deploy again.
- **Surface:** choose Cork touch to make the visual material change obvious.
- **Color:** choose Canyon red or Solar yellow. Return to **Rear three-quarter view** for the full composition.
- **Materials:** briefly show the three candidate directions. Say “proposed materials to review,” not “approved” or “pet-safe.”
- **Your build:** open the persistent footer button. Show the selected options and download the JSON build if useful for the story.
- Close the summary and reset before the next rehearsal.

The timing is a suggested rehearsal target, not a measured speaking-time guarantee. For a shorter cut, show only size, color, and retractable stow.

## Presenter notes

- AERTH is a provisional fictional brand. There is one original, unbranded SUV.
- This is a working website, not a live Planner/Figma/Canva integration.
- The model is stylized rather than photorealistic. It demonstrates the configuration behavior.
- Material selection updates the proposed spec and fictional price; surface selection controls the visible texture.
- The dimensions, underfloor packaging, price, and lock icon are conceptual. No animal load rating or safety certification is represented.
- There is no order submission. “Download build” produces JSON, not a quote or engineering approval.

## Recovery

- **Need a clean start:** click Reset build. This also clears a shared-build URL parameter, but does not clear unrelated browser data.
- **View drifted after dragging:** select a camera view button again, or choose a different view and return.
- **Need a larger studio:** use Expand vehicle view. Escape exits expanded view and closes an open dialog.
- **Clipboard permission blocked:** the app opens a selectable build URL instead. A localhost link only works where the app is running.
- **Storage blocked:** the app still works for the session and shows a storage warning.
- **3D fails:** a clearly labeled rear SVG preview appears. Reload or use a browser with WebGL enabled for the full five-view experience. Do not describe the fallback as live 3D.

## Follow-up inputs

Approved brand name and palette, a licensed photorealistic SUV asset if desired, the exact Bitbucket workspace/project, and the intended hosting/access policy. These are not assumed by the prototype.

# GitHub → Kaizen deployment

## Live site

https://aerth-companion-configurator.kaizen.shared.atlassian-3p.com/

The user approved a new project and unauthenticated access for this fictional product demo. No visitor login, customer data, or secrets are served. Source repository visibility is managed separately from live-site access.

## Build and promotion flow

1. A push to `main`, a pull request, or manual workflow dispatch starts `.github/workflows/ci.yml`.
2. `verify` installs locked dependencies, lints, compiles, builds, runs unit tests, and tests the production bundle with Chromium.
3. Only successful `main` pushes or manual runs on `main` call the reusable `.github/workflows/deploy.yml`.
4. The publishing job installs the exact Kaizen version from `kaizen.toml`, verifies that version, and runs:

   ```bash
   kaizen deploy push --project-dir . --auto-promote \
     --auth-source oidc --oidc-provider github --oidc-preflight \
     --oidc-audience https://kaizen.internal.atlassian.com
   ```

5. Kaizen rebuilds the same checked-out source, uploads static `dist/` assets, and promotes the configured alias.
6. The workflow checks that the live URL serves the AERTH page and writes its link and source commit to the run summary.

Pull requests, feature branches, forks, and failed tests do not promote the site. Production promotions are serialized and are not cancelled mid-operation. GitHub may coalesce pending runs when newer commits arrive; this is continuous delivery of the latest successful main build, not a historical release archive for every intermediate commit.

## Identity and configuration

- Project: `prj_aa7bead0e05743a6bbc5c13c8d733a1e` (AERTH Companion Configurator).
- GitHub owner: `org-beaconstone`, numeric ID `276802635`.
- Repository: `org-beaconstone/aerth-companion-configurator`, numeric ID `1376435345`.
- Required branch: `refs/heads/main`.
- Required signed workflow reference: `org-beaconstone/aerth-companion-configurator/.github/workflows/deploy.yml@refs/heads/main`.
- OIDC audience: `https://kaizen.internal.atlassian.com`.
- Grant: `oidc_b110426d22f3ea6dfbd65ad80d7b02cc`, production publish scope.
- CLI: `0.1.1530`, pinned in `kaizen.toml` and read by CI.

The reusable workflow is intentional: GitHub includes `job_workflow_ref` for the called workflow, which Kaizen checks. The numeric IDs and branch restrictions remain mandatory. No long-lived credential is stored in repository secrets. Do not print or persist OIDC tokens.

## Hosting details

- `outputDirectory = "dist"` and `buildCommand = "npm run build"`.
- `defaultTarget = "preview"` is deliberate. The gateway reserves `production` for promotion; `--auto-promote` activates production after upload.
- No catch-all rewrite is needed for this app. The current gateway refuses after-files rewrites pending its rollout. Do not bypass that safeguard with a rollout environment variable.
- The CSP permits same-origin scripts without `unsafe-eval`; inline styles remain necessary for ADS and the scene layout. A fresh hosted-browser session verified the renderer, color selection, and summary with this policy.
- Frame embedding is denied, cross-origin resource policy is same-origin, and CORS is disabled.
- Never hand-edit `.kaizen/output`, commit it, or package the repository root as website content.

## CI WebGL

GitHub's Linux runner uses software-rendered WebGL. The original parallel runs stalled during shader startup. CI now uses one worker, a 30-second assertion deadline, and a 120-second per-test deadline. Local interactive defaults are unchanged; no tests or assertions are skipped.

## Manual operations

After changing source, use the GitHub workflow. A human-authorized recovery deployment can run:

```bash
kaizen auth login
npm ci
npm run check
kaizen doctor --project-dir . --check-control
kaizen deploy push --project-dir . --auto-promote
```

Inspect the existing project before changes. Preserve `projectId` and alias ownership. Do not add weakening flags or remove access restrictions to bypass a refusal. A failed deploy leaves the previously promoted page active.

To redeploy without a code change, run the **Build, test and deploy** workflow on `main`. To investigate, inspect GitHub Actions plus `kaizen project inspect <project-id> --json` and the returned deployment's status/events. Verify the intended live host after a promotion.

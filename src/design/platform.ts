import { setBooleanFeatureFlagResolver } from '@atlaskit/platform-feature-flags';

// This standalone prototype has no Atlassian feature-gate client. Use the ADS
// components' default code paths locally; do not initialize a remote service.
setBooleanFeatureFlagResolver(() => false);

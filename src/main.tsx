import './design/platform';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setGlobalTheme } from '@atlaskit/tokens/set-global-theme';
import '@atlaskit/css-reset';
import App from './App';
import './styles.css';
import './design/ads-layout.css';

// Load official local theme artifacts before rendering to avoid an unthemed flash.
// A fixed light studio keeps keynote rehearsals independent of OS preferences.
async function start() {
  await setGlobalTheme({
    colorMode: 'light',
    light: 'light',
    dark: 'dark',
    spacing: 'spacing',
    typography: 'typography',
    shape: 'shape',
  });
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
void start();

import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import Button from '@atlaskit/button/default/button';
import IconButton from '@atlaskit/button/icon/button';
import Toggle from '@atlaskit/toggle';
import Lozenge from '@atlaskit/lozenge';
import BuildDialog from './components/BuildDialog';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CrossIcon,
  UndoIcon,
  ExpandIcon,
  LinkExternalIcon,
} from './design/icons';
import { token } from '@atlaskit/tokens';
import { TREAD_SURFACES } from './design/surfaces';
import { Check, Leaf, LockKeyhole, Mountain, PawPrint, Ruler } from 'lucide-react';
import {
  COATINGS,
  COLORS,
  DEFAULT_CONFIG,
  MATERIALS,
  SIZES,
  TYPES,
  VEHICLE_COLORS,
  buildSpecification,
  buildUrl,
  configurationFromSearch,
  formatPrice,
  loadConfiguration,
  priceFor,
  saveConfiguration,
  type Configuration,
} from './domain/configuration';
import type { VehicleViewerProps } from './components/VehicleViewer';

const VehicleViewer = lazy(() => import('./components/VehicleViewer'));
const CATEGORIES = ['Size', 'Surface', 'Color', 'Materials'] as const;
type Category = (typeof CATEGORIES)[number];
type View = VehicleViewerProps['view'];
const VIEWS: { id: View; label: string; short: string }[] = [
  { id: 'three-quarter', label: 'Rear three-quarter', short: '01' },
  { id: 'rear', label: 'Rear', short: '02' },
  { id: 'side', label: 'Side profile', short: '03' },
  { id: 'cargo', label: 'Cargo detail', short: '04' },
  { id: 'front', label: 'Front three-quarter', short: '05' },
];
const categoryText: Record<Category, { title: string; text: string }> = {
  Size: {
    title: 'Room for every companion.',
    text: 'Choose a little more room for little paws. Or a wider welcome for your biggest adventurer.',
  },
  Surface: {
    title: 'A considered first step.',
    text: 'Explore three distinct textures. Each surface is a candidate for grip, wear, and pet-contact testing.',
  },
  Color: {
    title: 'A little personality.',
    text: 'Earth-inspired tones, made to complement your vehicle. Color is applied to the ramp frame and edge rails.',
  },
  Materials: {
    title: 'Better by consideration.',
    text: 'Three material directions to explore. Designed around replaceable parts and thoughtful sourcing.',
  },
};

export default function App() {
  const [config, setConfig] = useState<Configuration>(
    () => configurationFromSearch(window.location.search) ?? loadConfiguration()
  );
  const [category, setCategory] = useState<Category>('Size');
  const [view, setView] = useState<View>('three-quarter');
  const [stowed, setStowed] = useState(false);
  const [showRamp, setShowRamp] = useState(false);
  const [focus, setFocus] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState<'summary' | 'about' | 'share' | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    setStorageOk(saveConfiguration(config));
  }, [config]);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(id);
  }, [notice]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFocus(false);
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);

  const update = <K extends keyof Configuration>(key: K, value: Configuration[K]) => {
    setConfig(current => ({ ...current, [key]: value }));
    // A shared URL is an initial snapshot, not a live source of truth after edits.
    if (new URLSearchParams(window.location.search).has('build')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('build');
      window.history.replaceState(null, '', url);
    }
  };
  const reset = () => {
    setConfig({ ...DEFAULT_CONFIG });
    setCategory('Size');
    setStowed(false);
    setShowRamp(false);
    setView('three-quarter');
    const url = new URL(window.location.href);
    url.searchParams.delete('build');
    window.history.replaceState(null, '', url);
    setNotice('Your build is back to the starting configuration.');
  };
  const download = () => {
    const blob = new Blob([JSON.stringify(buildSpecification(config), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aerth-companion-build.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Your build specification has been downloaded.');
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(buildUrl(config, window.location.href));
      setNotice('Build link copied. Anyone with the app can open this configuration.');
    } catch {
      setModal('share');
    }
  };
  const size = SIZES.find(item => item.id === config.size)!;
  const type = TYPES.find(item => item.id === config.type)!;
  const color = COLORS.find(item => item.id === config.color)!;
  const vehicleColor = VEHICLE_COLORS.find(item => item.id === config.vehicleColor)!;
  const material = MATERIALS.find(item => item.id === config.material)!;
  const currentIndex = CATEGORIES.indexOf(category);
  const price = priceFor(config);
  const switchCategory = (next: Category) => {
    setCategory(next);
  };
  const next = () => {
    if (currentIndex === CATEGORIES.length - 1) setModal('summary');
    else {
      setCategory(CATEGORIES[currentIndex + 1]);
      window.requestAnimationFrame(() => headingRef.current?.focus());
    }
  };

  return (
    <div className={`configurator ${focus ? 'viewer-focused' : ''}`}>
      <a href="#configuration-panel" className="skip-link">
        Skip to configuration
      </a>
      <header className="site-header">
        <a className="brand" href={window.location.pathname} aria-label="AERTH home">
          <Mountain size={25} strokeWidth={1.6} />
          <span>AERTH</span>
        </a>
        <div className="header-divider" />
        <span className="header-descriptor">GO FURTHER. TOGETHER.</span>
        <nav className="header-nav" aria-label="Main navigation">
          <span className="ads-action">
            <Button
              appearance="subtle"
              iconAfter={LinkExternalIcon}
              onClick={() => setModal('about')}
            >
              Our approach
            </Button>
          </span>
          <span className="concept-label">
            <Lozenge appearance="inprogress">ADS concept studio</Lozenge>
          </span>
        </nav>
      </header>

      <div className="journey-bar">
        <div className="journey-title">
          <span>01</span> AERTH ONE <span className="model-tag">ONE SUV. EVERY ADVENTURE.</span>
        </div>
        <div className="journey-steps">
          <span>
            <Check size={13} /> Your vehicle
          </span>
          <b>
            <span className="step-dot">2</span> Pet accessories
          </b>
          <button onClick={() => setModal('summary')}>
            <span className="step-dot">3</span> Your build
          </button>
        </div>
      </div>

      <main className="builder">
        <section className="visual-stage" aria-label="Interactive vehicle studio">
          <div className="stage-heading">
            <div>
              <div className="eyebrow">THE COMPANION COLLECTION</div>
              <h1>
                Every adventure.
                <br />
                <em>Everyone aboard.</em>
              </h1>
              <p>A considered way up for your closest companion.</p>
            </div>
            <span className="ads-action expand-button">
              <IconButton
                appearance="subtle"
                shape="circle"
                icon={focus ? CrossIcon : ExpandIcon}
                label={focus ? 'Exit expanded view' : 'Expand vehicle view'}
                onClick={() => setFocus(value => !value)}
              />
            </span>
          </div>
          <div className="studio-watermark" aria-hidden="true">
            AERTH ONE
          </div>
          <div className="vehicle-canvas">
            <Suspense fallback={<div className="viewer-loading">Preparing your studio…</div>}>
              <VehicleViewer
                size={config.size}
                type={config.type}
                coating={config.coating}
                color={color.hex}
                vehicleColor={vehicleColor.hex}
                stowed={stowed}
                showRamp={showRamp}
                view={view}
              />
            </Suspense>
          </div>
          <div className="stage-top-note">
            <span className="live-dot" /> LIVE 3D CONFIGURATION
          </div>
          <div className="stage-callout">
            <PawPrint size={17} />
            <div>
              <strong>{showRamp && stowed ? 'Space for what matters.' : 'A welcome at every height.'}</strong>
              <span>
                {showRamp && stowed
                  ? 'Underfloor stow concept • cargo floor kept clear'
                  : 'Open tailgate • one original, unbranded SUV'}
              </span>
            </div>
          </div>
          <div className="studio-bottom">
            <div className="view-toolbar">
              <div className="camera-counter">
                <span>{String(VIEWS.findIndex(v => v.id === view) + 1).padStart(2, '0')}</span> / 05
              </div>
              <div className="view-buttons" role="group" aria-label="Camera views">
                {VIEWS.map(v => (
                  <button
                    key={v.id}
                    aria-label={`${v.label} view`}
                    aria-pressed={view === v.id}
                    onClick={() => setView(v.id)}
                  >
                    <span>{v.short}</span>
                    {v.label}
                  </button>
                ))}
              </div>
              <div className="view-arrows ads-action">
                <IconButton
                  appearance="subtle"
                  spacing="compact"
                  icon={ChevronLeftIcon}
                  label="Previous camera view"
                  onClick={() =>
                    setView(
                      VIEWS[(VIEWS.findIndex(v => v.id === view) + VIEWS.length - 1) % VIEWS.length]
                        .id
                    )
                  }
                />
                <IconButton
                  appearance="subtle"
                  spacing="compact"
                  icon={ChevronRightIcon}
                  label="Next camera view"
                  onClick={() =>
                    setView(VIEWS[(VIEWS.findIndex(v => v.id === view) + 1) % VIEWS.length].id)
                  }
                />
              </div>
            </div>
            <div className="studio-settings">
              <span className="orbit-hint">Drag to rotate · Scroll to zoom</span>
              <div className="paint-picker" role="group" aria-label="Vehicle paint">
                <span>
                  VEHICLE <b>{vehicleColor.label}</b>
                </span>
                {VEHICLE_COLORS.map(paint => (
                  <button
                    key={paint.id}
                    className="paint-dot"
                    style={{ '--swatch': paint.hex } as CSSProperties}
                    aria-label={`${paint.label} vehicle paint`}
                    aria-pressed={config.vehicleColor === paint.id}
                    title={paint.label}
                    onClick={() => update('vehicleColor', paint.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="configuration-panel"
          id="configuration-panel"
          aria-label="Configure your pet accessory"
        >
          <div className="product-heading">
            <div className="eyebrow">
              <PawPrint size={14} /> MADE FOR YOUR PLUS ONE
            </div>
            <div className="product-title">
              <h2>Companion</h2>
              <span>01 / PET ACCESSORIES</span>
            </div>
            <p className="product-subtitle">Integrated retractable pet ramp</p>
            <p>The way to your next shared adventure.</p>
          </div>
          <nav className="category-tabs" aria-label="Configuration categories">
            {CATEGORIES.map((item, index) => (
              <button
                key={item}
                aria-current={category === item ? 'step' : undefined}
                onClick={() => switchCategory(item)}
              >
                <span>0{index + 1}</span>
                {item}
              </button>
            ))}
          </nav>
          <div className="options-scroll">
            <div className="section-intro">
              <span className="eyebrow">
                0{currentIndex + 1} / {category.toUpperCase()}
              </span>
              <h3 ref={headingRef} tabIndex={-1}>
                {categoryText[category].title}
              </h3>
              <p>{categoryText[category].text}</p>
            </div>
            {category === 'Size' && (
              <div className="option-list" role="group" aria-label="Ramp size">
                {SIZES.map((item, index) => (
                  <button
                    className={`option-card size-card ${config.size === item.id ? 'selected' : ''}`}
                    key={item.id}
                    aria-pressed={config.size === item.id}
                    onClick={() => update('size', item.id)}
                  >
                    <div className={`pet-size pet-size-${item.id}`}>
                      <PawPrint size={23 + index * 6} strokeWidth={1.4} />
                    </div>
                    <div className="option-copy">
                      <strong>
                        {item.label}
                        <span>{item.id === 'medium' ? 'THE EVERYDAY FAVORITE' : ''}</span>
                      </strong>
                      <p>{item.description}</p>
                      <small>
                        {item.width} cm wide · {item.length} cm extended
                      </small>
                    </div>
                    <span className="selection-indicator">
                      {config.size === item.id && <Check size={13} />}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {category === 'Surface' && (
              <div className="option-list" role="group" aria-label="Ramp surface">
                {COATINGS.map(item => (
                  <button
                    key={item.id}
                    className={`option-card ${config.coating === item.id ? 'selected' : ''}`}
                    aria-pressed={config.coating === item.id}
                    onClick={() => update('coating', item.id)}
                  >
                    <span
                      className={`surface-sample surface-${item.id}`}
                      style={
                        {
                          '--tread-base': TREAD_SURFACES[item.id].base,
                          '--tread-shadow': TREAD_SURFACES[item.id].shadow,
                          '--tread-grain': TREAD_SURFACES[item.id].grain,
                        } as CSSProperties
                      }
                    />
                    <div className="option-copy">
                      <strong>{item.label}</strong>
                      <p>{item.description}</p>
                      <small>{item.price ? `+${formatPrice(item.price)}` : 'Included'}</small>
                    </div>
                    <span className="selection-indicator">
                      {config.coating === item.id && <Check size={13} />}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {category === 'Color' && (
              <>
                <div className="color-options" role="group" aria-label="Ramp accent color">
                  {COLORS.map(item => (
                    <button
                      key={item.id}
                      aria-pressed={config.color === item.id}
                      className={`color-option ${config.color === item.id ? 'selected' : ''}`}
                      onClick={() => update('color', item.id)}
                    >
                      <span
                        className="color-sample"
                        style={{ background: item.hex, color: item.foreground }}
                      >
                        {config.color === item.id && <Check size={22} />}
                      </span>
                      <strong>{item.label}</strong>
                      <span>Included</span>
                    </button>
                  ))}
                </div>
                <div className="palette-card">
                  <span className="eyebrow">ATLASSIAN DESIGN SYSTEM PALETTE</span>
                  <div className="palette-stripe">
                    {[
                      vehicleColor.hex,
                      token('color.background.brand.bold'),
                      color.hex,
                      token('color.background.neutral'),
                      token('elevation.surface'),
                    ].map((hex, index) => (
                      <i key={index} style={{ background: hex }} />
                    ))}
                  </div>
                  <p>
                    {color.label} uses ADS {color.palette} ({color.hex}). Vehicle finish:{' '}
                    {vehicleColor.palette} ({vehicleColor.hex}).
                  </p>
                  <p className="ads-design-note">
                    The interface uses semantic ADS tokens. Product finishes use fixed ADS palette
                    values so the car and ramp stay consistent across views and exports.
                  </p>
                </div>
              </>
            )}
            {category === 'Materials' && (
              <>
                <div className="option-list" role="group" aria-label="Material direction">
                  {MATERIALS.map(item => (
                    <button
                      key={item.id}
                      aria-pressed={config.material === item.id}
                      className={`option-card material-card ${config.material === item.id ? 'selected' : ''}`}
                      onClick={() => update('material', item.id)}
                    >
                      <Leaf size={22} strokeWidth={1.4} />
                      <div className="option-copy">
                        <strong>{item.label}</strong>
                        <p>{item.detail}</p>
                        <small>
                          {item.price ? `+${formatPrice(item.price)}` : 'Included'} · Candidate
                          material
                        </small>
                      </div>
                      <span className="selection-indicator">
                        {config.material === item.id && <Check size={13} />}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="material-caveat">
                  {material.caveat} Material selection updates the specification; surface texture is
                  controlled separately.
                </p>
              </>
            )}

            <div className="stow-card">
              <div className="stow-icon">
                <PawPrint size={20} strokeWidth={1.5} />
              </div>
              <div>
                <strong>Ramp preview</strong>
                <p>Show the integrated retractable pet ramp in the 3D view.</p>
              </div>
              <Toggle
                id="show-ramp"
                testId="show-ramp-control"
                label="Show ramp preview"
                isChecked={showRamp}
                onChange={() => setShowRamp(value => !value)}
              />
            </div>
            {showRamp && (
              <div className="stow-card">
                <div className="stow-icon">
                  <LockKeyhole size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <strong>Less ramp. More room.</strong>
                  <p>Preview the telescoping, underfloor concept.</p>
                </div>
                <Toggle
                  id="stow-ramp"
                  testId="stow-control"
                  label="Stow retractable ramp"
                  isChecked={stowed}
                  onChange={() => {
                    setStowed(value => !value);
                    if (!stowed) setView('cargo');
                  }}
                />
              </div>
            )}
            <div className="dimension-note">
              <Ruler size={15} />
              <span>Concept dimensions. Fit and load ratings require validation.</span>
            </div>
            <div className="next-section">
              <span className="ads-action">
                <IconButton
                  appearance="subtle"
                  icon={ArrowLeftIcon}
                  label="Previous configuration category"
                  isDisabled={currentIndex === 0}
                  onClick={() => setCategory(CATEGORIES[currentIndex - 1])}
                />
              </span>
              <span>
                STEP {currentIndex + 1} OF {CATEGORIES.length}
              </span>
              <span className="ads-action next-action">
                <Button appearance="subtle" iconAfter={ArrowRightIcon} onClick={next}>
                  {currentIndex === CATEGORIES.length - 1
                    ? 'Review your build'
                    : `Next: ${CATEGORIES[currentIndex + 1]}`}
                </Button>
              </span>
            </div>
          </div>
          <div className="responsibility-note">
            <Leaf size={16} />
            <p>
              Thoughtful materials. More shared miles.
              <br />
              <span>Proposed materials, subject to supplier and safety review.</span>
            </p>
          </div>
        </section>
      </main>

      <footer className="build-footer">
        <div className="build-identity">
          <span className="collection-mark">
            <PawPrint size={23} />
          </span>
          <div>
            <strong>Your Companion</strong>
            <span>
              {size.label} · {type.label} · {color.label}
            </span>
          </div>
        </div>
        <span className="ads-action reset-action">
          <Button appearance="subtle" iconBefore={UndoIcon} onClick={reset}>
            Reset build
          </Button>
        </span>
        <div className="build-price" aria-live="polite">
          <span>ACCESSORY CONCEPT PRICE</span>
          <strong>
            {formatPrice(price)} <small>USD</small>
          </strong>
        </div>
        <span className="ads-action summary-action">
          <Button
            appearance="primary"
            shouldFitContainer
            iconAfter={ArrowRightIcon}
            onClick={() => setModal('summary')}
          >
            Your build
          </Button>
        </span>
      </footer>
      <div className="prototype-note">
        <span>
          AERTH is a fictional brand. Original 3D concept, not a production vehicle or safety
          specification.
        </span>
        <span>
          {storageOk
            ? 'YOUR SELECTIONS ARE SAVED ON THIS DEVICE'
            : 'STORAGE UNAVAILABLE: SESSION ONLY'}
        </span>
      </div>
      <div className="toast" role="status">
        {notice && (
          <span>
            <Check size={16} />
            {notice}
          </span>
        )}
      </div>

      <BuildDialog
        config={config}
        mode={modal}
        onClose={() => setModal(null)}
        onDownload={download}
        onShare={share}
      />
    </div>
  );
}

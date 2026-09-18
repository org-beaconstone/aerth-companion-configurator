import { useEffect, useRef } from 'react';
import Button from '@atlaskit/button/default/button';
import IconButton from '@atlaskit/button/icon/button';
import Textfield from '@atlaskit/textfield';
import SectionMessage from '@atlaskit/section-message';
import { CrossIcon, ArrowRightIcon, DownloadIcon, LinkIcon } from '../design/icons';
import { Leaf } from 'lucide-react';
import {
  buildSpecification,
  buildUrl,
  formatPrice,
  MATERIALS,
  type Configuration,
} from '../domain/configuration';

export type BuildDialogMode = 'summary' | 'about' | 'share' | null;
interface Props {
  config: Configuration;
  mode: BuildDialogMode;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

/** Native focus trapping: the current ADS modal's scroll-lock dependency is not React 19 safe. */
export default function BuildDialog({ config, mode, onClose, onDownload, onShare }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const spec = buildSpecification(config);
  useEffect(() => {
    if (mode && !dialog.current?.open) dialog.current?.showModal();
    if (!mode && dialog.current?.open) dialog.current.close();
  }, [mode]);

  return (
    <dialog
      className="ads-native-dialog"
      ref={dialog}
      aria-labelledby="build-dialog-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {mode && (
        <>
          <header className="ads-modal-header">
            <h2 id="build-dialog-title">
              {mode === 'about'
                ? 'Our approach'
                : mode === 'share'
                  ? 'Your build link'
                  : 'Your Companion build'}
            </h2>
            <IconButton
              appearance="subtle"
              icon={CrossIcon}
              label="Close dialog"
              onClick={onClose}
            />
          </header>
          <div className={`ads-dialog-body ${mode === 'about' ? 'about-dialog' : ''}`}>
            {mode === 'about' ? (
              <>
                <h3>Leave room for what matters.</h3>
                <p>
                  One vehicle. A better welcome for the animals who come along for the ride.
                  Companion is an integrated retractable pet ramp, configurable by size, surface,
                  color, and material direction.
                </p>
                <p className="ads-design-note">
                  Built with Atlassian Design System components and tokens. The original vehicle and
                  custom accessory cards are styled to fit the same system.
                </p>
                <h3>Three considered material directions</h3>
                {MATERIALS.map(item => (
                  <div className="about-material" key={item.id}>
                    <Leaf size={18} />
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.detail}</p>
                    </div>
                  </div>
                ))}
                <div className="ads-disclaimer">
                  <SectionMessage title="A concept, not a certification." appearance="warning">
                    <p>
                      These are proposed materials, not approved or verified pet-safe products.
                      Final design requires load, fatigue, slip, pinch-point, retention, weathering,
                      and pet-contact chemical testing. Sustainable sourcing and recycled content
                      require supplier evidence.
                    </p>
                  </SectionMessage>
                </div>
                <Button
                  appearance="primary"
                  shouldFitContainer
                  iconAfter={ArrowRightIcon}
                  onClick={onClose}
                >
                  Back to your build
                </Button>
              </>
            ) : mode === 'share' ? (
              <>
                <p>
                  Copy this link to reopen the same selections. A local address only works where
                  this app is running.
                </p>
                <div className="ads-share-field">
                  <Textfield
                    aria-label="Shareable build URL"
                    ref={input}
                    isReadOnly
                    isMonospaced
                    value={buildUrl(config, window.location.href)}
                    onFocus={event => event.currentTarget.select()}
                  />
                </div>
                <Button
                  appearance="primary"
                  shouldFitContainer
                  iconAfter={LinkIcon}
                  onClick={() => input.current?.select()}
                >
                  Select link
                </Button>
              </>
            ) : (
              <>
                <h3>Your next adventure, configured.</h3>
                <p className="summary-subtitle">AERTH ONE / COMPANION COLLECTION</p>
                <dl className="summary-list">
                  {[
                    [
                      'Size',
                      `${spec.selections.size} / ${spec.dimensions.width} × ${spec.dimensions.length} cm`,
                    ],
                    ['Surface', spec.selections.coating],
                    ['Ramp color', spec.selections.color],
                    ['Vehicle paint', spec.selections.vehicleColor],
                    ['Material direction', spec.selections.material],
                    [
                      'ADS ramp finish',
                      `${spec.finishes.ramp.palette} · ${spec.finishes.ramp.hex}`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="summary-total">
                  <span>Illustrative accessory price</span>
                  <strong>
                    {formatPrice(spec.price)} <small>USD</small>
                  </strong>
                </div>
                <p className="summary-fine-print">
                  Concept only. Excludes vehicle, tax, and delivery. Not an offer for sale.
                  Dimensions and materials require engineering and pet-safety validation.
                </p>
                <Button
                  appearance="primary"
                  shouldFitContainer
                  iconAfter={DownloadIcon}
                  onClick={onDownload}
                >
                  Download build
                </Button>
                <div className="dialog-secondary">
                  <span className="ads-action">
                    <Button appearance="subtle" iconBefore={LinkIcon} onClick={onShare}>
                      Copy build link
                    </Button>
                  </span>
                  <span className="ads-action">
                    <Button appearance="subtle" iconAfter={ArrowRightIcon} onClick={onClose}>
                      Keep exploring
                    </Button>
                  </span>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </dialog>
  );
}

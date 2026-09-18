import ArrowRight from '@atlaskit/icon/core/arrow-right';
import ArrowLeft from '@atlaskit/icon/core/arrow-left';
import ChevronLeft from '@atlaskit/icon/core/chevron-left';
import ChevronRight from '@atlaskit/icon/core/chevron-right';
import Cross from '@atlaskit/icon/core/cross';
import Download from '@atlaskit/icon/core/download';
import Link from '@atlaskit/icon/core/link';
import Undo from '@atlaskit/icon/core/undo';
import Expand from '@atlaskit/icon/core/expand-horizontal';
import LinkExternal from '@atlaskit/icon/core/link-external';

// ADS icons are CommonJS leaf exports. Vite 8 dev may retain one extra default
// wrapper while production unwraps it. Normalize only that module envelope;
// the rendered component is the unchanged official Atlaskit icon.
function component<T>(value: T): T {
  const module = value as T | { default: T };
  return typeof module === 'object' && module !== null && 'default' in module
    ? module.default
    : value;
}
export const ArrowRightIcon = component(ArrowRight);
export const ArrowLeftIcon = component(ArrowLeft);
export const ChevronLeftIcon = component(ChevronLeft);
export const ChevronRightIcon = component(ChevronRight);
export const CrossIcon = component(Cross);
export const DownloadIcon = component(Download);
export const LinkIcon = component(Link);
export const UndoIcon = component(Undo);
export const ExpandIcon = component(Expand);
export const LinkExternalIcon = component(LinkExternal);

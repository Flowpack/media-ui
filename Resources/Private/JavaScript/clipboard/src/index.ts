import clipboardVisibleState from './state/clipboardVisibleState';
import { CLIPBOARD, ADD_OR_REMOVE_FROM_CLIPBOARD } from './queries/ClipboardQuery';
import useClipboard, { ClipboardItems } from './hooks/useClipboard';
import ClipboardToggle from './components/ClipboardToggle';
import ClipboardItem from './components/ClipboardItem';
import ClipboardActions from './components/ClipboardActions';
import buildResolvers from './resolvers/mutation';

export {
    ADD_OR_REMOVE_FROM_CLIPBOARD,
    CLIPBOARD,
    ClipboardToggle,
    ClipboardActions,
    ClipboardItem,
    ClipboardItems,
    buildResolvers,
    clipboardVisibleState,
    useClipboard,
};

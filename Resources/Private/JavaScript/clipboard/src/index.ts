import clipboardState from './state/clipboardState';
import { CLIPBOARD, ADD_OR_REMOVE_FROM_CLIPBOARD } from './queries/ClipboardQuery';
import useClipboard from './hooks/useClipboard';
import Clipboard from './components/Clipboard';
import ClipboardItem from './components/ClipboardItem';
import ClipboardActions from './components/ClipboardActions';
import buildResolvers from './resolvers/mutation';

export {
    ADD_OR_REMOVE_FROM_CLIPBOARD,
    CLIPBOARD,
    Clipboard,
    ClipboardActions,
    ClipboardItem,
    buildResolvers,
    clipboardState,
    useClipboard,
};

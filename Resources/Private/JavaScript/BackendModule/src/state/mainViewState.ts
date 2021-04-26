import { selector } from 'recoil';
import { clipboardVisibleState } from '@media-ui/feature-clipboard/src';

enum MainViewState {
    DEFAULT,
    CLIPBOARD,
    UNUSED_ASSETS,
}

const mainViewState = selector<MainViewState>({
    key: 'mainViewState',
    get: ({ get }) => {
        const clipboardVisible = get(clipboardVisibleState);

        if (clipboardVisible) return MainViewState.CLIPBOARD;
        return MainViewState.DEFAULT;
    },
});

export { mainViewState, MainViewState };

import { selector } from 'recoil';
import { clipboardVisibleState } from '@media-ui/feature-clipboard/src';
import { showUnusedAssetsState } from '@media-ui/feature-asset-usage/src';

enum MainViewState {
    DEFAULT,
    CLIPBOARD,
    UNUSED_ASSETS,
}

const mainViewState = selector<MainViewState>({
    key: 'mainViewState',
    get: ({ get }) => {
        const clipboardVisible = get(clipboardVisibleState);
        const showUnusedAssets = get(showUnusedAssetsState);

        if (clipboardVisible) return MainViewState.CLIPBOARD;
        if (showUnusedAssets) return MainViewState.UNUSED_ASSETS;
        return MainViewState.DEFAULT;
    },
});

export { mainViewState, MainViewState };

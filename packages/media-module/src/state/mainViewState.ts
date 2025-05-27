import { selector } from 'recoil';

import { clipboardVisibleState } from '@media-ui/feature-clipboard';
import { showUnusedAssetsState } from '@media-ui/feature-asset-usage';

enum MainViewMode {
    DEFAULT,
    CLIPBOARD,
    UNUSED_ASSETS,
}

// FIXME: There should be a single state for the main view mode and selectors to derive the other states from it.
const mainViewState = selector<MainViewMode>({
    key: 'mainViewState',
    get: ({ get }) => {
        const clipboardVisible = get(clipboardVisibleState);
        const showUnusedAssets = get(showUnusedAssetsState);

        if (clipboardVisible) return MainViewMode.CLIPBOARD;
        if (showUnusedAssets) return MainViewMode.UNUSED_ASSETS;
        return MainViewMode.DEFAULT;
    },
});

export { mainViewState, MainViewMode };

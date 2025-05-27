import { waitForReact } from 'testcafe-react-selectors';
import page from './page-model';

/**
 * This fixture should be run first to make sure the server is running and the app is loaded
 */

fixture('App')
    .page('./?reset=1')
    .beforeEach(async () => {
        await waitForReact();
    });

test('The app loads and shows all main components', async (t) => {
    await t.expect(page.assetSourceList.exists).ok('The asset source list should exist');
});

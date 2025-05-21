import { waitForReact } from 'testcafe-react-selectors';
import page from './page-model';
import { SERVER_NAME } from './helpers';

/**
 * This fixture should be run first to make sure the server is running and the app is loaded
 */

fixture('App')
    .page(SERVER_NAME)
    .beforeEach(async () => {
        await waitForReact();
    });

test('The app loads and shows all main components', async (t) => {
    await t.expect(page.assetSourceList.exists).ok('The asset source list should exist');
});

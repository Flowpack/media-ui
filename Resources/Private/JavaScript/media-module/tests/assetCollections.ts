import { Selector } from 'testcafe';

import { SERVER_NAME } from './helpers';

fixture('Media Ui').page(SERVER_NAME);

const collectionTree = Selector('[class^="tree-"]');
const firstThumbnail = Selector('[class^="thumbnail-"] [class^="caption-"]');
const firstTag = collectionTree.find('[title="Example collection 1"]');
const paginationPages = Selector('[class^="pagination-"] [class^="list-"] [class^="item-"]');
const assetCount = Selector('[class^="assetCount-"]');

test('Clicking first collection updates list and only assets should be shown that are assigned to it', async (t) => {
    await t
        .click(firstTag)
        .expect(firstThumbnail.withText('Example asset 4').exists)
        .ok('Asset 4 is not the first visible asset')
        .expect(paginationPages.withText('3').exists)
        .ok('Number of pages should be 3')
        .expect(assetCount.withText('20 assets').exists)
        .ok('Asset count does not show 20 items');
});

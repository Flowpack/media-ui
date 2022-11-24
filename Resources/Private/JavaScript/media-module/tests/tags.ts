import { Selector } from 'testcafe';

import { SERVER_NAME } from './helpers';

fixture('Media Ui').page(SERVER_NAME);

const treeSelector = Selector('[class^="tree-"]');
const firstTagSelector = '[title="Example tag 1"]';
const firstThumbnailSelector = Selector('[class^="thumbnail-"] [class^="caption-"]');
const paginationItemsSelector = Selector('[class^="pagination-"] [class^="list-"] [class^="item-"]');
const assetCountSelector = Selector('[class^="assetCount-"]');

test('Clicking first tag updates list and only assets should be shown that are assigned to it', async (t) => {
    await t
        .click(treeSelector.find(firstTagSelector))
        .expect(firstThumbnailSelector.withText('Example asset 11').exists)
        .ok('The first thumbnail should have shown asset 11')
        .expect(paginationItemsSelector.count)
        .eql(3) // one item and the two navigation buttons
        .expect(assetCountSelector.withText('12 assets').exists)
        .ok('12 assets should have been shown');
});

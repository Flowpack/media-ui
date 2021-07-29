import { Selector } from 'testcafe';

import { SERVER_NAME } from './helpers';

fixture('Media Ui').page(SERVER_NAME);

const treeSelector = '[class^="tree-"]';
const firstTagSelector = '[title="Example tag 1"]';
const firstThumbnailSelector = '[class^="thumbnail-"] [class^="caption-"]';
const paginationItemsSelector = '[class^="pagination-"] [class^="list-"] [class^="item-"]';
const assetCountSelector = '[class^="assetCount-"]';

test('Clicking first tag updates list and only assets should be shown that are assigned to it', async (t) => {
    await t
        .click(Selector(treeSelector).find(firstTagSelector))
        .expect(Selector(firstThumbnailSelector).innerText)
        .eql('Example asset 11')
        .expect(Selector(paginationItemsSelector).count)
        .eql(3) // one item and the two navigation buttons
        .expect(Selector(assetCountSelector).innerText)
        .eql('12 assets');
});

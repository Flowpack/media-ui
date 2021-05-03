import { Selector } from 'testcafe';

import { SERVER_NAME } from './helpers';

fixture('Media Ui').page(SERVER_NAME);

const collectionTree = Selector('[class^="tree-"]');
const firstThumbnail = Selector('[class^="thumbnail-"] [class^="caption-"]');
const firstTag = collectionTree.find('[title="Example tag 1"]');
const paginationPages = Selector('[class^="pagination-"] [class^="list-"] [class^="item-"]');
const assetCount = Selector('[class^="assetCount-"]');

test('Clicking first tag updates list and only assets should be shown that are assigned to it', async (t) => {
    await t
        .click(firstTag)
        .expect(firstThumbnail.innerText)
        .eql('Example asset 11')
        .expect(paginationPages.count)
        .eql(3) // one item and the two navigation buttons
        .expect(assetCount.innerText)
        .eql('12 assets');
});

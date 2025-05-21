import page from './page-model';
import { SERVER_NAME } from './helpers';

fixture('Asset collections').page(SERVER_NAME);

test('Clicking first collection updates list and only assets should be shown that are assigned to it', async (t) => {
    await t
        .scrollIntoView(page.firstCollection)
        .click(page.assetCollections.withText('Example collection 1'))
        .expect(page.firstThumbnail.innerText)
        .eql('Example asset 4')
        .expect(page.paginationItems.count)
        .eql(3) // one item and the two navigation buttons
        .expect(page.assetCount.innerText)
        .eql('20 assets');
});

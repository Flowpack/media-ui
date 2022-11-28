import page from './page-model';
import { SERVER_NAME } from './helpers';

fixture('Tags').page(SERVER_NAME);

test('Clicking first tag updates list and only assets should be shown that are assigned to it', async (t) => {
    await t
        .expect(page.tags.withExactText('Example tag 1').exists)
        .ok('Tag "Example tag 1" should exist')
        // FIXME: For some reason it only works when we click the element twice
        .click(page.tags.withExactText('Example tag 1'))
        .click(page.tags.withExactText('Example tag 1'))
        .expect(page.firstThumbnail.innerText)
        .eql('Example asset 11')
        .expect(page.paginationItems.count)
        .eql(3) // one item and the two navigation buttons
        .expect(page.assetCount.innerText)
        .eql('12 assets');
});

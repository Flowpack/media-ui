import page from './page-model';
import { SERVER_NAME } from './helpers';

fixture('Filtering').page(SERVER_NAME);

test('No results are shown when filtering videos', async (t) => {
    await t
        .click(page.assetsFilter)
        .click(page.assetTypeFilter)
        .click(page.getDropdownElement('Video'))
        .expect(page.assetCount.innerText)
        .eql('0 assets');
});

test('Results are shown when filtering images', async (t) => {
    await t
        .click(page.assetsFilter)
        .click(page.assetTypeFilter)
        .click(page.getDropdownElement('Image'))
        .expect(page.firstThumbnail.innerText)
        .eql('Example asset 1');
});

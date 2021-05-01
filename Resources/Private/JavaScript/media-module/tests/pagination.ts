import { Selector } from 'testcafe';

import { SERVER_NAME } from './helpers';

fixture('Media Ui').page(SERVER_NAME);

const firstThumbnail = Selector('[class^="thumbnail-"] [class^="caption-"]');
const paginationPage2 = Selector('[class^="pagination-"] [class^="list-"] [class^="item-"]:nth-child(3)');

test('Clicking next page shows more thumbnails', async (t) => {
    await t.click(paginationPage2).expect(firstThumbnail.innerText).eql('Example asset 21');
});

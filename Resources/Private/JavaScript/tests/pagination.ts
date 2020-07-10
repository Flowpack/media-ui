import { Selector } from 'testcafe';

fixture('Media Module').page('http://localhost:8000/');

const firstThumbnail = Selector('[class^="thumbnail-"] [class^="caption-"]');
const paginationPage2 = Selector('[class^="pagination-"] [class^="list-"] [class^="item-"]:nth-child(2)');

test('Clicking next page shows more thumbnails', async t => {
    await t
        .click(paginationPage2)
        .expect(firstThumbnail.innerText)
        .eql('Example asset 21');
});

import page from './page-model';

fixture('Pagination').page('./?reset=1');

test('Clicking next page shows more thumbnails', async (t) => {
    await t.click(page.paginationItems.withText('2')).expect(page.thumbnails.nth(0).innerText).eql('Example asset 21');
});

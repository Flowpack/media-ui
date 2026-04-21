import page from './page-model';

fixture('Thumbnails').page('./?reset=1');

test('The first example asset appears as thumbnail', async (t) => {
    await t.expect(page.firstThumbnailLabel.innerText).eql('Example asset 1');
});

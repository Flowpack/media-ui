import page from './page-model';

fixture('Lightbox').page('./?reset=1');

test('Preview opens lightbox', async (t) => {
    await t
        .hover(page.firstThumbnail)
        .click(
            page.firstThumbnail
                .findReact('AssetActions')
                .findReact('IconButton')
                .withAttribute('title', 'Preview asset')
        )
        .expect(page.lightbox.find('.ril-image-current').getAttribute('src'))
        .eql(await page.firstThumbnail.find('picture img').getAttribute('src'));
});

import page from './page-model';
import { SERVER_NAME } from './helpers';

fixture('Lightbox').page(SERVER_NAME);

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

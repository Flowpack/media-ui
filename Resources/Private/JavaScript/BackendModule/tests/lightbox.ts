import { Selector } from 'testcafe';

import { SERVER_NAME } from './helpers';

fixture('Media Ui').page(SERVER_NAME);

const firstThumbnail = Selector('[class^="thumbnail-"]');
const firstThumbnailPreviewAction = firstThumbnail.find('button[title="Preview asset"]');
const lightbox = Selector('.ril-outer');

test('Preview opens lightbox', async (t) => {
    await t
        .hover(firstThumbnail)
        .click(firstThumbnailPreviewAction)
        .expect(lightbox.find('.ril__image').getAttribute('src'))
        .eql(await firstThumbnail.find('picture img').getAttribute('src'));
});

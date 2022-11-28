import page from './page-model';

import { SERVER_NAME } from './helpers';

fixture('Thumbnails').page(SERVER_NAME);

test('The first example asset appears as thumbnail', async (t) => {
    await t.expect(page.firstThumbnail.innerText).eql('Example asset 1');
});

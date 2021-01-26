import { Selector } from 'testcafe';

import { SERVER_NAME } from './helpers';

fixture('Media Ui').page(SERVER_NAME);

const firstThumbnail = Selector('[class^="thumbnail-"] [class^="caption-"]');

test('The first example asset appears as thumbnail', async t => {
    await t.expect(firstThumbnail.innerText).eql('Example asset 1');
});

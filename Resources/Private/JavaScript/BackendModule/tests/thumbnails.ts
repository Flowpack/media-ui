import { Selector } from 'testcafe';

fixture('Media Module').page('http://localhost:8000/');

const firstThumbnail = Selector('[class^="thumbnail-"] [class^="caption-"]');

test('The first example asset appears as thumbnail', async t => {
    await t.expect(firstThumbnail.innerText).eql('Example asset 1');
});

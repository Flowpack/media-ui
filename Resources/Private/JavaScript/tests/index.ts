import { Selector } from 'testcafe';

fixture('Media Module').page('http://localhost:8000/');

test('The first dummy image appears as thumbnail', async t => {
    await t.expect(Selector('#media-ui-app [class^="thumbnail-"] [class^="caption-"]').innerText).eql('Dummy 1');
});

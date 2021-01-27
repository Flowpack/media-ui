import { Selector } from 'testcafe';

import { SERVER_NAME } from './helpers';

fixture('Media Ui').page(SERVER_NAME);

const firstThumbnail = Selector('[class^="thumbnail-"]');
const inspector = Selector('[class^="inspector-"]');
const currentSelection = Selector('[class^="currentSelection-"]');
const tagSelection = inspector.find('[class^="tagSelection-"]');
const actions = inspector.find('[class^="actions-"]');

test('Inspector appears and shows first asset', async t => {
    await t
        .click(firstThumbnail)
        .expect(currentSelection.find('span').innerText)
        .eql('Example asset 1');
});

test('Tagging works', async t => {
    await t
        .click(firstThumbnail)
        .click(tagSelection)
        .click(Selector('[class^="_dropDown_"] span[title="Example tag 1"]'))
        .click(actions.child().withText('Apply'));
}).after(async t => {
    const { log } = await t.getBrowserConsoleMessages();
    await t.expect(log.includes('The asset has been tagged')).ok('');
});

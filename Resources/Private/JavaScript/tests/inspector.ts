import { Selector } from 'testcafe';

fixture('Media Module').page('http://localhost:8000/');

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
        .click(tagSelection.find('span[title="Example tag 1"]'))
        .click(actions.child().withText('Apply'))
        .getBrowserConsoleMessages()
        .then(({ info }) => t.expect(info.includes('The asset has been tagged')).ok('', { timeoutSeconds: 1 }));
});

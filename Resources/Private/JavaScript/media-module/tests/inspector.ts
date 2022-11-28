import page from './page-model';
import { SERVER_NAME } from './helpers';

fixture('Inspector').page(SERVER_NAME);

test('Inspector appears and shows first asset', async (t) => {
    await t
        .click(page.firstThumbnail)
        .expect(page.currentSelection.withText('Example asset 1').exists)
        .ok('The first asset should be selected');
});

test('Tagging works', async (t) => {
    await t
        .click(page.firstThumbnail)
        .scrollIntoView(page.tagSelection)
        .click(page.tagSelection)
        .click(page.tagSelection.findReact('ListPreviewElement').withText('Example tag 1'))
        .click(page.inspectorActions.findReact('Button').withText('Apply'));
}).after(async (t) => {
    const { log } = await t.getBrowserConsoleMessages();
    await t.expect(log.includes('The asset has been tagged')).ok('');
});

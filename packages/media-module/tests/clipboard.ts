import page from './page-model';
import { ReactSelector } from 'testcafe-react-selectors';

fixture('Clipboard').page('./?reset=1');

test('Asset can be added and removed from the clipboard', async (t) => {
    await t
        .expect(ReactSelector('ClipboardToggle').withText('Clipboard (0)').exists)
        .ok('The clipboard is initially empty');

    await t
        .click(page.firstThumbnail)
        .click(page.firstThumbnail.find('[title="Copy to clipboard"]'))
        .expect(ReactSelector('ClipboardToggle').withText('Clipboard (1)').exists)
        .ok('The first asset was added to the clipboard');

    await t
        .click(ReactSelector('ClipboardToggle').withText('Clipboard (1)'))
        .expect(page.thumbnails.count)
        .eql(1, 'The clipboard is visible and contains one asset');

    await t
        .click(page.firstThumbnail.find('[title="Remove from clipboard"]'))
        .expect(ReactSelector('ClipboardToggle').withText('Clipboard (0)').exists)
        .ok('The first asset was removed from the clipboard and the clipboard is empty again');
});

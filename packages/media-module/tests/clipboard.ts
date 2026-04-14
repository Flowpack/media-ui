import { Selector } from 'testcafe';
import page from './page-model';

fixture('Clipboard').page('./?reset=1');

test('Asset can be added and removed from the clipboard', async (t) => {
    await t.expect(page.clipboardToggle.withText('Clipboard (0)').exists).ok('The clipboard is initially empty');

    await t
        .click(page.firstThumbnail)
        .click(page.firstThumbnail.find('[title="Copy to clipboard"]'))
        .expect(page.clipboardToggle.withText('Clipboard (1)').exists)
        .ok('The first asset was added to the clipboard');

    await t
        .click(page.clipboardToggle.find('button').withText('Clipboard (1)'))
        .expect(page.thumbnails.count)
        .eql(1, 'The clipboard is visible and contains one asset');

    await t
        .click(page.firstThumbnail.find('[title="Remove from clipboard"]'))
        .expect(page.clipboardToggle.withText('Clipboard (0)').exists)
        .ok('The first asset was removed from the clipboard and the clipboard is empty again');
});

test('The clipboard can be flushed', async (t) => {
    await t.expect(page.clipboardToggle.withText('Clipboard (0)').exists).ok('The clipboard is initially empty');

    await t
        .click(page.firstThumbnail)
        .click(page.firstThumbnail.find('[title="Copy to clipboard"]'))
        .click(page.thumbnails.nth(2))
        .click(page.thumbnails.nth(2).find('[title="Copy to clipboard"]'))
        .expect(page.clipboardToggle.withText('Clipboard (2)').exists)
        .ok('Two assets were added to the clipboard');

    await t
        .click(page.clipboardToggle.find('button').withText('Clipboard (2)'))
        .click(Selector('div[class*="clipboardActions"]').find('[title="Flush clipboard"]'))
        .click(Selector('div[class*="dialog"]').find('button').withText('Cancel'))
        .expect(page.thumbnails.count)
        .eql(2, 'The clipboard was not flushed and the assets are still present');

    await t
        .click(Selector('div[class*="clipboardActions"]').find('[title="Flush clipboard"]'))
        .click(Selector('div[class*="dialog"]').find('button').withText('Yes, proceed with flushing the clipboard'))
        .expect(page.clipboardToggle.withText('Clipboard (0)').exists)
        .ok('The clipboard was flushed and the toggle shows 0 items')
        .expect(page.thumbnails.count)
        .eql(0, 'The clipboard is empty the counter is 0')
        .expect(Selector('button').withText('Close clipboard').exists)
        .ok('A button to close the clipboard is available after flushing it');
});

import page from './page-model';

// Use Cmd (meta) on macOS and Ctrl on Linux/Windows
const ctrlOrCmd = process.platform === 'darwin' ? { meta: true } : { ctrl: true };

fixture('Multi-Selection').page('./?reset=1');

test('Clicking a thumbnail checkbox adds the asset to the selection', async (t) => {
    await t.expect(page.selectedThumbnails.count).eql(0, 'No assets are initially selected');

    await t
        .click(page.firstThumbnail.find('.Thumbnail_checkbox'))
        .expect(page.firstThumbnail.hasClass('Thumbnail_selected'))
        .ok('The first asset is selected after clicking its checkbox');

    await t
        .click(page.thumbnails.nth(1).find('.Thumbnail_checkbox'))
        .expect(page.selectedThumbnails.count)
        .eql(2, 'Two assets are selected after clicking a second checkbox');
});

test('Ctrl/Cmd+click adds another asset to the selection', async (t) => {
    await t
        .click(page.firstThumbnail)
        .click(page.thumbnails.nth(1), { modifiers: ctrlOrCmd })
        .expect(page.selectedThumbnails.count)
        .eql(2, 'Two assets are selected after Ctrl/Cmd+clicking a second thumbnail');
});

test('Shift+click selects a range of thumbnails', async (t) => {
    await t
        .click(page.firstThumbnail)
        .click(page.thumbnails.nth(3), { modifiers: { shift: true } })
        .expect(page.selectedThumbnails.count)
        .eql(4, 'Four assets are selected as a range from the first to the fourth thumbnail');
});

test('Multi-selection badges appear and individual assets can be removed', async (t) => {
    await t
        .click(page.firstThumbnail.find('.Thumbnail_checkbox'))
        .click(page.thumbnails.nth(1).find('.Thumbnail_checkbox'))
        .click(page.thumbnails.nth(2).find('.Thumbnail_checkbox'))
        .expect(page.multiSelectionBadges.count)
        .eql(3, 'Three badges are shown for three selected assets');

    await t
        .click(page.multiSelectionBadges.nth(0).find('button'))
        .expect(page.multiSelectionBadges.count)
        .eql(2, 'One badge was removed and two badges remain');
});

test('The clear button deselects all assets', async (t) => {
    await t
        .click(page.firstThumbnail.find('.Thumbnail_checkbox'))
        .click(page.thumbnails.nth(1).find('.Thumbnail_checkbox'))
        .expect(page.multiSelectionBadges.count)
        .eql(2, 'Two assets are initially selected');

    await t
        .click(page.multiSelectionClearButton)
        .expect(page.selectedThumbnails.count)
        .eql(0, 'No assets are selected after clicking the clear button');
});

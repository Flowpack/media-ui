import { Selector } from 'testcafe';

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

test('Switching to list view and clicking row checkboxes selects assets', async (t) => {
    await t
        .click(page.viewModeToggle)
        .expect(page.listRows.count)
        .gt(0, 'List view rows are rendered after toggling');

    await t
        .click(page.listRows.nth(0).find('.ListViewItem_checkboxColumn'))
        .click(page.listRows.nth(1).find('.ListViewItem_checkboxColumn'))
        .expect(page.selectedListRows.count)
        .eql(2, 'Two list-view rows are marked as selected')
        .expect(page.multiSelectionBadges.count)
        .eql(2, 'The CurrentMultiSelection badges also reflect two selected assets');
}).after(async (t) => {
    // Restore thumbnail view so subsequent tests in this fixture start in the default mode.
    await t.click(page.viewModeToggle);
});

test('List view rows respect Ctrl/Cmd+click multi-selection', async (t) => {
    await t
        .click(page.viewModeToggle)
        .click(page.listRows.nth(0).find('.ListViewItem_labelColumn'))
        .click(page.listRows.nth(1).find('.ListViewItem_labelColumn'), { modifiers: ctrlOrCmd })
        .expect(page.selectedListRows.count)
        .eql(2, 'Two list-view rows are selected after Ctrl/Cmd+click');
}).after(async (t) => {
    await t.click(page.viewModeToggle);
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

test('Clicking a collection while multi-selecting preserves the selection and inspector view', async (t) => {
    await t
        .click(page.firstThumbnail.find('.Thumbnail_checkbox'))
        .click(page.thumbnails.nth(1).find('.Thumbnail_checkbox'))
        .expect(page.multiSelectionBadges.count)
        .eql(2, 'Two assets are selected before clicking a collection');

    await t
        .scrollIntoView(page.firstCollection)
        .click(page.assetCollections.withText('Example collection 1'))
        .expect(page.multiSelectionBadges.count)
        .eql(2, 'The multi-selection is preserved after switching to another collection');
});

test('Multi-selection hides the title and caption fields in the property inspector', async (t) => {
    await t
        .click(page.firstThumbnail)
        .expect(page.titleInput.exists)
        .ok('The title input is shown for a single selection')
        .expect(page.captionInput.exists)
        .ok('The caption input is shown for a single selection');

    await t
        .click(page.thumbnails.nth(1).find('.Thumbnail_checkbox'))
        .expect(page.titleInput.exists)
        .notOk('The title input is hidden during multi-selection')
        .expect(page.captionInput.exists)
        .notOk('The caption input is hidden during multi-selection')
        .expect(page.copyrightInput.exists)
        .ok('The copyright input is still shown during multi-selection');
});

test('Applying a bulk copyright update opens a confirmation dialog mentioning the asset count', async (t) => {
    await t
        .click(page.firstThumbnail.find('.Thumbnail_checkbox'))
        .click(page.thumbnails.nth(1).find('.Thumbnail_checkbox'))
        .typeText(page.copyrightInput, 'Bulk-updated copyright')
        .click(page.applyButton)
        .expect(page.confirmDialog.exists)
        .ok('A confirmation dialog appears after clicking Apply')
        .expect(page.confirmDialog.innerText)
        .contains('2', 'The dialog mentions the count of selected assets');
});

test('Confirming the bulk copyright dialog updates all selected assets', async (t) => {
    await t
        .click(page.firstThumbnail.find('.Thumbnail_checkbox'))
        .click(page.thumbnails.nth(1).find('.Thumbnail_checkbox'))
        .typeText(page.copyrightInput, 'Bulk-updated copyright')
        .click(page.applyButton)
        .click(page.confirmDialogButton('Yes, update copyright notice'))
        .expect(page.confirmDialog.exists)
        .notOk('The dialog closes after confirmation');
}).after(async (t) => {
    const { log } = await t.getBrowserConsoleMessages();
    await t
        .expect(log.includes('Copyright notice updated for all selected assets'))
        .ok('A success message confirms the bulk copyright update');
});

test('Multi-selection switches the collection select box to single-select mode', async (t) => {
    await t
        .click(page.firstThumbnail.find('.Thumbnail_checkbox'))
        .click(page.thumbnails.nth(1).find('.Thumbnail_checkbox'))
        .expect(page.collectionSelectBox.find('input[placeholder="Move to other collection"]').exists)
        .ok('The collection select box uses the multi-selection placeholder');
});

test('Selecting a target collection while multi-selecting opens a confirmation dialog', async (t) => {
    await t
        .click(page.firstThumbnail.find('.Thumbnail_checkbox'))
        .click(page.thumbnails.nth(1).find('.Thumbnail_checkbox'))
        .click(page.collectionSelectBox)
        .click(Selector('div[class*="listPreviewElement"]').withText('Example collection 3'))
        .expect(page.confirmDialog.exists)
        .ok('A confirmation dialog appears after selecting a target collection')
        .expect(page.confirmDialog.innerText)
        .contains('Example collection 3', 'The dialog mentions the target collection');
});

test('Confirming the move shifts all selected assets to the target collection', async (t) => {
    await t
        .click(page.firstThumbnail.find('.Thumbnail_checkbox'))
        .click(page.thumbnails.nth(1).find('.Thumbnail_checkbox'))
        .click(page.collectionSelectBox)
        .click(Selector('div[class*="listPreviewElement"]').withText('Example collection 3'))
        .click(page.confirmDialogButton('Yes, shift assets'))
        .expect(page.confirmDialog.exists)
        .notOk('The dialog closes after confirmation');
}).after(async (t) => {
    const { log } = await t.getBrowserConsoleMessages();
    await t
        .expect(log.includes('The collections for the assets have been set'))
        .ok('A success message confirms the bulk collection move');
});

test('The Tasks dropdown only shows multi-relevant options when multiple assets are selected', async (t) => {
    await t
        .click(page.firstThumbnail.find('.Thumbnail_checkbox'))
        .click(page.thumbnails.nth(1).find('.Thumbnail_checkbox'))
        .click(page.tasksDropdownHeader)
        .expect(page.tasksDropdownItem('Delete assets').exists)
        .ok('The "Delete assets" option is shown')
        .expect(page.tasksDropdownItem('Copy all to clipboard').exists)
        .ok('The "Copy all to clipboard" option is shown')
        .expect(page.tasksDropdownItem('Show usages').exists)
        .notOk('The single-asset "Show usages" option is hidden')
        .expect(page.tasksDropdownItem('Rename asset').exists)
        .notOk('The single-asset "Rename asset" option is hidden')
        .expect(page.tasksDropdownItem('Replace asset').exists)
        .notOk('The single-asset "Replace asset" option is hidden')
        .expect(page.tasksDropdownItem('Download asset').exists)
        .notOk('The single-asset "Download asset" option is hidden');
});

test('Bulk-deleting from the Tasks dropdown opens a confirmation dialog mentioning the asset count', async (t) => {
    await t
        .click(page.firstThumbnail.find('.Thumbnail_checkbox'))
        .click(page.thumbnails.nth(1).find('.Thumbnail_checkbox'))
        .click(page.tasksDropdownHeader)
        .click(page.tasksDropdownItem('Delete assets'))
        .expect(page.confirmDialog.exists)
        .ok('A confirmation dialog appears')
        .expect(page.confirmDialog.innerText)
        .contains('2', 'The dialog mentions the count of assets to delete');
});

test('Confirming the bulk delete removes all selected assets from the listing', async (t) => {
    const initialCount = await page.thumbnails.count;

    // Pick two deletable assets. Asset N is in-use when (N % 5) > 0; assets 0 and 5 are both deletable.
    await t
        .click(page.firstThumbnail.find('.Thumbnail_checkbox'))
        .click(page.thumbnails.nth(5).find('.Thumbnail_checkbox'))
        .click(page.tasksDropdownHeader)
        .click(page.tasksDropdownItem('Delete assets'))
        .click(page.confirmDialogButton('Yes, proceed with deleting the assets'))
        .expect(page.confirmDialog.exists)
        .notOk('The dialog closes after confirmation')
        .expect(page.thumbnails.count)
        .eql(initialCount - 2, 'Two assets were removed from the listing');
}).after(async (t) => {
    const { log } = await t.getBrowserConsoleMessages();
    await t
        .expect(log.includes('The assets have been deleted'))
        .ok('A success message confirms the bulk delete');
});

test('Bulk-deleting a mix of deletable and in-use assets removes the deletable ones and reports the failed labels', async (t) => {
    const initialCount = await page.thumbnails.count;

    // Asset 0 has no usages (deletable). Asset 1 has 1 usage and will fail to delete.
    await t
        .click(page.firstThumbnail.find('.Thumbnail_checkbox'))
        .click(page.thumbnails.nth(1).find('.Thumbnail_checkbox'))
        .click(page.tasksDropdownHeader)
        .click(page.tasksDropdownItem('Delete assets'))
        .click(page.confirmDialogButton('Yes, proceed with deleting the assets'))
        .expect(page.confirmDialog.exists)
        .notOk('The dialog closes after confirmation')
        .expect(page.thumbnails.count)
        .eql(initialCount - 1, 'Only the deletable asset was removed; the in-use asset survived');
}).after(async (t) => {
    const { error } = await t.getBrowserConsoleMessages();
    await t
        .expect(error.some((message) => message.includes('Example asset 2')))
        .ok('An error notification reports "Example asset 2" as the failed asset');
});

import page from './page-model';

fixture('Tags').page('./?reset=1');

test('Clicking first tag updates list and only assets should be shown that are assigned to it', async (t) => {
    await t
        // Uncollapse the tag list
        .click(page.assetCollections.withText('All'))
        .expect(page.tags.withExactText('Example tag 1').exists)
        .ok('Tag "Example tag 1" should exist')
        // FIXME: For some reason it only works when we click the element twice
        .click(page.tags.withExactText('Example tag 1'))
        .click(page.tags.withExactText('Example tag 1'))
        .expect(page.firstThumbnailLabel.innerText)
        .eql('Example asset 11')
        .expect(page.paginationItems.count)
        .eql(3) // one item and the two navigation buttons
        .expect(page.assetCount.innerText)
        .eql('12 assets');
});

test('Create a new tag and test validation', async (t) => {
    const newTagName = 'New tag';
    await t
        .click(page.assetCollections.withText('All'))
        .click(page.collectionTreeToolbar.find('button').withAttribute('title', 'Create new tag'))
        .typeText(page.createTagDialog.find('input[class*="textInput"]'), ' ', { replace: true })
        .expect(page.createTagDialog.find('button[disabled]').exists)
        .ok('Create button should be disabled')
        .expect(page.createTagDialog.find('ul li').textContent)
        .eql('Please provide a tag label')
        .typeText(page.createTagDialog.find('input[class*="textInput"]'), 'Example tag 1', { replace: true })
        .expect(page.createTagDialog.find('input').withAttribute('validationerrors').exists)
        .ok('Text input should have validation errors')
        .expect(page.createTagDialog.find('button').withText('Create').hasAttribute('disabled'))
        .ok('Create button should be disabled')
        .expect(page.createTagDialog.find('ul li').textContent)
        .eql('A tag with this label already exists')
        .typeText(page.createTagDialog.find('input[class*="textInput"]'), 'New tag ', { replace: true })
        .expect(page.createTagDialog.find('ul li').textContent)
        .eql('The tag label must be 1-255 characters and must not have leading or trailing whitespace')
        .expect(page.createTagDialog.find('button').withText('Create').hasAttribute('disabled'))
        .ok('Create button should be disabled for trailing whitespace')
        .typeText(page.createTagDialog.find('input[class*="textInput"]'), newTagName, { replace: true })
        .expect(page.createTagDialog.find('ul li').exists)
        .notOk('The tooltip should not be visible anymore')
        .click(page.createTagDialog.find('button').withText('Create'))
        .expect(page.createTagDialog.exists)
        .notOk('The dialog closes after confirmation');

    const { log } = await t.getBrowserConsoleMessages();
    await t
        .expect(log.includes('Tag was created'))
        .ok('A success message confirms the creation of the tag')
        .expect(page.tags.withText(newTagName).exists)
        .ok('New tag should appear in list')
        .expect(page.tags.withText('Example tag 1').exists)
        .ok('Existing tags should still appear in list');
});

test('Edit a tag and verify the tree is updated', async (t) => {
    const editedTagLabel = 'Edited tag';

    await t
        .click(page.assetCollections.withText('All'))
        .expect(page.tags.withExactText('Example tag 1').exists)
        .ok('Tag "Example tag 1" should exist')
        // FIXME: For some reason it only works when we click the element twice
        .click(page.tags.withExactText('Example tag 1'))
        .click(page.tags.withExactText('Example tag 1'))
        .expect(page.assetInspector.exists)
        .ok('The inspector should open for the selected tag')
        .typeText(page.assetInspector.find('input[class*="textInput"]'), ' ', { replace: true })
        .expect(page.assetInspector.find('.propertyGroup ul li').textContent)
        .eql('Please provide a tag label')
        .expect(page.applyButton.hasAttribute('disabled'))
        .ok('Apply button should be disabled while the label is invalid')
        .typeText(page.assetInspector.find('input[class*="textInput"]'), editedTagLabel, { replace: true })
        .click(page.applyButton)
        .expect(page.assetInspector.find('input[class*="textInput"]').withAttribute('value', editedTagLabel).exists)
        .ok('The inspector input contains the updated label');

    const { log } = await t.getBrowserConsoleMessages();
    await t
        .expect(log.includes('The tag has been updated'))
        .ok('A success message confirms the update of the tag')
        .expect(page.tags.withExactText(editedTagLabel).exists)
        .ok('The tree shows the updated tag label')
        .expect(page.tags.withExactText('Example tag 1').exists)
        .notOk('The old tag label should no longer appear in the tree');
});

test('Delete a tag and verify the tree is updated', async (t) => {
    await t
        .click(page.assetCollections.withText('All'))
        // FIXME: For some reason it only works when we click the element twice
        .click(page.tags.withExactText('Example tag 1'))
        .click(page.tags.withExactText('Example tag 1'))
        .click(page.collectionTreeToolbar.find('button').withAttribute('title', 'Delete'))
        .expect(page.confirmDialog.exists)
        .ok('A confirmation dialog should appear')
        .expect(page.confirmDialog.innerText)
        .contains('Example tag 1', 'The dialog mentions the tag to delete')
        .click(page.confirmDialogButton('Yes, proceed with deleting the tag'))
        .expect(page.confirmDialog.exists)
        .notOk('The dialog closes after confirmation');

    const { log } = await t.getBrowserConsoleMessages();
    await t
        .expect(log.includes('The tag has been deleted'))
        .ok('A success message confirms the deletion of the tag')
        .expect(page.tags.withExactText('Example tag 1').exists)
        .notOk('The deleted tag should no longer appear in the tree')
        .expect(page.tags.count)
        .eql(10, 'Only the remaining tags and the "Untagged" entry should be shown in the tree');
});

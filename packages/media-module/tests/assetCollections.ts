import page from './page-model';

fixture('Asset collections').page('./?reset=1');

test('Clicking first collection updates list and only assets should be shown that are assigned to it', async (t) => {
    await t
        .scrollIntoView(page.firstCollection)
        .click(page.assetCollections.withText('Example collection 1'))
        .expect(page.firstThumbnailLabel.innerText)
        .eql('Example asset 4')
        .expect(page.paginationItems.count)
        .eql(3) // one item and the two navigation buttons
        .expect(page.assetCount.innerText)
        .eql('20 assets');
});

test('Create a new asset collection and test validation', async (t) => {
    const newAssetCollectionName = 'New asset collection';

    await t
        .click(page.assetCollections.withText('All'))
        .click(page.collectionTreeToolbar.find('button').withAttribute('title', 'Create new asset collection'))
        .expect(page.createAssetCollectionDialog.find('button').withText('Create').hasAttribute('disabled'))
        .ok('Create button should be initially disabled')
        .typeText(page.createAssetCollectionDialog.find('input[class*="textInput"]'), ' ', { replace: true })
        .expect(page.createAssetCollectionDialog.find('ul li').textContent)
        .eql('Please provide a title')
        .expect(page.createAssetCollectionDialog.find('button').withText('Create').hasAttribute('disabled'))
        .ok('Create button should be disabled for an empty title')
        .typeText(page.createAssetCollectionDialog.find('input[class*="textInput"]'), 'Example collection 1', {
            replace: true,
        })
        .expect(page.createAssetCollectionDialog.find('ul li').textContent)
        .eql('A collection with this title already exists')
        .expect(page.createAssetCollectionDialog.find('button').withText('Create').hasAttribute('disabled'))
        .ok('Create button should be disabled for a duplicate title')
        .typeText(page.createAssetCollectionDialog.find('input[class*="textInput"]'), newAssetCollectionName, {
            replace: true,
        })
        .expect(page.createAssetCollectionDialog.find('ul li').exists)
        .notOk('The tooltip should not be visible anymore')
        .click(page.createAssetCollectionDialog.find('button').withText('Create'))
        .expect(page.createAssetCollectionDialog.exists)
        .notOk('The dialog closes after confirmation');

    const { log } = await t.getBrowserConsoleMessages();
    await t
        .expect(log.includes('Asset collection was created'))
        .ok('A success message confirms the creation of the collection')
        .expect(page.assetCollections.withText(newAssetCollectionName).exists)
        .ok('New collection should appear in list');
});

test('Edit an asset collection and verify the tree is updated', async (t) => {
    const editedCollectionTitle = 'Archive';
    const titleInput = page.assetInspector.find('input[class*="textInput"]').nth(0);

    await t
        .scrollIntoView(page.firstCollection)
        .click(page.assetCollections.withText('Example collection 1'))
        .expect(page.assetInspector.exists)
        .ok('The inspector should open for the selected collection')
        .typeText(titleInput, ' ', { replace: true })
        .expect(page.assetInspector.find('.propertyGroup ul li').textContent)
        .eql('Please provide a title')
        .expect(page.applyButton.hasAttribute('disabled'))
        .ok('Apply button should be disabled while the title is invalid')
        .typeText(titleInput, editedCollectionTitle, { replace: true })
        .click(page.applyButton)
        .expect(titleInput.withAttribute('value', editedCollectionTitle).exists)
        .ok('The inspector input contains the updated collection title');

    const { log } = await t.getBrowserConsoleMessages();
    await t
        .expect(log.includes('The asset collection has been updated'))
        .ok('A success message confirms the update of the collection')
        .expect(page.assetCollections.withText(editedCollectionTitle).exists)
        .ok('The tree shows the updated collection title')
        .expect(page.assetCollections.withText('Example collection 1').exists)
        .notOk('The old collection title should no longer appear in the tree');
});

test('Delete an asset collection and verify the tree is updated', async (t) => {
    const doomedCollectionTitle = 'Doomed collection';

    await t
        .click(page.assetCollections.withText('All'))
        .click(page.collectionTreeToolbar.find('button').withAttribute('title', 'Create new asset collection'))
        .typeText(page.createAssetCollectionDialog.find('input[class*="textInput"]'), doomedCollectionTitle)
        .click(page.createAssetCollectionDialog.find('button').withText('Create'))
        .expect(page.createAssetCollectionDialog.exists)
        .notOk('The dialog closes after confirmation')
        .click(page.assetCollections.withText(doomedCollectionTitle))
        .click(page.collectionTreeToolbar.find('button').withAttribute('title', 'Delete'))
        .expect(page.confirmDialog.exists)
        .ok('A confirmation dialog should appear')
        .expect(page.confirmDialog.innerText)
        .contains(doomedCollectionTitle, 'The dialog mentions the collection to delete')
        .click(page.confirmDialogButton('Yes, proceed with deleting the collection'))
        .expect(page.confirmDialog.exists)
        .notOk('The dialog closes after confirmation');

    const { log } = await t.getBrowserConsoleMessages();
    await t
        .expect(log.includes('Asset collection was successfully deleted'))
        .ok('A success message confirms the deletion of the collection')
        .expect(page.assetCollections.withText(doomedCollectionTitle).exists)
        .notOk('The deleted collection should no longer appear in the tree');
});

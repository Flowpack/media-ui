import { Selector } from 'testcafe';
import page from './page-model';

fixture('Tags').page('./?reset=1');

const subSection = (name) => console.log('\x1b[33m%s\x1b[0m', ' - ' + name);

test('Clicking first tag updates list and only assets should be shown that are assigned to it', async (t) => {
    await t
        // Uncollapse the tag list
        .click(page.assetCollections.withText('All'))
        .expect(page.tags.withExactText('Example tag 1').exists)
        .ok('Tag "Example tag 1" should exist')
        // FIXME: For some reason it only works when we click the element twice
        .click(page.tags.withExactText('Example tag 1'))
        .click(page.tags.withExactText('Example tag 1'))
        .expect(page.firstThumbnail.innerText)
        .eql('Example asset 11')
        .expect(page.paginationItems.count)
        .eql(3) // one item and the two navigation buttons
        .expect(page.assetCount.innerText)
        .eql('12 assets');
});

test('Create a new tag and test validation', async (t) => {
    subSection('Check existing tag label validation');
    await t
        .click(page.assetCollections.withText('All'))
        .click(page.collectionTreeToolbar.find('button').withAttribute('title', 'Create new tag'))
        .typeText(page.createTagDialog.find('input[class*="textInput"]'), 'Example tag 1')
        .expect(page.createTagDialog.find('input').withAttribute('validationerrors').exists)
        .ok('Text input should have validation errors')
        .expect(page.createTagDialog.find('button').withText('Create').hasAttribute('disabled'))
        .ok('Create button should be disabled')
        .expect(page.createTagDialog.find('ul li').textContent)
        .eql('A tag with this label already exists')
        .typeText(page.createTagDialog.find('input[class*="textInput"]'), '00')
        .expect(page.createTagDialog.find('ul li').exists)
        .notOk('The tooltip should not be visible anymore')
        .expect(page.createTagDialog.find('button:not([disabled])').exists)
        .ok('Create button should be enabled');

    subSection('Check empty tag label validation');
    await t
        .typeText(page.createTagDialog.find('input[class*="textInput"]'), ' ', { replace: true })
        .expect(page.createTagDialog.find('button[disabled]').exists)
        .ok('Create button should be disabled')
        .expect(page.createTagDialog.find('ul li').textContent)
        .eql('Please provide a tag label');
});

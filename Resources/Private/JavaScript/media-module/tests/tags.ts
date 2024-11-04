import page from './page-model';
import { ReactSelector } from 'testcafe-react-selectors';
import { SERVER_NAME } from './helpers';

fixture('Tags').page(SERVER_NAME);

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
        .click(page.collectionTree.findReact('AddTagButton'))
        .typeText(ReactSelector('CreateTagDialog').findReact('TextInput'), 'Example tag 1')
        .expect(
            ReactSelector('CreateTagDialog')
                .findReact('TextInput')
                .withProps({ validationerrors: ['This input is invalid'] }).exists
        )
        .ok('Text input should have validation errors')
        .expect(ReactSelector('CreateTagDialog').findReact('Button').withProps({ disabled: true }).exists)
        .ok('Create button should be disabled')
        .expect(ReactSelector('CreateTagDialog').find('ul li').textContent)
        .eql('A tag with this label already exists')
        .typeText(ReactSelector('CreateTagDialog').findReact('TextInput'), '00')
        .expect(ReactSelector('CreateTagDialog').find('ul li').exists)
        .notOk('The tooltip should not be visible anymore')
        .expect(ReactSelector('CreateTagDialog').findReact('Button').withProps({ disabled: false }).exists)
        .ok('Create button should be enabled');

    subSection('Check emtpy tag label validation');
    await t
        .typeText(ReactSelector('CreateTagDialog').findReact('TextInput'), ' ', { replace: true })
        .expect(ReactSelector('CreateTagDialog').findReact('Button').withProps({ disabled: true }).exists)
        .ok('Create button should be disabled')
        .expect(ReactSelector('CreateTagDialog').find('ul li').textContent)
        .eql('Please provide a tag label');
});

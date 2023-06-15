import page from './page-model';
import { SERVER_NAME } from './helpers';

fixture('Sorting').page(SERVER_NAME);

test('The sort direction is changed on click of button', async (t) => {
    await t
        .click(page.sortingButton)
        .expect(page.firstThumbnail.innerText)
        .eql('Example asset 20')
        .click(page.sortingButton)
        .expect(page.firstThumbnail.innerText)
        .eql('Example asset 1');
});

test('The sorting is changed on click of sort by name', async (t) => {
    await t
        .click(page.sortingSelection)
        .click(page.getDropdownElement('Name'))
        .expect(page.firstThumbnail.innerText)
        .eql('Example asset 9');
});

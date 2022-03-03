import { Selector } from 'testcafe';

import { SERVER_NAME } from './helpers';

fixture('Media Ui').page(SERVER_NAME);

const firstThumbnail = Selector('[class^="thumbnail-"] [class^="caption-"]');
const sortDirection = Selector('[class^="sortingState-"] > button');
const sortSelectBox = Selector('[class^="sortingState-"] [class*="selectBox-"]');
const sortByName = Selector(
    '[class*="_dropDown__contents-"] [class*="_selectBox__item"]:nth-child(2) > [class*="_listPreviewElement"]'
);

test('The sort direction is changed on click of button', async (t) => {
    await t
        .click(sortDirection)
        .expect(firstThumbnail.innerText)
        .eql('Example asset 20')
        .click(sortDirection)
        .expect(firstThumbnail.innerText)
        .eql('Example asset 1');
});

test.only('The sorting is changed on click of sort by name', async (t) => {
    await t.click(sortSelectBox).click(sortByName).expect(firstThumbnail.innerText).eql('Example asset 9');
});

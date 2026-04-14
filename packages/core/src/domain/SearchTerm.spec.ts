import { describe, it } from 'node:test';
import assert from 'node:assert';

import { SearchTerm } from './SearchTerm';

describe('SearchTerm', () => {
    describe('#fromString', () => {
        it('creates a SearchTerm', () => {
            const searchTerm = SearchTerm.fromString('Hello Search!');

            assert(searchTerm instanceof SearchTerm);
            assert.strictEqual(searchTerm.toString(), 'Hello Search!');
        });
    });

    describe('#fromUrl', () => {
        it('creates a SearchTerm if URL contains a searchTerm', () => {
            const url = new URL('https://neos.io/neos/management/mediaui?searchTerm=Test');
            const searchTerm = SearchTerm.fromUrl(url);

            assert(searchTerm instanceof SearchTerm);
            assert.strictEqual(searchTerm.toString(), 'Test');
        });

        it('creates an empty SearchTerm if URL does not contain a searchTerm', () => {
            const url = new URL('https://neos.io/neos/management/mediaui');
            const searchTerm = SearchTerm.fromUrl(url);

            assert(searchTerm instanceof SearchTerm);
            assert.strictEqual(searchTerm.toString(), '');
        });
    });

    describe('#getAssetIdentifierIfPresent', () => {
        it('provides the asset identifier included in the search term when it is present', () => {
            const searchTermWithAssetIdentifier = SearchTerm.fromString('id:68610fa2-bdd1-4d84-80eb-27db56f2889f');

            assert.deepStrictEqual(searchTermWithAssetIdentifier.getAssetIdentifierIfPresent(), {
                assetId: '68610fa2-bdd1-4d84-80eb-27db56f2889f',
                assetSourceId: '',
            });
        });

        it("returns null when there's no asset identifier included in the search term", () => {
            const searchTermWithoutAssetIdentifier = SearchTerm.fromString('Hello Search!');

            assert.strictEqual(searchTermWithoutAssetIdentifier.getAssetIdentifierIfPresent(), null);
        });
    });

    describe('#toString', () => {
        it('properly converts the search term to a string', () => {
            const searchTermAsString = '' + SearchTerm.fromString('Hello Search!');

            assert.strictEqual(searchTermAsString, 'Hello Search!');
        });
    });
});

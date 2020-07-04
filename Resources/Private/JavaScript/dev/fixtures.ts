import { Asset, AssetCollection, AssetSource, Tag } from '../src/interfaces';

const range = (length: number) => [...Array(length)].map((val, i) => i);
const getExampleImage = (seed: number) => `Assets/example${(seed % 3) + 1}.jpg`;

const typeIcons = {
    jpg: {
        width: 16,
        height: 16,
        url: 'jpg.svg',
        alt: 'jpeg image'
    }
};

const assetSources: AssetSource[] = [
    {
        id: 'neos',
        label: 'Neos',
        description: 'The Neos core asset source',
        iconUri: 'asset-source-icon.svg',
        readOnly: false,
        supportsTagging: true,
        supportsCollections: true
    },
    {
        id: 'example-source',
        label: 'Example ☁️ Source',
        description: 'The source directly from the ☁️',
        iconUri: 'asset-source-icon.svg',
        readOnly: true,
        supportsTagging: false,
        supportsCollections: false
    }
];

const tags: Tag[] = range(10).map(index => ({
    label: `Example tag ${index + 1}`,
    parent: null,
    children: []
}));

const assetCollections: AssetCollection[] = range(3).map(index => ({
    title: `Example collection ${index + 1}`,
    tags: range(index % 3).map(i => tags[(i * 3 + index) % tags.length])
}));

const assets: Asset[] = range(150).map(index => ({
    id: index.toString(),
    localId: index.toString(),
    assetSource: assetSources[0],
    imported: false,
    label: `Example asset ${index + 1}`,
    caption: `The caption for example asset ${index + 1}`,
    filename: 'example1.jpg',
    tags: range(index % 3).map(i => tags[(i * 3 + index) % tags.length]),
    collections: range(index % 2).map(i => assetCollections[(i * 2 + index) % assetCollections.length]),
    copyrightNotice: 'The Neos team',
    lastModified: new Date('2020-06-16 15:07:00'),
    iptcProperties: [],
    width: 90,
    height: 210,
    file: {
        extension: 'jpg',
        mediaType: 'image/jpeg',
        typeIcon: typeIcons.jpg,
        size: 200,
        url: getExampleImage(index)
    },
    thumbnailUrl: getExampleImage(index),
    previewUrl: getExampleImage(index)
}));

export { assetSources, assetCollections, tags, assets };

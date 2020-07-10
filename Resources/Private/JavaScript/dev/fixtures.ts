import { Asset, AssetCollection, AssetSource, IptcProperty, Tag } from '../src/interfaces';

const exampleImages = ['example1.jpg', 'example2.jpg', 'example3.jpg'];

const range = (length: number) => [...Array(length)].map((val, i) => i);
const getExampleFilename = (seed = 0) => exampleImages[seed % exampleImages.length];
const getExampleImagePath = filename => `Assets/${filename}`;

const getIptcProperties = (): IptcProperty[] => [
    {
        propertyName: 'Camera',
        value: 'Phone'
    },
    {
        propertyName: 'Exposure',
        value: '3'
    },
    {
        propertyName: 'SpecialSetting',
        value: 'true'
    }
];

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
        id: 'example-cloud-source',
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

const assets: Asset[] = range(150).map(index => {
    const isCloud = index > 120;
    const filename = getExampleFilename(index);

    return {
        id: index.toString(),
        localId: index.toString(),
        assetSource: assetSources[isCloud ? 1 : 0],
        imported: isCloud && index % 3 === 0,
        label: `Example asset ${index + 1}`,
        caption: `The caption for example asset ${index + 1}`,
        filename: 'example1.jpg',
        tags: range(index % 3).map(i => tags[(i * 3 + index) % tags.length]),
        collections: range(index % 2).map(i => assetCollections[(i * 2 + index) % assetCollections.length]),
        copyrightNotice: 'The Neos team',
        lastModified: new Date('2020-06-16 15:07:00'),
        iptcProperties: index % 5 === 0 ? getIptcProperties() : [],
        width: 90,
        height: 210,
        file: {
            extension: 'jpg',
            mediaType: 'image/jpeg',
            typeIcon: typeIcons.jpg,
            size: 200,
            url: getExampleImagePath(filename)
        },
        thumbnailUrl: getExampleImagePath(filename),
        previewUrl: getExampleImagePath(filename)
    };
});

export { assetSources, assetCollections, tags, assets };

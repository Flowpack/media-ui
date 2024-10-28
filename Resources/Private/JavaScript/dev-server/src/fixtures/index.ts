import cloneDeep from 'lodash.clonedeep';

const exampleImages = ['example1.jpg', 'example2.jpg', 'example3.jpg'];

const range = (length: number) => [...Array(length)].map((val, i) => i);
const getExampleFilename = (seed = 0) => exampleImages[seed % exampleImages.length];
const getExampleImagePath = (filename: string) => `Assets/${filename}`;

const getIptcProperties = (seed: number): IptcProperty[] => [
    {
        __typename: 'IptcProperty',
        propertyName: 'Camera',
        value: `Phone ${seed}`,
    },
    {
        __typename: 'IptcProperty',
        propertyName: 'Exposure',
        value: `${seed}`,
    },
    {
        __typename: 'IptcProperty',
        propertyName: 'SpecialSetting',
        value: `${seed % 2 === 0 ? 'true' : 'false'}`,
    },
];

const typeIcons = {
    jpg: {
        __typename: 'Image',
        width: 16,
        height: 16,
        url: 'jpg.svg',
        alt: 'jpeg image',
    },
};

const assetSources: AssetSource[] = [
    {
        __typename: 'AssetSource',
        id: 'neos',
        label: 'Neos',
        description: 'The Neos core asset source',
        iconUri: 'asset-source-icon.svg',
        readOnly: false,
        supportsTagging: true,
        supportsCollections: true,
    },
    {
        __typename: 'AssetSource',
        id: 'example-cloud-source',
        label: 'Example ☁️ Source',
        description: 'The source directly from the ☁️',
        iconUri: 'asset-source-icon.svg',
        readOnly: true,
        supportsTagging: false,
        supportsCollections: false,
    },
];

const tags: Tag[] = range(10).map((index) => ({
    __typename: 'Tag',
    id: `index ${index + 1}`,
    label: `Example tag ${index + 1}`,
}));

const assetCollections: AssetCollection[] = range(3).map((index) => ({
    __typename: 'AssetCollection',
    id: `someId_${index}`,
    title: `Example collection ${index + 1}`,
    tags: range(index % 3).map((i) => tags[(i * 3 + index) % tags.length]),
    parent:
        index == 1
            ? {
                  id: `someId_0`,
                  title: `Example collection 1`,
              }
            : null,
    // TODO: Recalculate assetCount of assetCollections after generation of assets
    assetCount: 0,
    canDelete: true,
}));

const getUsageDetailsForAsset = (assetId: string): UsageDetailsGroup[] => {
    const usageCount = (parseInt(assetId) || 0) % 5;

    return [
        {
            __typename: 'UsageDetailsGroup',
            serviceId: 'neos',
            label: `Neos documents and content`,
            metadataSchema: [
                {
                    name: 'site',
                    label: 'Site',
                    type: 'TEXT',
                },
                {
                    name: 'workspace',
                    label: 'Workspace',
                    type: 'TEXT',
                },
                {
                    name: 'contentDimensions',
                    label: 'Content Dimensions',
                    type: 'TEXT',
                },
                {
                    name: 'lastModified',
                    label: 'Last modified',
                    type: 'DATETIME',
                },
            ],
            usages: range(usageCount).map((index) => {
                return {
                    label: `Usage ${index} for asset ${assetId}`,
                    url: '/neos/previewurl',
                    metadata: [
                        {
                            name: 'site',
                            value: 'media.ui',
                        },
                        {
                            name: 'workspace',
                            value: 'live',
                        },
                        {
                            name: 'lastModified',
                            value: new Date('2020-06-16 15:07:00').toISOString(),
                        },
                        {
                            name: 'contentDimensions',
                            value: JSON.stringify([['en_US']]),
                        },
                    ],
                };
            }),
        },
        {
            __typename: 'UsageDetailsGroup',
            serviceId: 'other_service',
            label: `Some other service`,
            metadataSchema: [],
            usages: range(usageCount % 3).map((index) => {
                return {
                    label: `Usage ${index} for asset ${assetId}`,
                    url: '/other-service/previewurl',
                    metadata: [],
                };
            }),
        },
    ];
};

const assets = range(150).map((index) => {
    const isCloud = index > 120;
    const filename = getExampleFilename(index);

    const collectionsForAsset = range(index % 2).map(
        (i) => assetCollections[(i * 2 + index) % assetCollections.length]
    );

    collectionsForAsset.forEach((collection) => {
        collection.assetCount++;
        collection.canDelete = false;
    });

    const tagsForAsset = range(index % 3).map((i) => tags[(i * 3 + index) % tags.length]);

    return {
        __typename: 'Asset',
        id: index.toString(),
        localId: index.toString(),
        assetSource: assetSources[isCloud ? 1 : 0],
        imported: isCloud && index % 3 === 0,
        label: `Example asset ${index + 1}`,
        caption: `The caption for example asset ${index + 1}`,
        filename: 'example1.jpg',
        tags: tagsForAsset,
        collections: collectionsForAsset,
        copyrightNotice: 'The Neos team',
        lastModified: new Date(`2020-06-16 15:${Math.floor((150 - index) / 60)}:${(150 - index) % 60}`),
        iptcProperties: index % 5 === 0 ? getIptcProperties(index) : [],
        width: 90,
        height: 210,
        file: {
            __typename: 'AssetFile',
            extension: 'jpg',
            mediaType: 'image/jpeg',
            typeIcon: typeIcons.jpg,
            size: 200,
            url: getExampleImagePath(filename),
        },
        thumbnailUrl: getExampleImagePath(filename),
        previewUrl: getExampleImagePath(filename),
        isInUse: getUsageDetailsForAsset(index.toString()).reduce(
            (prev, usageByService) => prev || usageByService.usages.length > 0,
            false
        ),
        type: 'image',
    };
});

const loadFixtures = () => {
    return {
        assets: cloneDeep(assets) as Asset[],
        assetCollections: cloneDeep(assetCollections) as AssetCollection[],
        assetSources: cloneDeep(assetSources) as AssetSource[],
        tags: cloneDeep(tags) as Tag[],
    };
};

export { loadFixtures, getUsageDetailsForAsset };

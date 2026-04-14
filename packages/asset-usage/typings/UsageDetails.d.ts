type UsageDetailsMetadataType = 'TEXT' | 'DATE' | 'DATETIME' | 'URL' | 'JSON';

interface UsageDetailsMetadataSchema {
    name: string;
    label: string;
    type: UsageDetailsMetadataType;
}

interface UsageDetails {
    label: string;
    url: string;
    metadata: UsageDetailsMetadata[];
}

interface UsageDetailsMetadata {
    name: string;
    value: string;
}

interface UsageDetailsGroup extends GraphQlEntity {
    __typename: 'UsageDetailsGroup';
    serviceId: string;
    label: string;
    metadataSchema: UsageDetailsMetadataSchema[];
    usages: UsageDetails[];
}

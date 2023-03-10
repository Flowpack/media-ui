export enum UsageDetailsMetadataType {
    TEXT = 'TEXT',
    DATE = 'DATE',
    DATETIME = 'DATETIME',
    URL = 'URL',
    JSON = 'JSON',
}

export interface UsageDetailsMetadataSchema {
    name: string;
    label: string;
    type: UsageDetailsMetadataType;
}

export interface UsageDetails {
    label: string;
    url: string;
    metadata: UsageDetailsMetadata[];
}

export interface UsageDetailsMetadata {
    name: string;
    value: string;
}

export interface UsageDetailsGroup extends GraphQlEntity {
    __typename: 'UsageDetailsGroup';
    serviceId: string;
    label: string;
    metadataSchema: UsageDetailsMetadataSchema[];
    usages: UsageDetails[];
}

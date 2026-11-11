type MetaDataPropertyType = 'MetaDataProperty';

interface MetaDataProperty extends GraphQlEntity {
    __typename: MetaDataPropertyType;
    propertyName: string;
    propertyLabel: string;
    value: string;
    inheritedValue?: string | null;
}

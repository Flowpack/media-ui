import { gql } from '@apollo/client';

export const META_DATA_PROPERTY_FRAGMENT = gql`
    fragment MetaDataPropertyProps on MetaDataProperty {
        propertyName
        propertyLabel
        value
        inheritedValue
    }
`;

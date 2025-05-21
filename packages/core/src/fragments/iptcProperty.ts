import { gql } from '@apollo/client';

export const IPTC_PROPERTY_FRAGMENT = gql`
    fragment IptcPropertyProps on IptcProperty {
        propertyName
        value
    }
`;

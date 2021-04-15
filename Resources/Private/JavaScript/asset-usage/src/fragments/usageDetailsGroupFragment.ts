import { gql } from '@apollo/client';

const USAGE_DETAILS_GROUP_FRAGMENT = gql`
    fragment UsageDetailsGroupProps on UsageDetailsGroup {
        serviceId
        label
        metadataSchema {
            name
            label
            type
        }
        usages {
            label
            url
            metadata {
                name
                value
            }
        }
    }
`;

export default USAGE_DETAILS_GROUP_FRAGMENT;

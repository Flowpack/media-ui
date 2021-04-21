import { gql } from '@apollo/client';

const CONFIG = gql`
    query CONFIG {
        config {
            uploadMaxFileSize
            supportsFastAssetUsageCalculation
        }
    }
`;

export default CONFIG;

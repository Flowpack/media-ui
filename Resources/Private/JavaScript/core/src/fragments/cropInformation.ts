import { gql } from '@apollo/client';

export const CROP_INFORMATION_FRAGMENT = gql`
    fragment CropInformationProps on CropInformation {
        width
        height
        x
        y
    }
`;

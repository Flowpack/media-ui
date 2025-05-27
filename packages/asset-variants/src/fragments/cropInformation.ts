import { gql } from '@apollo/client';

const CROP_INFORMATION_FRAGMENT = gql`
    fragment CropInformationProps on CropInformation {
        width
        height
        x
        y
    }
`;

export default CROP_INFORMATION_FRAGMENT;

import GraphQlEntity from './GraphQLEntity';

type AssetVariantType = 'AssetVariant';
type CropInformationType = 'CropInformation';

export default interface AssetVariant extends GraphQlEntity {
    __typename: AssetVariantType;
    readonly id: string;
    readonly presetIdentifier: string;
    readonly variantName: string;
    readonly hasCrop: boolean;

    width?: number;
    height?: number;

    previewUrl?: string;
    cropInformation: {
        __typename: CropInformationType;
        width: number;
        height: number;
        x: number;
        y: number;
    };
}

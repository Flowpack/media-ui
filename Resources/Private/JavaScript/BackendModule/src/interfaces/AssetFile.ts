import { Image } from './index';
import GraphQlEntity from './GraphQLEntity';

type AssetFileType = 'AssetFile';

export default interface AssetFile extends GraphQlEntity {
    __typename: AssetFileType;
    extension: string;
    mediaType: string;
    typeIcon: Image;
    size?: number;
    url: string;
}

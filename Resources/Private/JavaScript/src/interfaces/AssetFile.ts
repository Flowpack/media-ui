import { Image } from './index';

export default interface AssetFile {
    extension: string;
    mediaType: string;
    typeIcon: Image;
    size?: number;
    url: string;
}

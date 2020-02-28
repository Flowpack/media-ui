import Asset from './Asset';
import Tag from './Tag';

export default interface AssetCollection {
    readonly title: string;
    tags?: Tag[];
    assets?: Asset[];
}

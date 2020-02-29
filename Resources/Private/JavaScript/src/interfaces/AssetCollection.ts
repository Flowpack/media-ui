import Tag from './Tag';
import Asset from './Asset';

export default interface AssetCollection {
    readonly title: string;
    tags?: Tag[];
    assets?: Asset[];
}

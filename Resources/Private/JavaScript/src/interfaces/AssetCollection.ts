import { Tag } from './index';

export default interface AssetCollection {
    readonly title: string;
    tags?: Tag[];
}

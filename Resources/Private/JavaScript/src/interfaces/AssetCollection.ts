import { Tag } from './index';

export default interface AssetCollection {
    readonly id: string;
    readonly title: string;
    tags?: Tag[];
}

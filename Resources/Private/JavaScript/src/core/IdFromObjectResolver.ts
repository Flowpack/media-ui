import { Asset, AssetCollection, AssetFile, AssetSource, GraphQlEntity, Image, Tag } from '../interfaces';
import { defaultDataIdFromObject } from 'apollo-cache-inmemory';

/**
 * This resolver is used by the Apollo Cache to allow identifying
 * the entities for modification, especially for optimistic responses.
 */
export default function IdFromObjectResolver(object: GraphQlEntity) {
    const id = `${object.__typename}_`;
    switch (object.__typename) {
        case 'Tag':
            return id + (object as Tag).label;
        case 'Asset':
            return id + (object as Asset).id;
        case 'AssetCollection':
            return id + (object as AssetCollection).title;
        case 'AssetSource':
            return id + (object as AssetSource).id;
        case 'Image':
            return id + (object as Image).url;
        case 'AssetFile':
            return id + (object as AssetFile).url;
        default:
            return defaultDataIdFromObject(object);
    }
}

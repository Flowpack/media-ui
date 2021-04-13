import { AssetFile, Image } from '@media-ui/core/src/interfaces';
import { defaultDataIdFromObject } from '@apollo/client';

/**
 * This resolver is used by the Apollo Cache to allow identifying
 * the entities for modification, especially for optimistic responses.
 *
 * This is only helpful for entities without unique ids
 */
export default function IdFromObjectResolver(object) {
    const id = `${object.__typename}_`;
    switch (object.__typename) {
        case 'Image':
            return id + (object as Image).url;
        case 'AssetFile':
            return id + (object as AssetFile).url;
        default:
            return defaultDataIdFromObject(object);
    }
}

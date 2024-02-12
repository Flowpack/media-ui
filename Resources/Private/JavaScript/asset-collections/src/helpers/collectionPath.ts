export function collectionPath(collection: AssetCollection, collections: AssetCollection[]) {
    const path: { title: string; id: string }[] = [];
    const idsInPath = [];

    // Build the absolute path from the given collection to the root
    let parentCollection = collection;
    while (parentCollection) {
        if (idsInPath.includes(parentCollection.id)) {
            throw new Error('Circular reference detected in collection path');
        }
        path.push({ title: parentCollection.title, id: parentCollection.id });
        idsInPath.push(parentCollection.id);
        parentCollection = parentCollection.parent
            ? collections.find(({ id }) => id === parentCollection.parent.id)
            : null;
    }
    return path.reverse();
}

export function isChildOfCollection(
    collection: AssetCollection,
    parentId: AssetCollectionId,
    collections: AssetCollection[]
): boolean {
    let parentCollection = collection;
    while (parentCollection) {
        if (parentCollection.id === parentId) {
            return true;
        }
        parentCollection = parentCollection.parent
            ? collections.find(({ id }) => id === parentCollection.parent.id)
            : null;
    }
    return false;
}

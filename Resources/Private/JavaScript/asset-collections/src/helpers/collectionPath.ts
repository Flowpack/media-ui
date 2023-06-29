export function collectionPath(collection: AssetCollection, collections: AssetCollection[]) {
    const path: { title: string; id: string }[] = [];

    // Build the absolute path from the given collection to the root
    let parentCollection = collection;
    while (parentCollection) {
        path.push({ title: parentCollection.title, id: parentCollection.id });
        parentCollection = parentCollection.parent
            ? collections.find(({ id }) => id === parentCollection.parent.id)
            : null;
    }
    return path.reverse();
}

import { gql } from '@apollo/client';

export const SELECTED_COLLECTION_ID = gql`
    query SelectedCollectionId {
        selectedCollectionId @client(always: true)
    }
`;

export const SET_SELECTED_COLLECTION_ID = gql`
    mutation SetSelectedCollectionId($collectionId: String) {
        setSelectedCollectionId(selectedCollectionId: $collectionId) @client
    }
`;

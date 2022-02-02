import { gql } from '@apollo/client';

export const SELECTED_TAG_ID = gql`
    query SelectedTagId {
        selectedTagId @client(always: true)
    }
`;

export const SET_SELECTED_TAG_ID = gql`
    mutation SetSelectedTagId($tagId: String) {
        setSelectedTagId(selectedTagId: $tagId) @client
    }
`;

import { gql } from '@apollo/client';

export const VIEW_MODE_SELECTION = gql`
    query ViewModeSelection {
        viewModeSelection @client(always: true)
    }
`;

export const SET_VIEW_MODE_SELECTION = gql`
    mutation SetViewModeSelection($viewModeSelection: String) {
        setViewModeSelection(viewModeSelection: $viewModeSelection) @client
    }
`;

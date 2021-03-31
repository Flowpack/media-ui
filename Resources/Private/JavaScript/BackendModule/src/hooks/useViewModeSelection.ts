import { useMutation, useQuery } from '@apollo/client';
import { ExecutionResult } from 'graphql';

import { SET_VIEW_MODE_SELECTION, VIEW_MODE_SELECTION } from '../queries';

export enum VIEW_MODES {
    Thumbnails = 'thumbnails',
    List = 'list'
}

export default function useViewModeSelection(): [VIEW_MODES, (viewMode: VIEW_MODES) => Promise<ExecutionResult<any>>] {
    const viewModeSelectionQuery = useQuery(VIEW_MODE_SELECTION);
    const { viewModeSelection } = viewModeSelectionQuery.data;
    const [mutateViewModeSelection] = useMutation(SET_VIEW_MODE_SELECTION);
    const setViewModeSelection = (viewMode: VIEW_MODES) =>
        mutateViewModeSelection({
            variables: { viewModeSelection: viewMode }
        });
    return [viewModeSelection, setViewModeSelection];
}

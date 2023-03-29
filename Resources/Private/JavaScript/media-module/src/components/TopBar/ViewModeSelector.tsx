import React from 'react';
import { useRecoilState } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';

import { VIEW_MODES, viewModeState } from '../../state';

import classes from './ViewModeSelector.module.css';

const ViewModeSelector: React.FC = () => {
    const { translate } = useIntl();
    const [viewModeSelection, setViewModeSelection] = useRecoilState(viewModeState);

    return (
        <div className={classes.viewModeSelector}>
            <IconButton
                icon={viewModeSelection === VIEW_MODES.List ? 'th' : 'th-list'}
                size="regular"
                title={translate(
                    `viewModeSelector.viewMode.${
                        viewModeSelection === VIEW_MODES.List ? VIEW_MODES.Thumbnails : VIEW_MODES.List
                    }`,
                    `Switch mode`
                )}
                style="neutral"
                hoverStyle="brand"
                onClick={() =>
                    setViewModeSelection((prev) => (prev === VIEW_MODES.List ? VIEW_MODES.Thumbnails : VIEW_MODES.List))
                }
            />
        </div>
    );
};

export default React.memo(ViewModeSelector);

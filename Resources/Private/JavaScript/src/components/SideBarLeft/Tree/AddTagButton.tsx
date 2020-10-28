import * as React from 'react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';
import { createTagDialogState } from '../../../state';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    plusIcon: {
        top: '13px !important',
        left: '11px !important',
        width: '9px !important'
    }
}));

const AssetCollectionTree: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const setCreateTagDialogState = useSetRecoilState(createTagDialogState);

    const onClickCreate = useCallback(() => {
        setCreateTagDialogState({ title: '', visible: true });
    }, [setCreateTagDialogState]);

    return (
        <Button
            size="regular"
            style="transparent"
            hoverStyle="brand"
            title={translate('assetCollectionTree.toolbar.createTag', 'Create new tag')}
            onClick={onClickCreate}
        >
            <span className="fa-layers fa-fw">
                <Icon icon="tag" />
                <Icon icon="plus" color="primaryBlue" className={classes.plusIcon} />
            </span>
        </Button>
    );
};

export default React.memo(AssetCollectionTree);

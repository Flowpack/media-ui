import * as React from 'react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';
import { createAssetCollectionDialogState } from '../../../state';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    plusIcon: {
        top: '15px !important',
        left: '13px !important',
        width: '9px !important'
    }
}));

const AssetCollectionTree: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const setCreateAssetCollectionDialogState = useSetRecoilState(createAssetCollectionDialogState);

    const onClickCreate = useCallback(() => {
        setCreateAssetCollectionDialogState({ title: '', visible: true });
    }, [setCreateAssetCollectionDialogState]);

    return (
        <Button
            size="regular"
            style="transparent"
            hoverStyle="brand"
            title={translate('assetCollectionTree.toolbar.createAssetCollection', 'Create new asset collection')}
            onClick={onClickCreate}
        >
            <span className="fa-layers fa-fw">
                <Icon icon="folder" />
                <Icon icon="plus" color="primaryBlue" className={classes.plusIcon} />
            </span>
        </Button>
    );
};

export default React.memo(AssetCollectionTree);

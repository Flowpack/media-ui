import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';

import { createAssetCollectionDialogVisibleState } from '../state/createAssetCollectionDialogVisibleState';
import { assetCollectionTreeViewState } from '../state/assetCollectionTreeViewState';

import classes from './AddAssetCollectionButton.module.css';

const AddAssetCollectionButton: React.FC = () => {
    const { translate } = useIntl();
    const setCreateAssetCollectionDialogState = useSetRecoilState(createAssetCollectionDialogVisibleState);
    const assetCollectionTreeView = useRecoilValue(assetCollectionTreeViewState);

    return (
        <Button
            size="regular"
            style="transparent"
            hoverStyle="brand"
            title={translate('assetCollectionTree.toolbar.createAssetCollection', 'Create new asset collection')}
            onClick={() => setCreateAssetCollectionDialogState(true)}
            disabled={assetCollectionTreeView !== 'collections'}
        >
            <span className="fa-layers fa-fw">
                <Icon icon="folder" />
                <Icon icon="plus" color="primaryBlue" className={classes.plusIcon} />
            </span>
        </Button>
    );
};

export default React.memo(AddAssetCollectionButton);

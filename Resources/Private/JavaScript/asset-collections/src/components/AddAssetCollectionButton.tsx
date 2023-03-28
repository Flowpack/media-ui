import React from 'react';
import { useSetRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';

import createAssetCollectionDialogVisibleState from '../state/createAssetCollectionDialogVisibleState';

import classes from './AddAssetCollectionButton.module.css';

const AddAssetCollectionButton: React.FC = () => {
    const { translate } = useIntl();
    const setCreateAssetCollectionDialogState = useSetRecoilState(createAssetCollectionDialogVisibleState);

    return (
        <Button
            size="regular"
            style="transparent"
            hoverStyle="brand"
            title={translate('assetCollectionTree.toolbar.createAssetCollection', 'Create new asset collection')}
            onClick={() => setCreateAssetCollectionDialogState(true)}
        >
            <span className="fa-layers fa-fw">
                <Icon icon="folder" />
                <Icon icon="plus" color="primaryBlue" className={classes.plusIcon} />
            </span>
        </Button>
    );
};

export default React.memo(AddAssetCollectionButton);

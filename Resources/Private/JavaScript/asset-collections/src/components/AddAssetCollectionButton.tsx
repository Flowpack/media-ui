import React, { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';

import createAssetCollectionDialogVisibleState from '../state/createAssetCollectionDialogVisibleState';

import './AddAssetCollectionButton.module.css';

const AddAssetCollectionButton: React.FC = () => {
    const { translate } = useIntl();
    const setCreateAssetCollectionDialogState = useSetRecoilState(createAssetCollectionDialogVisibleState);

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
                <Icon icon="plus" color="primaryBlue" className="plusIcon" />
            </span>
        </Button>
    );
};

export default React.memo(AddAssetCollectionButton);

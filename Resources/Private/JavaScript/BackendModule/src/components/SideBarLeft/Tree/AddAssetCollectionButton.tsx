import * as React from 'react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles } from '@media-ui/core/src';

import { createAssetCollectionDialogState } from '../../../state';

const useStyles = createUseMediaUiStyles({
    plusIcon: {
        top: '15px !important',
        left: '13px !important',
        width: '9px !important',
    },
});

const AddAssetCollectionButton: React.FC = () => {
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

export default React.memo(AddAssetCollectionButton);

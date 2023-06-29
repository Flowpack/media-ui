import React, { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { createTagDialogState, selectedTagIdState } from '@media-ui/feature-asset-tags';

import classes from './AddTagButton.module.css';

const AddTagButton: React.FC = () => {
    const { translate } = useIntl();
    const setCreateTagDialogState = useSetRecoilState(createTagDialogState);
    const selectedTagId = useRecoilValue(selectedTagIdState);

    const onClickCreate = useCallback(() => {
        setCreateTagDialogState({ label: '', visible: true });
    }, [setCreateTagDialogState]);

    return (
        <Button
            size="regular"
            style="transparent"
            hoverStyle="brand"
            title={translate('assetCollectionTree.toolbar.createTag', 'Create new tag')}
            onClick={onClickCreate}
            disabled={selectedTagId !== null}
        >
            <span className="fa-layers fa-fw">
                <Icon icon="tag" />
                <Icon icon="plus" color="primaryBlue" className={classes.plusIcon} />
            </span>
        </Button>
    );
};

export default React.memo(AddTagButton);

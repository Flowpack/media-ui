import React, { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { useConfigQuery } from '@media-ui/core/src/hooks';
import { createTagDialogState, selectedTagIdState } from '@media-ui/feature-asset-tags';

import classes from './AddTagButton.module.css';

const AddTagButton: React.FC = () => {
    const { translate } = useIntl();
    const { config } = useConfigQuery();
    const setCreateTagDialogState = useSetRecoilState(createTagDialogState);
    const selectedTagId = useRecoilValue(selectedTagIdState);

    const onClickCreate = useCallback(() => {
        setCreateTagDialogState({
            visible: true,
            label: '',
            tags: [],
            validation: {
                valid: false,
                errors: [],
            },
        });
    }, [setCreateTagDialogState]);

    return (
        <Button
            size="regular"
            style="transparent"
            hoverStyle="brand"
            title={translate('assetCollectionTree.toolbar.createTag', 'Create new tag')}
            onClick={onClickCreate}
            disabled={!config.canManageTags || selectedTagId !== null}
        >
            <span className="fa-layers fa-fw">
                <Icon icon="tag" />
                <Icon icon="plus" color="primaryBlue" className={classes.plusIcon} />
            </span>
        </Button>
    );
};

export default React.memo(AddTagButton);

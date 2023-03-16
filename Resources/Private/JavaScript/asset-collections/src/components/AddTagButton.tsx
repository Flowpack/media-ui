import * as React from 'react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';
import { createTagDialogState } from '@media-ui/feature-asset-tags';

import './AddTagButton.module.css';

const AddTagButton: React.FC = () => {
    const { translate } = useIntl();
    const setCreateTagDialogState = useSetRecoilState(createTagDialogState);

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
        >
            <span className="fa-layers fa-fw">
                <Icon icon="tag" />
                <Icon icon="plus" color="primaryBlue" className="plusIcon" />
            </span>
        </Button>
    );
};

export default React.memo(AddTagButton);

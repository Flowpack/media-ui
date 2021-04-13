import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { Button, Dialog } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { useSelectedAsset } from '@media-ui/core/src/hooks';

import assetUsageModalState from '../state/assetUsageModalState';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    assetUsage: {
        padding: theme.spacing.full,
    },
}));

const AssetUsageModal: React.FC = () => {
    const classes = useStyles();
    const [isOpen, setIsOpen] = useRecoilState(assetUsageModalState);
    const asset = useSelectedAsset();
    const { translate } = useIntl();

    const handleRequestClose = useCallback(() => setIsOpen((prev) => !prev), [setIsOpen]);

    return (
        <Dialog
            isOpen={isOpen}
            title={translate('assetUsage.title', 'Asset usage for {asset}', { asset: asset.label })}
            onRequestClose={handleRequestClose}
            style="wide"
            actions={[
                <Button key="cancel" style="neutral" hoverStyle="darken" onClick={handleRequestClose}>
                    {translate('assetUsage.cancel', 'Cancel')}
                </Button>,
            ]}
        >
            <section className={classes.assetUsage}>Hi</section>
        </Dialog>
    );
};

export default React.memo(AssetUsageModal);

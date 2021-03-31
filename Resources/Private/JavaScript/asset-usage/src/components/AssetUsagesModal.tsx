import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { Button, Dialog } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { useSelectedAsset } from '@media-ui/core/src/hooks';

import assetUsageDetailsModalState from '../state/assetUsageDetailsModalState';
import useAssetUsagesQuery from '../hooks/useAssetUsages';
import AssetUsageSection from './AssetUsageSection';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    assetUsage: {
        padding: theme.spacing.full,
        '& section + section': {
            marginTop: theme.spacing.full,
        },
    },
    usageTable: {
        width: '100%',
        '& th': {
            fontWeight: 'bold',
        },
        '& td, & th': {
            padding: theme.spacing.quarter,
            '&:first-child': {
                paddingLeft: 0,
            },
            '&:last-child': {
                paddingRight: 0,
            },
        },
        '.neos & a': {
            color: theme.colors.primary,
            '&:hover': {
                color: theme.colors.primary,
                textDecoration: 'underline',
            },
        },
    },
}));

const AssetUsagesModal: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const [isOpen, setIsOpen] = useRecoilState(assetUsageDetailsModalState);
    const asset = useSelectedAsset();
    const { assetUsageDetails, loading } = useAssetUsagesQuery(
        asset ? { assetId: asset.id, assetSourceId: asset.assetSource.id } : null
    );

    const handleRequestClose = useCallback(() => setIsOpen(false), [setIsOpen]);

    return (
        <Dialog
            isOpen={isOpen}
            title={translate('assetUsage.title', `Usage details for ${asset.label}`, { asset: asset.label })}
            onRequestClose={handleRequestClose}
            style="wide"
            actions={[
                <Button key="cancel" style="neutral" hoverStyle="darken" onClick={handleRequestClose}>
                    {translate('assetUsage.cancel', 'Cancel')}
                </Button>,
            ]}
        >
            <div className={classes.assetUsage}>
                {assetUsageDetails?.length > 0 ? (
                    assetUsageDetails.map((usageDetailsGroup, index) => (
                        <AssetUsageSection key={index} usageDetailsGroup={usageDetailsGroup} />
                    ))
                ) : (
                    <span>
                        {loading
                            ? translate('assetUsagesModal.loading', 'Loading...')
                            : translate('assetUsagesModal.noResults', 'No results')}
                    </span>
                )}
            </div>
        </Dialog>
    );
};

export default React.memo(AssetUsagesModal);
